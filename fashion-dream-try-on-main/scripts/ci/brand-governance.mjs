import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignored = new Set(["node_modules", ".git", ".output", "dist", ".vercel"]);

// Inspect only customer-facing storefront route code and public metadata.
// Technical compatibility identifiers such as upthink-supabase are not brand leakage.
const publicRoots = ["src/routes", "src/lib/seo.ts", "src/lib/brand.ts", "public"];
const legacyPublicBrand = /Fashion Dream/i;
const allowedPaths = new Set(["src/lib/brand.ts"]);

function walk(path) {
  const files = [];
  for (const entry of readdirSync(path)) {
    if (ignored.has(entry)) continue;
    const full = join(path, entry);
    const rel = relative(root, full).replaceAll("\\", "/");
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else files.push(rel);
  }
  return files;
}

const files = publicRoots.flatMap((entry) => {
  const full = join(root, entry);
  return statSync(full).isDirectory() ? walk(full) : [entry];
});

const failures = [];
for (const file of files) {
  // Admin routes are authenticated back-office UI, not public-facing storefront code.
  // They may retain technical/legacy references without leaking the legacy brand to customers.
  if (allowedPaths.has(file) || file.startsWith("src/routes/admin/")) continue;
  let text;
  try { text = readFileSync(join(root, file), "utf8"); } catch { continue; }
  if (legacyPublicBrand.test(text)) failures.push(file);
}

if (failures.length) {
  console.error("Brand governance failed: legacy public-facing brand detected in:");
  for (const file of failures) console.error(`- ${file}`);
  process.exit(1);
}

console.log("Brand governance: PASS");
