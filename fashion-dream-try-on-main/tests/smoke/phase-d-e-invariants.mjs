const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";

async function assertStatus(path, expected, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (response.status !== expected) {
    throw new Error(`${path}: expected ${expected}, received ${response.status}`);
  }
  return response;
}

await assertStatus("/api/health", 200);
await assertStatus("/shop", 200);
await assertStatus("/api/try-on/internal/jobs", 401, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({}),
});

console.log("Phase D/E invariants PASS");
