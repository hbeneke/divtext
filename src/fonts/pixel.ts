import { cssRule } from "@/fonts/format";
import { GLYPHS, GLYPH_COLS as COLS, GLYPH_ROWS as ROWS } from "@/fonts/glyphs";
import type { Font, RenderOptions } from "@/fonts/types";

const CELL = 8; // px per cell
const GAP = 2; // px between cells
const LETTER_GAP = 10; // px between letters
const SPACE = 24; // px width of a blank space

const BLOCK = "divtext";
// BEM class names.
const BEM = {
  word: BLOCK,
  letter: `${BLOCK}__letter`,
  cell: `${BLOCK}__cell`,
  cellOn: `${BLOCK}__cell--on`,
  space: `${BLOCK}__space`,
};
// Minimal convention: only two classes; everything else is structural.
const MIN_ON = "on";

const EMPTY_ROWS = Array.from({ length: ROWS }, () => ".".repeat(COLS));

// BEM: one class per role. Five classes, no structural coupling.
function bemStylesheet(color: string): string {
  return [
    cssRule(`.${BEM.word}`, {
      display: "flex",
      "align-items": "flex-start",
      gap: `${LETTER_GAP}px`,
      "flex-wrap": "wrap",
    }),
    cssRule(`.${BEM.letter}`, {
      display: "grid",
      "grid-template-columns": `repeat(${COLS}, ${CELL}px)`,
      gap: `${GAP}px`,
      flex: "0 0 auto",
    }),
    cssRule(`.${BEM.cell}`, { width: `${CELL}px`, height: `${CELL}px` }),
    cssRule(`.${BEM.cellOn}`, { background: color, "border-radius": "1px" }),
    cssRule(`.${BEM.space}`, { width: `${SPACE}px`, flex: "0 0 auto" }),
  ].join("\n\n");
}

// Minimal: one container class + one modifier. Letters/cells matched by
// structure; blank spaces are just empty letter grids (no extra class).
function minimalStylesheet(color: string): string {
  return [
    cssRule(`.${BLOCK}`, {
      display: "flex",
      "align-items": "flex-start",
      gap: `${LETTER_GAP}px`,
      "flex-wrap": "wrap",
    }),
    cssRule(`.${BLOCK} > div`, {
      display: "grid",
      "grid-template-columns": `repeat(${COLS}, ${CELL}px)`,
      gap: `${GAP}px`,
      flex: "0 0 auto",
    }),
    cssRule(`.${BLOCK} > div > div`, { width: `${CELL}px`, height: `${CELL}px` }),
    cssRule(`.${BLOCK} > div > div.${MIN_ON}`, {
      background: color,
      "border-radius": "1px",
    }),
  ].join("\n\n");
}

function stylesheet(opts: RenderOptions): string {
  return opts.style === "minimal"
    ? minimalStylesheet(opts.color)
    : bemStylesheet(opts.color);
}

function makeCell(on: boolean, opts: RenderOptions): HTMLElement {
  const dot = document.createElement("div");
  if (opts.mode !== "css") {
    dot.style.cssText =
      `width:${CELL}px;height:${CELL}px` +
      (on ? `;background:${opts.color};border-radius:1px` : "");
  } else if (opts.style === "minimal") {
    if (on) dot.className = MIN_ON;
  } else {
    dot.className = on ? `${BEM.cell} ${BEM.cellOn}` : BEM.cell;
  }
  return dot;
}

function makeGlyph(rows: string[], opts: RenderOptions): HTMLElement {
  const letter = document.createElement("div");
  if (opts.mode !== "css") {
    letter.style.cssText =
      `display:grid;grid-template-columns:repeat(${COLS},${CELL}px);` +
      `gap:${GAP}px;flex:0 0 auto`;
  } else if (opts.style === "bem") {
    letter.className = BEM.letter;
  }
  for (const row of rows) {
    for (const cell of row) {
      letter.appendChild(makeCell(cell === "#", opts));
    }
  }
  return letter;
}

function render(word: string, opts: RenderOptions): HTMLElement {
  const line = document.createElement("div");
  if (opts.mode !== "css") {
    line.style.cssText =
      `display:flex;align-items:flex-start;gap:${LETTER_GAP}px;flex-wrap:wrap`;
  } else {
    line.className = BLOCK; // same container class for both conventions
  }

  for (const char of word.toUpperCase()) {
    const glyph = GLYPHS[char];
    if (glyph) {
      line.appendChild(makeGlyph(glyph, opts));
    } else if (char === " ") {
      if (opts.mode === "css" && opts.style === "minimal") {
        // A blank is an empty letter grid, so no dedicated class is needed.
        line.appendChild(makeGlyph(EMPTY_ROWS, opts));
      } else {
        const space = document.createElement("div");
        if (opts.mode === "css") space.className = BEM.space;
        else space.style.cssText = `width:${SPACE}px;flex:0 0 auto`;
        line.appendChild(space);
      }
    }
  }
  return line;
}

export const pixelFont: Font = {
  id: "pixel",
  label: "Pixel",
  render,
  stylesheet,
};
