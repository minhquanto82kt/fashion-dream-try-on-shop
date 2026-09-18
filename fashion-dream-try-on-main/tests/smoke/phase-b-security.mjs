import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const serverSupabase = await read("src/lib/supabase.server.ts");
const clientSupabase = await read("src/lib/upthink-supabase.ts");
const server = await read("src/server.ts");
const admin = await read("src/lib/product-admin.functions.ts");
const auth = await read("src/lib/auth.ts");

assert.match(serverSupabase, /SUPABASE_SECRET_KEY/);
assert.doesNotMatch(clientSupabase, /SUPABASE_SECRET_KEY/);
assert.doesNotMatch(clientSupabase, /SUPABASE_SERVICE_ROLE/);
assert.doesNotMatch(clientSupabase, /service_role/i);
assert.match(server, /x-request-id/);
assert.match(server, /logRequest/);
assert.match(serverSupabase, /fetchWithRetry/);
assert.match(serverSupabase, /timeoutMs:\s*12_000/);
assert.match(serverSupabase, /status >= 500/);
assert.match(admin, /requireAdmin/);
assert.match(admin, /SUPABASE_SECRET_KEY/);
assert.match(auth, /checkAdminWithCustomerToken/);

console.log("Phase B static security gate: PASS");
