import { formatHtml } from "@/fonts/format";
import { pixelFont } from "@/fonts/pixel";
import type { CodePart, CssStyle, ExportMode, Font } from "@/fonts/types";

export type { CodePart, CodeLang, CssStyle, ExportMode, Font } from "@/fonts/types";

// Registry of available letter styles. Add new fonts here.
export const FONTS: Font[] = [pixelFont];

export const DEFAULT_FONT = pixelFont;

export function getFont(id: string): Font {
  return FONTS.find((font) => font.id === id) ?? DEFAULT_FONT;
}

/** Build the display DOM for a word (self-contained inline styles). */
export function renderWord(word: string, font: Font = DEFAULT_FONT): HTMLElement {
  return font.render(word, "html");
}

/** Copy-paste-ready code for a word, split into blocks per the chosen mode. */
export function exportParts(
  word: string,
  mode: ExportMode,
  font: Font = DEFAULT_FONT,
  style: CssStyle = "bem",
): CodePart[] {
  const markup = formatHtml(font.render(word, mode, style));
  if (mode === "css" && font.stylesheet) {
    // CSS and HTML kept as separate blocks.
    return [
      { title: "styles.css", lang: "css", code: font.stylesheet(style) },
      { title: "index.html", lang: "html", code: markup },
    ];
  }
  return [{ title: "index.html", lang: "html", code: markup }];
}
