const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8080";

async function expectStatus(name, path, expected, init) {
  const response = await fetch(`${BASE_URL}${path}`, init);
  if (response.status !== expected) throw new Error(`${name}: expected ${expected}, got ${response.status}`);
  return response;
}

async function expectHeader(name, path, header) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.headers.get(header)) throw new Error(`${name}: missing ${header}`);
}

const checks = [
  ["security headers", async () => {
    for (const header of [
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy",
      "x-frame-options",
      "cross-origin-opener-policy",
      "x-request-id",
    ]) await expectHeader("security headers", "/", header);
  }],
  ["AI internal endpoint rejects missing secret", async () => {
    await expectStatus("AI auth", "/api/try-on/internal/jobs", 401, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
  }],
  ["AI internal GET rejects missing secret", async () => {
    await expectStatus("AI GET auth", "/api/try-on/internal/jobs/not-authorized", 401);
  }],
  ["unknown API route does not expose server error", async () => {
    const response = await fetch(`${BASE_URL}/api/__phase_f_unknown__`);
    const text = await response.text();
    if (/SUPABASE_SECRET_KEY|MOMO_SECRET_KEY|VERCEL_ACCESS_TOKEN|OPENAI_API_KEY|REPLICATE_API_TOKEN|stack|node_modules/i.test(text)) {
      throw new Error("Potential server detail/secret exposure detected");
    }
  }],
  ["health response is not cacheable", async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.headers.get("cache-control") !== "no-store") throw new Error("Health endpoint must be no-store");
  }],
];

let failed = false;
for (const [name, run] of checks) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

if (failed) process.exit(1);
console.log("Phase F security smoke: PASS");
