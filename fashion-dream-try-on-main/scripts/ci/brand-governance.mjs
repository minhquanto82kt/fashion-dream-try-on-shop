import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignored = new Set(["node_modules", ".git", ".output", "dist", ".vercel"]);
const publicPaths = ["src", "public", "README.md", "docs"];
const legacyBrand = /Fashion Dream|UpThink —|UpThink \|/i;
const allowedLegacyPaths = new Set(["src/lib/brand.ts", "docs/PHASE-G-H-BRAND-GROWTH.md"]);

function walk(path) {
  const entries = readdirSync(path);
  const files = [];
  for (const entry of entries) {
    if (ignored.has(entry)) continue;
    const full = join(path, entry);
    const rel = relative(root, full).replaceAll("\\", "/");
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else if (publicPaths.some((prefix) => rel === prefix || rel.startsWith(`${prefix}/`))) files.push(rel);
  }
  return files;
}

const failures = [];
for (const file of walk(root)) {
  if (allowedLegacyPaths.has(file)) continue;
  let text;
  try { text = readFileSync(join(root, file), "utf8"); } catch { continue; }
  if (legacyBrand.test(text)) failures.push(file);
}

if (failures.length) {
  console.error("Brand governance failed: legacy public-facing brand leakage detected in:");
  for (const file of failures) console.error(`- ${file}`);
  process.exit(1);
}

console.log("Brand governance: PASS");
