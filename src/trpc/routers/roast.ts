import {
  observe,
  propagateAttributes,
  setActiveTraceIO,
} from "@langfuse/tracing";
import { TRPCError } from "@trpc/server";
import { generateText, Output } from "ai";
import { asc, avg, count, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { analysisItems, roasts } from "@/db/schema";
import {
  getSystemPrompt,
  MODERATION_PROMPT,
  model,
  moderationOutputSchema,
  roastOutputSchema,
} from "@/lib/ai";
import { LANGUAGES } from "@/lib/languages";
import { rateLimiter } from "@/lib/rate-limit";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastRouter = createTRPCRouter({
  getStats: baseProcedure.query(async ({ ctx }) => {
    const [stats] = await ctx.db
      .select({
        totalRoasts: count(),
        avgScore: avg(roasts.score),
      })
      .from(roasts);

    return {
      totalRoasts: stats.totalRoasts,
      avgScore: stats.avgScore ? Number.parseFloat(stats.avgScore) : 0,
    };
  }),

  getLeaderboard: baseProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(3) }))
    .query(async ({ ctx, input }) => {
      const [entries, [{ total }]] = await Promise.all([
        ctx.db
          .select({
            id: roasts.id,
            code: roasts.code,
            score: roasts.score,
            language: roasts.language,
          })
          .from(roasts)
          .orderBy(asc(roasts.score))
          .limit(input.limit),
        ctx.db.select({ total: count() }).from(roasts),
      ]);

      return {
        entries: entries.map((entry, index) => ({
          ...entry,
          rank: index + 1,
          lineCount: entry.code.split("\n").length,
        })),
        totalCount: total,
      };
    }),

  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(1).max(2000),
        language: z
          .string()
          .refine((key) => key in LANGUAGES, "Invalid language"),
        roastMode: z.boolean(),
      }),
    )
    .mutation(
      observe(
        async ({ ctx, input }) => {
          setActiveTraceIO({
            input: {
              language: input.language,
              roastMode: input.roastMode,
              codeLength: input.code.length,
            },
          });

          if (rateLimiter) {
            const headersList = await headers();
            const ip =
              headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
              headersList.get("x-real-ip") ??
              "unknown";

            const { success } = await rateLimiter.limit(ip);

            if (!success) {
              throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message:
                  "Calma aí, cowboy! Você já fritou código demais. Volte em 1 minuto.",
              });
            }
          }

          const { output: moderation } = await propagateAttributes(
            {
              metadata: { step: "moderation" },
            },
            () =>
              generateText({
                model,
                maxOutputTokens: 50,
                output: Output.object({ schema: moderationOutputSchema }),
                system: MODERATION_PROMPT,
                prompt: input.code,
                experimental_telemetry: { isEnabled: true },
              }),
          );

          if (moderation?.status === "not_code") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "not_code",
            });
          }

          if (moderation?.status === "nsfw") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "nsfw",
            });
          }

          const { output } = await propagateAttributes(
            {
              metadata: {
                step: "review",
                language: input.language,
                roastMode: String(input.roastMode),
              },
            },
            () =>
              generateText({
                model,
                maxOutputTokens: 2000,
                output: Output.object({ schema: roastOutputSchema }),
                system: getSystemPrompt(input.roastMode),
                prompt: `Language: ${input.language}\n\nCode:\n${input.code}`,
                experimental_telemetry: { isEnabled: true },
              }),
          );

          if (!output) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "AI failed to generate a valid response",
            });
          }

          const lineCount = input.code.split("\n").length;

          const [roast] = await ctx.db
            .insert(roasts)
            .values({
              code: input.code,
              language: input.language,
              lineCount,
              roastMode: input.roastMode,
              score: output.score,
              verdict: output.verdict,
              roastQuote: output.roastQuote,
              suggestedFix: output.suggestedFix,
            })
            .returning({ id: roasts.id });

          if (output.analysisItems.length > 0) {
            await ctx.db.insert(analysisItems).values(
              output.analysisItems.map((item, index) => ({
                roastId: roast.id,
                severity: item.severity,
                title: item.title,
                description: item.description,
                order: index,
              })),
            );
          }

          revalidateTag("roast-data", "hourly");

          setActiveTraceIO({
            output: {
              roastId: roast.id,
              score: output.score,
              verdict: output.verdict,
            },
          });

          return { id: roast.id };
        },
        { name: "roast.create" },
      ),
    ),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [roast] = await ctx.db
        .select()
        .from(roasts)
        .where(eq(roasts.id, input.id));

      if (!roast) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Roast not found",
        });
      }

      const items = await ctx.db
        .select()
        .from(analysisItems)
        .where(eq(analysisItems.roastId, roast.id))
        .orderBy(asc(analysisItems.order));

      return {
        ...roast,
        analysisItems: items,
      };
    }),
});
