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

export const programmingLevelEnum = pgEnum("programming_level", [
  "Iniciante",
  "Atuo na área há menos de 2 anos",
  "Atuo na área há mais de 2 anos",
]);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid().defaultRandom().primaryKey(),
    sessionId: varchar({ length: 255 }).unique().notNull(),
    email: varchar({ length: 255 }),
    firstName: varchar({ length: 255 }),
    lastName: varchar({ length: 255 }),
    phone: varchar({ length: 20 }),
    programmingLevel: programmingLevelEnum(),
    requestCount: integer().default(1).notNull(),
    hubspotContactId: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("user_profiles_session_idx").on(table.sessionId)],
);
