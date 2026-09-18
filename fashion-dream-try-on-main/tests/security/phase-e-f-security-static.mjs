import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "src/lib/server-reliability.ts",
  "src/lib/security-headers.ts",
  "src/lib/ai.functions.ts",
  "src/lib/supabase.server.ts",
  "src/routes/shop.tsx",
  "src/routes/__root.tsx",
  ".github/workflows/frontend-smoke.yml",
];

const contents = new Map(files.map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")]));

function assert(name, condition) {
  if (!condition) throw new Error(`FAIL ${name}`);
  console.log(`PASS ${name}`);
}

const all = [...contents.values()].join("\n");
assert("server secret names are not exposed as VITE env", !/VITE_(SUPABASE_SECRET_KEY|MOMO_SECRET_KEY|OPENAI_API_KEY|REPLICATE_API_TOKEN)/.test(all));
assert("security headers include nosniff", contents.get("src/lib/security-headers.ts").includes('"x-content-type-options": "nosniff"'));
assert("security headers include frame protection", contents.get("src/lib/security-headers.ts").includes('"x-frame-options": "SAMEORIGIN"'));
assert("request timeout exists", contents.get("src/lib/server-reliability.ts").includes("DEFAULT_TIMEOUT_MS"));
assert("idempotent GET retry policy", contents.get("src/lib/server-reliability.ts").includes('method === "GET"'));
assert("AI image size validation", contents.get("src/lib/ai.functions.ts").includes("MAX_PERSON_IMAGE_BYTES"));
assert("AI MIME validation", contents.get("src/lib/ai.functions.ts").includes("ALLOWED_IMAGE_MIME_TYPES"));
assert("shop uses server catalog RPC", contents.get("src/routes/shop.tsx").includes("get_published_catalog"));
assert("shop route cache configured", contents.get("src/routes/shop.tsx").includes("staleTime: 30_000"));
assert("lazy image loading", all.includes("loading=\"lazy\""));
assert("security audit script exists", contents.get(".github/workflows/frontend-smoke.yml").includes("npm run audit:dependencies"));
assert("secret gate exists", contents.get(".github/workflows/frontend-smoke.yml").includes("npm run security:secrets"));
assert("typecheck gate exists", contents.get(".github/workflows/frontend-smoke.yml").includes("npm run typecheck"));

console.log("Phase E/F static security-performance gate: PASS");
