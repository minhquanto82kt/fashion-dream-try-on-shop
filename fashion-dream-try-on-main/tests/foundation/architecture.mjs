import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

const required = [
  "src/lib/product-domain.ts",
  "src/lib/auth-policy.ts",
  "src/lib/errors.ts",
  "src/styles/design-tokens.css",
  "tests/fixtures/supabase-catalog.ts",
  "docs/FOUNDATION_PHASE_1.md",
  "docs/FOUNDATION_SECURITY_MATRIX.md",
];

for (const file of required) {
  if (!(await exists(file))) throw new Error(`Foundation file missing: ${file}`);
}

const supabaseServer = await read("src/lib/supabase.server.ts");
if (/import\s*\{[^}]*PRODUCTS[^}]*\}\s*from\s*["']@\/data\/products["']/.test(supabaseServer)) {
  throw new Error("supabase.server.ts must not import the storefront PRODUCTS catalogue.");
}

const packageJson = JSON.parse(await read("package.json"));
for (const script of ["test:foundation", "test:all"]) {
  if (typeof packageJson.scripts?.[script] !== "string") {
    throw new Error(`Missing package script: ${script}`);
  }
}

const productDomain = await read("src/lib/product-domain.ts");
if (/export\s+(const|let|var)\s+PRODUCTS\b/.test(productDomain)) {
  throw new Error("Product domain must not contain a hard-coded PRODUCTS catalogue.");
}

const errors = await read("src/lib/errors.ts");
for (const code of ["AUTH_REQUIRED", "FORBIDDEN", "VALIDATION_ERROR", "PAYMENT_ERROR", "AI_ERROR"]) {
  if (!errors.includes(`\"${code}\"`)) throw new Error(`Missing AppError code: ${code}`);
}

console.log("FOUNDATION TEST: PASS");
console.log("- canonical product contract exists");
console.log("- runtime Supabase helper is decoupled from storefront PRODUCTS fixture");
console.log("- centralized authorization vocabulary exists");
console.log("- typed error taxonomy exists");
console.log("- shared design tokens exist");
