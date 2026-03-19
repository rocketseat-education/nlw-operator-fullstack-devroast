import { openai } from "@ai-sdk/openai";
import { z } from "zod";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const moderationModel = openai("gpt-4o-mini");
export const roastModel = openai("gpt-4o-mini");

export const roastOutputSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: z.enum([
    "needs_serious_help",
    "rough_around_edges",
    "decent_code",
    "solid_work",
    "exceptional",
  ]),
  roastQuote: z.string().max(500),
  analysisItems: z.array(
    z.object({
      severity: z.enum(["critical", "warning", "good"]),
      title: z.string().max(200),
      description: z.string().max(2000),
    }),
  ),
  suggestedFix: z.string().max(5000),
});

export type RoastOutput = z.infer<typeof roastOutputSchema>;

export const moderationOutputSchema = z.object({
  status: z.enum(["ok", "not_code", "nsfw"]),
});

export const MODERATION_PROMPT = `You are a content moderation system for a code review platform called DevRoast.

Your job is to classify user-submitted content into one of three categories:

1. "ok" — The submission is valid source code (any programming language, markup, config files, SQL, shell scripts, etc.). It may be bad code, incomplete, or have bugs — that's fine, it's still code. Minor comments or variable names with mild language are acceptable.

2. "not_code" — The submission is NOT code at all. Examples: plain prose, essays, random gibberish, song lyrics, recipes, chat messages, lorem ipsum, repeated characters with no programming structure, or any text that has no recognizable programming syntax.

3. "nsfw" — The submission contains code OR text with clearly inappropriate content. This includes:
   - Pornographic or sexual material
   - Extreme violence or gore
   - Hate speech, slurs, or targeted harassment
   - Illegal activities (drug manufacturing, hacking instructions targeting real systems, exploit code designed to harm)
   - Content that sexualizes minors
   - Political content, political opinions, or references to political figures (e.g. "Bolsonaro", "Lula", "Trump", election slogans, partisan messages)
   - Ideological or activist messages (e.g. drug legalization advocacy, religious proselytizing, extremist rhetoric)
   - Profanity, slurs, or offensive language used as the primary content (not as incidental variable names in real code)
   Check for inappropriate content in code comments, variable names, string literals, and any part of the submission. Check not only in English, but in any language.

Rules:
- When in doubt between "ok" and "not_code", lean towards "ok" if there is ANY recognizable code structure (brackets, semicolons, keywords, indentation patterns).
- When in doubt between "ok" and "nsfw", lean towards "nsfw". This content will be available for a large audience, including minors. Some leniency towards "nsfw" is appropriate to keep the platform safe and welcoming.
- Code that is technically valid but exists solely as a vehicle for inappropriate content (e.g. a print statement printing a political slogan, variables named with slurs) should be classified as "nsfw".
- Respond ONLY with the status field. No explanations.`;

export function getSystemPrompt(roastMode: boolean): string {
  const base = `You are an expert code reviewer. Analyze the submitted code and provide a structured review.

Rules:
- Score from 0.0 to 10.0 (one decimal place). 0 = catastrophic, 10 = flawless.
- Pick the verdict that matches the score:
  - 0-2: "needs_serious_help"
  - 2.1-4: "rough_around_edges"
  - 4.1-6: "decent_code"
  - 6.1-8: "solid_work"
  - 8.1-10: "exceptional"
- Generate 3-6 analysis items ordered by severity (critical first, then warning, then good).
  - Each item has a severity ("critical", "warning", or "good"), a short title, and a 1-2 sentence description.
- Generate a suggestedFix: the complete improved/corrected version of the submitted code. Keep the same language and intent but fix the issues you identified.
- The roastQuote is a one-liner summary of the code quality.`;

  if (roastMode) {
    return `${base}

ROAST MODE ENABLED: Be brutally sarcastic and funny. The roastQuote should be a memorable, savage one-liner that would make a developer cry-laugh. Analysis descriptions should be witty and cutting while still being technically accurate. Channel your inner senior developer who's seen too much bad code. Use developer humor, pop culture references, and exaggeration.`;
  }

  return `${base}

Be professional, direct, and constructive. The roastQuote should be an honest one-liner summary. Analysis descriptions should be clear and actionable.`;
}
