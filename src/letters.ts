// Pixel-font glyphs on a 5x7 grid. "#" = filled cell, "." = empty.
// Each letter renders as one parent <div> (a CSS grid) whose child <div>s
// form the shape. New letters: add a 7-row entry, each row 5 chars.
const GLYPHS: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#..##", "#...#", "#...#", ".####"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: [".####", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#.#.#", "#..##", "#...#", "#...#"],
  Ñ: [".###.", "#...#", "##..#", "#.#.#", "#.#.#", "#..##", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
};

const COLS = 5;
const CELL = 8; // px per cell
const GAP = 2; // px between cells
const FILL = "#10b981"; // primary
const LETTER_GAP = 10; // px between letters
const SPACE = 24; // px width of a blank space

export type ExportMode = "html" | "css";

// BEM block used when exporting with CSS classes.
const BLOCK = "divtext";
const CLS = {
  word: BLOCK,
  letter: `${BLOCK}__letter`,
  cell: `${BLOCK}__cell`,
  cellOn: `${BLOCK}__cell--on`,
  space: `${BLOCK}__space`,
};

// Shared stylesheet emitted in CSS mode. Values stay in sync with the
// constants above so inline and class output can never drift apart. Rules are
// formatted one declaration per line so no line exceeds ~80 columns.
function rule(selector: string, decls: Record<string, string>): string {
  const body = Object.entries(decls)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join("\n");
  return `.${selector} {\n${body}\n}`;
}

const STYLESHEET = [
  rule(CLS.word, {
    display: "flex",
    "align-items": "flex-start",
    gap: `${LETTER_GAP}px`,
    "flex-wrap": "wrap",
  }),
  rule(CLS.letter, {
    display: "grid",
    "grid-template-columns": `repeat(${COLS}, ${CELL}px)`,
    gap: `${GAP}px`,
    flex: "0 0 auto",
  }),
  rule(CLS.cell, {
    width: `${CELL}px`,
    height: `${CELL}px`,
  }),
  rule(CLS.cellOn, {
    background: FILL,
    "border-radius": "1px",
  }),
  rule(CLS.space, {
    width: `${SPACE}px`,
    flex: "0 0 auto",
  }),
].join("\n\n");

function makeCell(on: boolean, mode: ExportMode): HTMLElement {
  const dot = document.createElement("div");
  if (mode === "css") {
    dot.className = on ? `${CLS.cell} ${CLS.cellOn}` : CLS.cell;
  } else {
    dot.style.cssText =
      `width:${CELL}px;height:${CELL}px` +
      (on ? `;background:${FILL};border-radius:1px` : "");
  }
  return dot;
}

function makeGlyph(rows: string[], mode: ExportMode): HTMLElement {
  const letter = document.createElement("div");
  if (mode === "css") {
    letter.className = CLS.letter;
  } else {
    letter.style.cssText =
      `display:grid;grid-template-columns:repeat(${COLS},${CELL}px);` +
      `gap:${GAP}px;flex:0 0 auto`;
  }
  for (const row of rows) {
    for (const cell of row) {
      letter.appendChild(makeCell(cell === "#", mode));
    }
  }
  return letter;
}

/**
 * Turn a word into a row of letter grids. Unknown chars render as a gap.
 * `mode` picks inline styles ("html", self-contained) or BEM classes ("css").
 */
export function renderWord(word: string, mode: ExportMode = "html"): HTMLElement {
  const line = document.createElement("div");
  if (mode === "css") {
    line.className = CLS.word;
  } else {
    line.style.cssText =
      `display:flex;align-items:flex-start;gap:${LETTER_GAP}px;flex-wrap:wrap`;
  }

  for (const char of word.toUpperCase()) {
    const glyph = GLYPHS[char];
    if (glyph) {
      line.appendChild(makeGlyph(glyph, mode));
    } else if (char === " ") {
      const space = document.createElement("div");
      if (mode === "css") space.className = CLS.space;
      else space.style.cssText = `width:${SPACE}px;flex:0 0 auto`;
      line.appendChild(space);
    }
  }
  return line;
}

/** Serialize an element tree as indented HTML (2-space), Prettier-style. */
export function formatHtml(el: Element, indent = 0): string {
  const pad = "  ".repeat(indent);
  const tag = el.tagName.toLowerCase();
  const attrs = Array.from(el.attributes)
    .map((a) => ` ${a.name}="${a.value}"`)
    .join("");
  const children = Array.from(el.children);
  if (children.length === 0) return `${pad}<${tag}${attrs}></${tag}>`;
  const inner = children.map((c) => formatHtml(c, indent + 1)).join("\n");
  return `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`;
}

export type CodeLang = "html" | "css";

export interface CodePart {
  title: string;
  lang: CodeLang;
  code: string;
}

/** Copy-paste-ready code for a word, split into blocks per the chosen mode. */
export function exportParts(word: string, mode: ExportMode): CodePart[] {
  const markup = formatHtml(renderWord(word, mode));
  if (mode === "css") {
    // CSS and HTML kept as separate blocks.
    return [
      { title: "styles.css", lang: "css", code: STYLESHEET },
      { title: "index.html", lang: "html", code: markup },
    ];
  }
  return [{ title: "index.html", lang: "html", code: markup }];
}
