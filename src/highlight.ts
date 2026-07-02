import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const THEME = "github-dark";

// Lazily build a minimal highlighter: only the html grammar (which also colors
// CSS inside <style>) plus one theme and the wasm engine. The dynamic imports
// keep these heavy assets in separate chunks, out of the initial bundle.
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("shiki/themes/github-dark.mjs")],
      langs: [import("shiki/langs/html.mjs")],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return highlighterPromise;
}

/** Highlight a code string, returning a themed <pre><code> HTML fragment. */
export async function highlightHtml(code: string): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, { lang: "html", theme: THEME });
}
