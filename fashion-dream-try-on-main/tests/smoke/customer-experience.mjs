import { spawnSync } from "node:child_process";

const commands = [
  ["routes", "tests/smoke/routes.mjs"],
  ["phase-b-c", "tests/smoke/phase-b-c-invariants.mjs"],
  ["phase-d-e", "tests/smoke/phase-d-e-invariants.mjs"],
  ["phase-f-security", "tests/security/phase-f-security.mjs"],
];

let failed = false;
for (const [label, script] of commands) {
  console.log(`\n=== CUSTOMER GATE: ${label} ===`);
  const result = spawnSync(process.execPath, [script], { stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    failed = true;
    console.error(`FAIL customer gate: ${label} (exit ${result.status ?? "signal"})`);
  } else {
    console.log(`PASS customer gate: ${label}`);
  }
}

if (failed) process.exit(1);
console.log("\nCustomer Experience Validation: PASS");
