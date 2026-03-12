import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { HomeEditor } from "./home-editor";
import { HomeLeaderboard } from "./home-leaderboard";
import { HomeLeaderboardSkeleton } from "./home-leaderboard-skeleton";
import { HomeStats } from "./home-stats";

export default async function HomePage() {
  "use cache";
  cacheLife("hourly");
  cacheTag("roast-data");

  prefetch(trpc.roast.getStats.queryOptions());

  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center gap-3 pt-20 px-10">
        <h1 className="flex items-center gap-3 font-mono text-4xl font-bold">
          <span className="text-accent-green">$</span>
          <span className="text-text-primary">
            paste your code. get roasted.
          </span>
        </h1>
        <p className="font-mono text-sm text-text-secondary">
          {
            "// drop your code below and we'll rate it — brutally honest or full roast mode"
          }
        </p>
      </section>

      {/* Editor + Actions */}
      <section className="w-full max-w-5xl px-10 pt-8">
        <HomeEditor />
      </section>

      {/* Footer Stats */}
      <Suspense>
        <HydrateClient>
          <HomeStats />
        </HydrateClient>
      </Suspense>

      {/* Spacer */}
      <div className="h-15" />

      {/* Leaderboard Preview */}
      <section className="flex flex-col gap-6 w-full max-w-5xl px-10 pb-15">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-sm font-bold text-text-primary">
              shame_leaderboard
            </span>
          </div>

          <Link
            href="/leaderboard"
            className="font-mono text-xs text-text-secondary border border-border-primary px-3 py-1.5 hover:bg-bg-elevated transition-colors"
          >
            $ view_all {">>"}
          </Link>
        </div>

        {/* Subtitle */}
        <p className="font-mono text-[13px] text-text-tertiary -mt-2">
          {"// the worst code on the internet, ranked by shame"}
        </p>

        {/* Leaderboard Table + Footer (async, with skeleton fallback) */}
        <Suspense fallback={<HomeLeaderboardSkeleton />}>
          <HomeLeaderboard />
        </Suspense>
      </section>
    </main>
  );
}
