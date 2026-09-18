const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const routes = [
  "/",
  "/shop",
  "/product/night-shift-set",
  "/ai?product=night-shift-set",
  "/cart",
  "/checkout",
  "/about",
  "/account",
  "/account?preview=1",
];

let failed = false;

for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const status = response.status;
    const location = response.headers.get("location");

    if (status >= 200 && status < 400) {
      console.log(`PASS ${status} ${route}${location ? ` -> ${location}` : ""}`);
    } else {
      failed = true;
      console.error(`FAIL ${status} ${route}${location ? ` -> ${location}` : ""}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL ${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) process.exit(1);
console.log(`\nPublic & Preview Route Validation: PASS (${routes.length} routes checked against ${baseUrl})`);
