"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter";
import { LANGUAGE_OPTIONS, LANGUAGES } from "@/lib/languages";

const MAX_CHARACTERS = 2000;

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string | null;
  onLanguageChange?: (language: string | null) => void;
  className?: string;
};

function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  className,
}: CodeEditorProps) {
  const { highlight, isReady } = useShikiHighlighter();
  const highlightedRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayLanguage = language
    ? (LANGUAGES[language]?.name ?? language)
    : null;

  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARACTERS;

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 16);

  // Synchronous highlight — no debounce for instant feedback
  const highlightedHtml = useMemo(() => {
    if (!isReady || !value) return "";

    const lang = language ?? "javascript";
    return highlight(value, lang);
  }, [value, language, isReady, highlight]);

  // Show text visibly when highlight is not ready yet
  const hasHighlight = isReady && highlightedHtml.length > 0;

  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Scroll sync: textarea -> highlighted overlay + line numbers
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const highlighted = highlightedRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea) return;

    if (highlighted) {
      highlighted.scrollTop = textarea.scrollTop;
      highlighted.scrollLeft = textarea.scrollLeft;
    }
    if (lineNumbers) {
      lineNumbers.scrollTop = textarea.scrollTop;
    }
  }, []);

  return (
    <div
      className={twMerge(
        "border border-border-primary overflow-hidden flex flex-col",
        className,
      )}
    >
      {/* Window Header */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-border-primary">
        <span className="size-3 rounded-full bg-accent-red" />
        <span className="size-3 rounded-full bg-accent-amber" />
        <span className="size-3 rounded-full bg-accent-green" />
        <span className="flex-1" />

        {/* Language selector */}
        <div className="relative flex items-center">
          <select
            value={language ?? "auto"}
            onChange={(e) => {
              const val = e.target.value;
              onLanguageChange?.(val === "auto" ? null : val);
            }}
            className="bg-transparent font-mono text-xs text-text-secondary outline-none cursor-pointer appearance-none hover:text-text-primary transition-colors pr-5"
          >
            <option value="auto" className="bg-bg-surface text-text-primary">
              {displayLanguage
                ? `${displayLanguage} (detected)`
                : "auto-detect"}
            </option>
            {LANGUAGE_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-bg-surface text-text-primary"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 size-3.5 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Code Area */}
      <div className="flex flex-1 bg-bg-input max-h-96 overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="flex flex-col items-end gap-0 py-4 px-3 w-12 border-r border-border-primary bg-bg-surface select-none overflow-hidden"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are index-based and never reorder
              key={i}
              className="font-mono text-xs leading-[1.625] text-text-tertiary"
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Editor overlay container */}
        <div className="relative flex-1 min-h-80">
          {/* Highlighted code (below) */}
          {hasHighlight && (
            <div
              ref={highlightedRef}
              aria-hidden="true"
              className="absolute inset-0 py-4 px-4 font-mono text-xs leading-[1.625] overflow-hidden whitespace-pre pointer-events-none [tab-size:2] [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent [&_.line]:leading-[1.625]"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates trusted HTML from code strings
              dangerouslySetInnerHTML={{
                __html: highlightedHtml,
              }}
            />
          )}

          {/* Textarea (above, transparent text when highlight is active) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder="// paste your code here..."
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={twMerge(
              "relative z-10 w-full h-full py-4 px-4 bg-transparent font-mono text-xs leading-[1.625] outline-none resize-none min-h-80 whitespace-pre overflow-auto [tab-size:2]",
              hasHighlight
                ? "text-transparent caret-accent-green selection:bg-white/10"
                : "text-text-primary placeholder:text-text-tertiary caret-accent-green",
            )}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end h-8 px-4 border-t border-border-primary">
        <span
          className={twMerge(
            "font-mono text-[10px] tabular-nums",
            isOverLimit ? "text-accent-red" : "text-text-tertiary",
          )}
        >
          {charCount.toLocaleString("en-US")}/{MAX_CHARACTERS.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}

export { CodeEditor, MAX_CHARACTERS, type CodeEditorProps };
