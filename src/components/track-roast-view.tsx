"use client";

import { useEffect } from "react";
import { posthog } from "@/lib/posthog";

function TrackRoastView({
  score,
  verdict,
  language,
}: {
  score: number;
  verdict: string;
  language: string;
}) {
  useEffect(() => {
    posthog.capture("roast_viewed", {
      score,
      verdict,
      language,
    });
  }, [score, verdict, language]);

  return null;
}

export { TrackRoastView };
