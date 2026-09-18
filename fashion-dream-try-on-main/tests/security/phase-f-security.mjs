const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8080";

const checks = [
  ["security headers", async () => {
    const response = await fetch(`${BASE_URL}/`);
    for (const name of ["x-content-type-options", "referrer-policy"]) {
      if (!response.headers.get(name)) throw new Error(`Missing ${name}`);
    }
  }],
  ["AI internal endpoint rejects missing secret", async () => {
    const response = await fetch(`${BASE_URL}/api/try-on/internal/jobs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    if (response.status !== 401) throw new Error(`Expected 401, got ${response.status}`);
  }],
  ["unknown API route does not expose server error", async () => {
    const response = await fetch(`${BASE_URL}/api/__phase_f_unknown__`);
    const text = await response.text();
    if (/SUPABASE_SECRET_KEY|MOMO_SECRET_KEY|VERCEL_ACCESS_TOKEN|stack|node_modules/i.test(text)) {
      throw new Error("Potential server detail/secret exposure detected");
    }
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
