import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("src");
const violations = [];
const textExtensions = new Set([".ts", ".tsx", ".css"]);

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name))) continue;
    const relative = path.relative(process.cwd(), full).replaceAll(path.sep, "/");
    const content = await readFile(full, "utf8");

    if (/\bmockUser\s*:/.test(content)) {
      violations.push(`${relative}: mockUser payloads are forbidden; Mock User is a client-side UX simulator.`);
    }
    if (/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/.test(content)) {
      violations.push(`${relative}: privileged Supabase secret names must never appear in client source.`);
    }
    if (/BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/.test(content)) {
      violations.push(`${relative}: private key material detected in source.`);
    }
  }
}

await walk(root);

if (violations.length) {
  console.error("Architecture audit failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Architecture audit passed: client/server boundaries and Mock User contract are clean.");
