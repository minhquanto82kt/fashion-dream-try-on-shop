import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const tokens = await readFile(path.join(root, "src/styles/design-tokens.css"), "utf8");

// Foundation tokens are intentionally structural only. Palette and typography
// remain owned by the existing application styles during this phase.
const forbiddenTokenNames = [
  "--color-",
  "--font-",
  "--font-family",
  "--text-",
  "--leading-",
  "--tracking-",
];

for (const prefix of forbiddenTokenNames) {
  if (tokens.includes(prefix)) {
    throw new Error(`Visual preservation violation: design tokens must not redefine ${prefix}* during Foundation Phase 1.`);
  }
}

console.log("VISUAL PRESERVATION TEST: PASS");
console.log("- no replacement color palette token namespace detected");
console.log("- no replacement typography token namespace detected");
