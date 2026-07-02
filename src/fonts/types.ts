export type ExportMode = "html" | "css";

/** CSS class convention used in "css" mode. */
export type CssStyle = "bem" | "minimal";

export type CodeLang = "html" | "css";

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
  /**
   * Build the DOM for a word. `mode` picks inline styles ("html",
   * self-contained) or shared CSS classes ("css"). In "css" mode `style`
   * selects the class convention.
   */
  render(word: string, mode: ExportMode, style?: CssStyle): HTMLElement;
  /**
   * Stylesheet emitted alongside the markup in "css" mode, for the given
   * convention. Omit for fonts that are inline-only (no shared classes).
   */
  stylesheet?(style: CssStyle): string;
}
