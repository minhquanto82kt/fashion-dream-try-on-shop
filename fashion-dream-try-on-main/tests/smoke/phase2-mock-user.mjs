import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const read = (file) => readFile(join(root, file), "utf8");

const mockUser = await read("src/lib/mock-user.ts");
const cart = await read("src/lib/cart.tsx");
const orders = await read("src/lib/order.functions.ts");
const checkout = await read("src/routes/checkout.tsx");
const auth = await read("src/lib/auth.ts");

assert.match(mockUser, /preview-account-user/);
assert.match(mockUser, /wearo:mock-user-mode/);
assert.match(mockUser, /wearo:mock-user:changed/);
assert.match(cart, /isMockUserMode/);
assert.match(cart, /mock/);
assert.match(orders, /mockUser/);
assert.match(orders, /MOCK-/);
assert.match(checkout, /isMockUserMode/);
assert.match(checkout, /Mock User/);
assert.match(checkout, /mockUser:\s*mockMode/);
assert.match(checkout, /getCustomerSession/);
assert.match(checkout, /accessToken:\s*session\?\.access_token/);
assert.match(checkout, /getCustomerUser/);
assert.match(orders, /accessToken/);
assert.match(orders, /auth\/v1\/user/);
assert.match(orders, /verifiedUserId/);
assert.match(orders, /p_user_id/);
assert.match(auth, /getCustomerSession/);
assert.match(auth, /getCustomerUser/);
assert.match(checkout, /wearo_pending_invoice/);
assert.doesNotMatch(checkout, /mockMode\)\{[^}]*fetch\(["']\/api\/momo\/create/s);

console.log("Customer Experience Validation: PASS");
