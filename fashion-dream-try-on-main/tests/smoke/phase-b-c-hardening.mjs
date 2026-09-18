import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const read = (file) => readFile(join(root, file), "utf8");

const cart = await read("src/lib/cart.tsx");
const orders = await read("src/lib/order.functions.ts");
const checkout = await read("src/routes/checkout.tsx");
const server = await read("src/lib/supabase.server.ts");
const rbacMigration = await read("supabase/migrations/20260919032000_phase_b_rbac_completion.sql");
const commerceMigration = await read("supabase/migrations/20260919033000_phase_b_c_security_and_commerce_final.sql");

// Phase B: authenticated carts use Supabase as source of truth; guests remain local-only.
assert.match(cart, /getServerCart/);
assert.match(cart, /addServerCartItem/);
assert.match(cart, /updateServerCartItem/);
assert.match(cart, /removeServerCartItem/);
assert.match(cart, /clearServerCart/);
assert.match(cart, /serverCartToLines/);
assert.match(cart, /authenticated\)\s*\{/);

// Phase B: RBAC has explicit customer provisioning and scoped manager operations.
assert.match(rbacMigration, /CREATE OR REPLACE FUNCTION public\.handle_new_user_role/);
assert.match(rbacMigration, /VALUES \(NEW\.id, 'customer'\)/);
assert.match(rbacMigration, /update_order_status_as_manager/);
assert.doesNotMatch(rbacMigration, /CREATE POLICY "managers can update orders"/);

// Phase C: checkout uses a persistent idempotency key and server-side order creation.
assert.match(checkout, /CHECKOUT_KEY = "wearo_checkout_idempotency_key"/);
assert.match(checkout, /sessionStorage\.setItem\(CHECKOUT_KEY, idempotencyKey\)/);
assert.match(checkout, /idempotencyKey/);
assert.match(orders, /verifiedUserId/);
assert.match(orders, /p_idempotency_key/);
assert.match(orders, /rpc\/create_order_atomic_v2/);
assert.match(commerceMigration, /v_requested_variants/);
assert.match(commerceMigration, /v_matched_variants/);
assert.match(commerceMigration, /Một hoặc nhiều biến thể sản phẩm không tồn tại/);

// Critical security invariant: direct PostgREST checkout execution is service-role only.
assert.match(commerceMigration, /REVOKE ALL ON FUNCTION public\.create_order_atomic_v2/);
assert.match(commerceMigration, /GRANT EXECUTE ON FUNCTION public\.create_order_atomic_v2[^\n]*TO service_role/);
assert.match(server, /SUPABASE_SECRET_KEY/);

console.log("Phase B/C Hardening Validation: PASS");
