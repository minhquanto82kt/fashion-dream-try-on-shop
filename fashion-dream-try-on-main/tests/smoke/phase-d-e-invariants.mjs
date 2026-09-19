const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`${path}: expected 2xx, received ${response.status}`);
  return response;
}

async function assertStatus(path, expected, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (response.status !== expected) throw new Error(`${path}: expected ${expected}, received ${response.status}`);
  return response;
}

const health = await get("/api/health");
if (health.headers.get("x-request-id") == null) throw new Error("health: missing request id");
await get("/shop");
await assertStatus("/api/try-on/internal/jobs", 401, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
await assertStatus("/api/try-on/internal/jobs/not-authorized", 401);
for (const route of ["/about", "/ai?product=shadow-hoodie", "/product/shadow-hoodie", "/cart", "/checkout"]) await get(route);

console.log("Phase D/E invariants PASS");
