"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog";

function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return children;
}

export { PostHogProvider };
