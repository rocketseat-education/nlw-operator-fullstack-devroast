"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { posthog } from "@/lib/posthog";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;

      const search = searchParams.toString();
      if (search) {
        url = `${url}?${search}`;
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

export { PostHogPageView };
