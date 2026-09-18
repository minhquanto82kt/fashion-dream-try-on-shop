import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/easter-eggs.ts", import.meta.url), "utf8").catch(() => "");
assert.match(source, /legacyName:\s*["']UpThink["']/);
assert.match(source, /NOT a runtime brand replacement/);
assert.match(source, /must never be used for authorization/);
console.log("WEARO easter-egg boundary: PASS");
