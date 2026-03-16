import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) return;

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    persistence: "memory",
    capture_pageview: false,
    capture_pageleave: true,
  });
}

export { posthog };
