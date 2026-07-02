export type ExportMode = "html" | "css";

/** CSS class convention used in "css" mode. */
export type CssStyle = "bem" | "minimal";

export type CodeLang = "html" | "css";

export const DEFAULT_COLOR = "#10b981";

export interface RenderOptions {
  mode: ExportMode;
  /** CSS class convention (css mode only). */
  style: CssStyle;
  /** Fill color for the letters. */
  color: string;
}

export interface CodePart {
  title: string;
  lang: CodeLang;
  code: string;
}

/**
 * A letter style. Add a new file under src/fonts/ implementing this, then
 * register it in src/fonts/index.ts — nothing else needs to change.
 */
export interface Font {
  /** Stable id used in URLs / storage. */
  id: string;
  /** Human-readable name for pickers. */
  label: string;
  /** Build the DOM for a word with the given render options. */
  render(word: string, opts: RenderOptions): HTMLElement;
  /**
   * Stylesheet emitted alongside the markup in "css" mode. Omit for fonts
   * that are inline-only (no shared classes).
   */
  stylesheet?(opts: RenderOptions): string;
}
