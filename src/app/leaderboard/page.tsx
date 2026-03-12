import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";
import { caller } from "@/trpc/server";
import { LeaderboardEntryCode } from "../leaderboard-entry-code";

export const metadata: Metadata = {
  title: "Shame Leaderboard — DevRoast",
  description:
    "The most roasted code on the internet. See the worst-scored submissions ranked by shame.",
};

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

export default async function LeaderboardPage() {
  "use cache";
  cacheLife("hourly");
  cacheTag("roast-data");

  const [{ totalRoasts, avgScore }, { entries }] = await Promise.all([
    caller.roast.getStats(),
    caller.roast.getLeaderboard({ limit: 20 }),
  ]);

  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-col gap-10 w-full max-w-6xl mx-auto px-10 md:px-20 py-10">
        {/* Hero Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[32px] font-bold text-accent-green">
              {">"}
            </span>
            <h1 className="font-mono text-[28px] font-bold text-text-primary">
              shame_leaderboard
            </h1>
          </div>

          <p className="font-mono text-sm text-text-secondary">
            {"// the most roasted code on the internet"}
          </p>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-tertiary">
              {totalRoasts.toLocaleString()} submissions
            </span>
            <span className="font-mono text-xs text-text-tertiary">{"·"}</span>
            <span className="font-mono text-xs text-text-tertiary">
              avg score: {avgScore.toFixed(1)}/10
            </span>
          </div>
        </section>

        {/* Leaderboard Entries */}
        <section className="flex flex-col gap-5">
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
        </section>
      </div>
    </main>
  );
}
