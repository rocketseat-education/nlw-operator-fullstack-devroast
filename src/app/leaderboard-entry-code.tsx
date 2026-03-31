"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

const COLLAPSED_HEIGHT = 120;
const COLLAPSIBLE_THRESHOLD = 5;

type LeaderboardEntryCodeProps = {
  children: ReactNode;
  lineCount: number;
};

function LeaderboardEntryCode({
  children,
  lineCount,
}: LeaderboardEntryCodeProps) {
  const [open, setOpen] = useState(false);

  if (lineCount <= COLLAPSIBLE_THRESHOLD) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col">
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={open ? { maxHeight: "none" } : { maxHeight: COLLAPSED_HEIGHT }}
      >
        {children}

        {/* Gradient fade — visible only when collapsed */}
        {!open && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-bg-input to-transparent"
            aria-hidden
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center gap-1.5 w-full py-2 border-t border-border-primary font-mono text-xs text-text-secondary enabled:hover:bg-bg-elevated enabled:hover:text-text-primary transition-colors cursor-pointer"
      >
        {open ? "show less" : "show more"}
        <ChevronDown
          size={12}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}

export { LeaderboardEntryCode };
