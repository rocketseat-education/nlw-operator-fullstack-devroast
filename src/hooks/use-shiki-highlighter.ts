"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HighlighterCore } from "shiki/core";
import { LANGUAGES } from "@/lib/languages";

let highlighterPromise: Promise<HighlighterCore> | null = null;
let highlighterInstance: HighlighterCore | null = null;

async function getHighlighter(): Promise<HighlighterCore> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (!highlighterPromise) {
    highlighterPromise = initHighlighter();
  }

  return highlighterPromise;
}

async function initHighlighter(): Promise<HighlighterCore> {
  const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
    await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);

  const eagerLangs = Object.values(LANGUAGES)
    .filter((l) => l.eager)
    .map((l) => l.shikiId);

  const { bundledLanguages } = await import("shiki/langs");
  const { bundledThemes } = await import("shiki/themes");

  const langImports = eagerLangs
    .filter((id) => id in bundledLanguages)
    .map(
      (id) =>
        bundledLanguages[
          id as keyof typeof bundledLanguages
        ]() as Promise<// biome-ignore lint/suspicious/noExplicitAny: shiki lang module types are complex
        any>,
    );

  const instance = await createHighlighterCore({
    themes: [bundledThemes.vesper()],
    langs: langImports,
    engine: createJavaScriptRegexEngine(),
  });

  highlighterInstance = instance;
  return instance;
}

/** Set of shiki language IDs that have been loaded */
const loadedLanguages = new Set<string>();

/** Pending language loads to avoid duplicate requests */
const pendingLoads = new Map<string, Promise<void>>();

async function ensureLanguageLoaded(
  highlighter: HighlighterCore,
  shikiId: string,
): Promise<void> {
  if (loadedLanguages.has(shikiId)) {
    return;
  }

  if (pendingLoads.has(shikiId)) {
    return pendingLoads.get(shikiId);
  }

  const loaded = highlighter.getLoadedLanguages();
  if (loaded.includes(shikiId)) {
    loadedLanguages.add(shikiId);
    return;
  }

  const loadPromise = (async () => {
    const { bundledLanguages } = await import("shiki/langs");
    const loader = bundledLanguages[shikiId as keyof typeof bundledLanguages];

    if (!loader) {
      return;
    }

    await highlighter.loadLanguage(await loader());
    loadedLanguages.add(shikiId);
  })();

  pendingLoads.set(shikiId, loadPromise);

  try {
    await loadPromise;
  } finally {
    pendingLoads.delete(shikiId);
  }
}

type UseShikiHighlighterReturn = {
  highlight: (code: string, languageKey: string) => string;
  isReady: boolean;
};

function useShikiHighlighter(): UseShikiHighlighterReturn {
  const [isReady, setIsReady] = useState(false);
  const [, setLangVersion] = useState(0);
  const highlighterRef = useRef<HighlighterCore | null>(null);

  useEffect(() => {
    let cancelled = false;

    getHighlighter().then((instance) => {
      if (cancelled) return;
      highlighterRef.current = instance;

      for (const lang of Object.values(LANGUAGES)) {
        if (lang.eager) {
          loadedLanguages.add(lang.shikiId);
        }
      }

      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const highlight = useCallback((code: string, languageKey: string): string => {
    const highlighter = highlighterRef.current;
    if (!highlighter || !code) {
      return escapeHtml(code);
    }

    const langEntry = LANGUAGES[languageKey];
    const shikiId = langEntry?.shikiId ?? "javascript";

    // If language isn't loaded yet, trigger async load and force re-render when done
    if (!loadedLanguages.has(shikiId)) {
      ensureLanguageLoaded(highlighter, shikiId)
        .then(() => {
          setLangVersion((v) => v + 1);
        })
        .catch(() => {});
      return escapeHtml(code);
    }

    try {
      return highlighter.codeToHtml(code, {
        lang: shikiId,
        theme: "vesper",
      });
    } catch {
      return escapeHtml(code);
    }
  }, []);

  return { highlight, isReady };
}

function escapeHtml(text: string): string {
  return `<pre style="background:transparent;margin:0;padding:0"><code>${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</code></pre>`;
}

export { useShikiHighlighter, type UseShikiHighlighterReturn };
