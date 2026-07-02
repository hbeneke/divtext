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

// Inline styles (no Tailwind) so exported HTML is self-contained and portable.
function renderGlyph(rows: string[]): HTMLElement {
  const letter = document.createElement("div");
  letter.style.cssText =
    `display:grid;grid-template-columns:repeat(${COLS},${CELL}px);` +
    `gap:${GAP}px;flex:0 0 auto`;

  for (const row of rows) {
    for (const cell of row) {
      const dot = document.createElement("div");
      dot.style.cssText =
        `width:${CELL}px;height:${CELL}px` +
        (cell === "#" ? `;background:${FILL};border-radius:1px` : "");
      letter.appendChild(dot);
    }
  }
  return letter;
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

/** Turn a word into a row of letter grids. Unknown chars render as a gap. */
export function renderWord(word: string): HTMLElement {
  const line = document.createElement("div");
  line.style.cssText =
    `display:flex;align-items:flex-start;gap:${LETTER_GAP}px;flex-wrap:wrap`;

  for (const char of word.toUpperCase()) {
    const glyph = GLYPHS[char];
    if (glyph) {
      line.appendChild(renderGlyph(glyph));
    } else if (char === " ") {
      const space = document.createElement("div");
      space.style.cssText = `width:${SPACE}px;flex:0 0 auto`;
      line.appendChild(space);
    }
  }
  return line;
}
