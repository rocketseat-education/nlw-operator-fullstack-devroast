import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { rateLimiter } from "@/lib/rate-limit";

export const createTRPCContext = cache(async () => {
  return { db };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

const rateLimitMiddleware = t.middleware(async ({ next }) => {
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

  return next();
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const rateLimitedProcedure = t.procedure.use(rateLimitMiddleware);
