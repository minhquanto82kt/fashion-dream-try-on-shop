const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const EXTENSIONS = [".ts", ".tsx", ".css", ".js", ".jsx", ".py"];
const SKIP = new Set(["node_modules", ".git", ".next", "dist", "build"]);

function walk(dir, result = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, result);
    else if (EXTENSIONS.includes(path.extname(file))) result.push(file);
  }
  return result;
}

const files = walk(ROOT);
const totals = Object.fromEntries(EXTENSIONS.map((ext) => [ext, 0]));
for (const file of files) totals[path.extname(file)] += fs.statSync(file).size;

console.log("WEARO repository statistics");
console.log(`Project: ${path.basename(ROOT)}`);
console.log(`Source files: ${files.length}`);
for (const [ext, bytes] of Object.entries(totals)) console.log(`${ext.padStart(4)}: ${bytes} bytes`);
console.log(`Total tracked source bytes: ${Object.values(totals).reduce((a, b) => a + b, 0)}`);
