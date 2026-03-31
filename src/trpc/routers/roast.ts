import { TRPCError } from "@trpc/server";
import { generateText, Output } from "ai";
import { asc, avg, count, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { analysisItems, roasts, userProfiles } from "@/db/schema";
import { getSystemPrompt, model, roastOutputSchema } from "@/lib/ai";
import { syncContactToHubSpot } from "@/lib/hubspot";
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
        language: z.string(),
        roastMode: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: roastOutputSchema }),
        system: getSystemPrompt(input.roastMode),
        prompt: `Language: ${input.language}\n\nCode:\n${input.code}`,
      });

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

      return { id: roast.id };
    }),

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

  trackRequest: baseProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log("[trackRequest] Received sessionId:", input.sessionId);

      try {
        const [existing] = await ctx.db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.sessionId, input.sessionId))
          .limit(1);

        console.log("[trackRequest] Existing profile:", existing);

        if (existing) {
          // Se o email já está preenchido, significa que o formulário foi submetido
          const isFormSubmitted = !!existing.email;
          if (isFormSubmitted) {
            console.log("[trackRequest] Form already submitted (email exists), not showing modal");
            return {
              requestCount: existing.requestCount,
              shouldShowForm: false,
            };
          }

          const newCount = existing.requestCount + 1;
          console.log("[trackRequest] Incrementing count from", existing.requestCount, "to", newCount);

          await ctx.db
            .update(userProfiles)
            .set({ requestCount: newCount, updatedAt: new Date() })
            .where(eq(userProfiles.sessionId, input.sessionId));

          const shouldShow = newCount === 3;
          console.log("[trackRequest] Returning: requestCount =", newCount, ", shouldShowForm =", shouldShow);

          return {
            requestCount: newCount,
            shouldShowForm: shouldShow,
          };
        }

        console.log("[trackRequest] Creating new profile for sessionId:", input.sessionId);

        await ctx.db.insert(userProfiles).values({
          sessionId: input.sessionId,
          requestCount: 1,
        });

        return {
          requestCount: 1,
          shouldShowForm: false,
        };
      } catch (error) {
        console.error("[trackRequest] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to track request",
        });
      }
    }),

  submitUserProfile: baseProcedure
    .input(
      z.object({
        sessionId: z.string(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        programmingLevel: z.enum([
          "Iniciante",
          "Atuo na área há menos de 2 anos",
          "Atuo na área há mais de 2 anos",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("[submitUserProfile] Received data:", {
          sessionId: input.sessionId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          programmingLevel: input.programmingLevel,
          phone: input.phone,
        });

        // Sync to HubSpot
        console.log("[submitUserProfile] Syncing to HubSpot...");
        const hubspotResult = await syncContactToHubSpot({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          programmingLevel: input.programmingLevel,
        });
        console.log("[submitUserProfile] HubSpot sync successful:", hubspotResult);

        // Update user profile with HubSpot contact ID
        console.log("[submitUserProfile] Updating user profile in database...");
        await ctx.db
          .update(userProfiles)
          .set({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            programmingLevel: input.programmingLevel,
            hubspotContactId: hubspotResult.contactId,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.sessionId, input.sessionId));
        console.log("[submitUserProfile] Profile updated successfully");

        return {
          success: true,
          contactId: hubspotResult.contactId,
        };
      } catch (error) {
        console.error("[submitUserProfile] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to submit user profile",
        });
      }
    }),

  decrementRequestCount: baseProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log("[decrementRequestCount] Decrementing for sessionId:", input.sessionId);

      const [existing] = await ctx.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.sessionId, input.sessionId))
        .limit(1);

      if (existing && existing.requestCount > 1) {
        const newCount = existing.requestCount - 1;
        console.log("[decrementRequestCount] Decrementing count from", existing.requestCount, "to", newCount);

        await ctx.db
          .update(userProfiles)
          .set({ requestCount: newCount, updatedAt: new Date() })
          .where(eq(userProfiles.sessionId, input.sessionId));

        return {
          requestCount: newCount,
          success: true,
        };
      }

      console.log("[decrementRequestCount] Cannot decrement below 1");
      return {
        requestCount: existing?.requestCount ?? 0,
        success: false,
      };
    }),
});
