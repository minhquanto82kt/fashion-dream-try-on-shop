import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const read = (file) => readFile(join(root, file), "utf8");

const mockUser = await read("src/lib/mock-user.ts");
const cart = await read("src/lib/cart.ts");
const orders = await read("src/lib/order.functions.ts");
const checkout = await read("src/routes/checkout.tsx");

assert.match(mockUser, /preview-account-user/);
assert.match(mockUser, /wearo:mock-user:changed/);
assert.match(cart, /wearo-mock-cart/);
assert.match(cart, /isMockUserMode/);
assert.match(orders, /mockUser/);
assert.match(orders, /MOCK-/);
assert.match(checkout, /isMockUserMode/);
assert.match(checkout, /Mock User/);
assert.match(checkout, /wearo_pending_invoice/);
assert.doesNotMatch(checkout, /if\s*\(mockMode\).*fetch\([\"']\/api\/momo\/create/);

console.log("Phase 2 Customer Experience Validation: PASS");
