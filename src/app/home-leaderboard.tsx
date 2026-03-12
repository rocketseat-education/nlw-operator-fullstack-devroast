import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";
import { caller } from "@/trpc/server";
import { LeaderboardEntryCode } from "./leaderboard-entry-code";

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

async function HomeLeaderboard() {
  "use cache";
  cacheLife("hourly");
  cacheTag("roast-data");

  const { entries, totalCount } = await caller.roast.getLeaderboard({});

  return (
    <>
      {/* Leaderboard Entries */}
      <div className="flex flex-col gap-5">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="flex flex-col border border-border-primary overflow-hidden"
          >
            {/* Meta Row */}
            <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[13px] text-text-tertiary">
                    #
                  </span>
                  <span className="font-mono text-[13px] font-bold text-accent-amber">
                    {entry.rank}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-text-tertiary">
                    score:
                  </span>
                  <span
                    className={`font-mono text-[13px] font-bold ${scoreColor(entry.score)}`}
                  >
                    {entry.score.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-secondary">
                  {entry.language}
                </span>
                <span className="font-mono text-xs text-text-tertiary">
                  {entry.lineCount} lines
                </span>
              </div>
            </div>

            {/* Code Preview with Collapsible */}
            <LeaderboardEntryCode lineCount={entry.lineCount}>
              <CodeBlock
                code={entry.code}
                lang={entry.language as BundledLanguage}
                className="border-0"
              />
            </LeaderboardEntryCode>
          </article>
        ))}
      </div>

      {/* Fade Hint */}
      <p className="font-mono text-xs text-text-tertiary text-center">
        showing top 3 of {totalCount.toLocaleString()} ·{" "}
        <Link
          href="/leaderboard"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          view full leaderboard {">>"}
        </Link>
      </p>
    </>
  );
}

export { HomeLeaderboard };
