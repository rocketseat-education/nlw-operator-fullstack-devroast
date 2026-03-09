import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const verdictEnum = pgEnum("verdict", [
  "needs_serious_help",
  "rough_around_edges",
  "decent_code",
  "solid_work",
  "exceptional",
]);

export const severityEnum = pgEnum("severity", ["critical", "warning", "good"]);

export const roasts = pgTable(
  "roasts",
  {
    id: uuid().defaultRandom().primaryKey(),
    code: text().notNull(),
    language: varchar({ length: 50 }).notNull(),
    lineCount: integer().notNull(),
    roastMode: boolean().default(false).notNull(),
    score: real().notNull(),
    verdict: verdictEnum().notNull(),
    roastQuote: text(),
    suggestedFix: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("roasts_score_idx").on(table.score)],
);

export const analysisItems = pgTable("analysis_items", {
  id: uuid().defaultRandom().primaryKey(),
  roastId: uuid()
    .references(() => roasts.id, { onDelete: "cascade" })
    .notNull(),
  severity: severityEnum().notNull(),
  title: varchar({ length: 200 }).notNull(),
  description: text().notNull(),
  order: integer().notNull(),
});
