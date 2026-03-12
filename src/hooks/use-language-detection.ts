"use client";

import { useEffect, useRef, useState } from "react";
import { hljsIdToLanguageKey } from "@/lib/languages";

type HljsApi = {
  highlightAuto: (
    code: string,
    languageSubset?: string[],
  ) => { language?: string; relevance: number };
  registerLanguage: (name: string, lang: unknown) => void;
};

let hljsInstance: HljsApi | null = null;
let hljsPromise: Promise<HljsApi> | null = null;

/** All hljs IDs we register for detection */
const DETECTION_SUBSET = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "ruby",
  "php",
  "sql",
  "bash",
  "xml",
  "css",
  "json",
  "yaml",
  "markdown",
  "c",
  "cpp",
  "csharp",
  "swift",
  "kotlin",
  "dart",
];

async function getHljs(): Promise<HljsApi> {
  if (hljsInstance) return hljsInstance;
  if (!hljsPromise) {
    hljsPromise = initHljs();
  }
  return hljsPromise;
}

async function initHljs(): Promise<HljsApi> {
  const [
    { default: hljs },
    { default: javascript },
    { default: typescript },
    { default: python },
    { default: go },
    { default: rust },
    { default: java },
    { default: ruby },
    { default: php },
    { default: sql },
    { default: bash },
    { default: xml },
    { default: css },
    { default: json },
    { default: yaml },
    { default: markdown },
    { default: c },
    { default: cpp },
    { default: csharp },
    { default: swift },
    { default: kotlin },
    { default: dart },
  ] = await Promise.all([
    import("highlight.js/lib/core"),
    import("highlight.js/lib/languages/javascript"),
    import("highlight.js/lib/languages/typescript"),
    import("highlight.js/lib/languages/python"),
    import("highlight.js/lib/languages/go"),
    import("highlight.js/lib/languages/rust"),
    import("highlight.js/lib/languages/java"),
    import("highlight.js/lib/languages/ruby"),
    import("highlight.js/lib/languages/php"),
    import("highlight.js/lib/languages/sql"),
    import("highlight.js/lib/languages/bash"),
    import("highlight.js/lib/languages/xml"),
    import("highlight.js/lib/languages/css"),
    import("highlight.js/lib/languages/json"),
    import("highlight.js/lib/languages/yaml"),
    import("highlight.js/lib/languages/markdown"),
    import("highlight.js/lib/languages/c"),
    import("highlight.js/lib/languages/cpp"),
    import("highlight.js/lib/languages/csharp"),
    import("highlight.js/lib/languages/swift"),
    import("highlight.js/lib/languages/kotlin"),
    import("highlight.js/lib/languages/dart"),
  ]);

  const langs: [string, unknown][] = [
    ["javascript", javascript],
    ["typescript", typescript],
    ["python", python],
    ["go", go],
    ["rust", rust],
    ["java", java],
    ["ruby", ruby],
    ["php", php],
    ["sql", sql],
    ["bash", bash],
    ["xml", xml],
    ["css", css],
    ["json", json],
    ["yaml", yaml],
    ["markdown", markdown],
    ["c", c],
    ["cpp", cpp],
    ["csharp", csharp],
    ["swift", swift],
    ["kotlin", kotlin],
    ["dart", dart],
  ];

  for (const [name, lang] of langs) {
    hljs.registerLanguage(
      name,
      lang as Parameters<typeof hljs.registerLanguage>[1],
    );
  }

  hljsInstance = hljs as unknown as HljsApi;
  return hljsInstance;
}

const DEBOUNCE_MS = 300;
const MIN_CONFIDENCE = 3;

type UseLanguageDetectionReturn = {
  detectedLanguage: string | null;
  confidence: number;
};

function useLanguageDetection(code: string): UseLanguageDetectionReturn {
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!code.trim()) {
      setDetectedLanguage(null);
      setConfidence(0);
      return;
    }

    timerRef.current = setTimeout(() => {
      getHljs()
        .then((hljs) => {
          const result = hljs.highlightAuto(code, DETECTION_SUBSET);

          if (result.language && result.relevance >= MIN_CONFIDENCE) {
            const langKey = hljsIdToLanguageKey(result.language);
            setDetectedLanguage(langKey);
            setConfidence(result.relevance);
          } else {
            setDetectedLanguage(null);
            setConfidence(result.relevance);
          }
        })
        .catch(() => {});
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [code]);

  return { detectedLanguage, confidence };
}

export { useLanguageDetection, type UseLanguageDetectionReturn };
