#!/usr/bin/env node

// Assembles the static output for deployment into `public/`.
// Local dev still opens the root index.html (referencing ./dist) untouched;
// here we mirror index.html + favicon + dist into public/ so Vercel can serve
// public/ as the site root without exposing src/, scripts/ or node_modules.

import { rmSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const publicDist = join(publicDir, "dist");

rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDist, { recursive: true });

const copies = [
  ["index.html", "index.html"],
  ["favicon.svg", "favicon.svg"],
  ["dist/main.js", "dist/main.js"],
  ["dist/style.css", "dist/style.css"],
];

for (const [from, to] of copies) {
  copyFileSync(join(root, from), join(publicDir, to));
  console.log(`  copied ${from} -> public/${to}`);
}

console.log("public/ assembled");
