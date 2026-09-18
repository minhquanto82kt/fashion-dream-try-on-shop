import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const replaceOnce = (path, from, to) => {
  const before = readFileSync(path, "utf8");
  if (!before.includes(from)) return false;
  writeFileSync(path, before.replace(from, to));
  return true;
};

replaceOnce(
  "src/components/site-nav.tsx",
  "useRef<ReturnType<typeof window.setTimeout> | null>(null)",
  "useRef<number | null>(null)",
);

replaceOnce(
  "src/lib/ai-provider.server.ts",
  `        const prompt = input.images?.length\n          ? [\n              { type: "text" as const, text: input.prompt },\n              ...input.images.map((image) => ({ type: "image" as const, image })),\n            ]\n          : input.prompt;`,
  `        const prompt = input.images?.length\n          ? { text: input.prompt, images: input.images }\n          : input.prompt;`,
);

replaceOnce(
  "src/lib/ai.functions.ts",
  `    const imagePrompt = images.length\n      ? [\n          { type: "text" as const, text: prompt },\n          ...images.map((image) => ({ type: "image" as const, image })),\n        ]\n      : prompt;`,
  `    const imagePrompt = images.length\n      ? { text: prompt, images }\n      : prompt;`,
);

replaceOnce(
  "src/lib/cart.tsx",
  "name: product.name, slug: product.slug, short_description:",
  "name: product.name, short_description:",
);

replaceOnce(
  "src/routes/admin/appearance/content.tsx",
  "Array<[string, keyof AppearanceContent, \"dark-logo\" | \"monogram\" | \"social-preview\", RefObject<HTMLInputElement | null>]>",
  "Array<[string, \"dark_logo_url\" | \"monogram_url\" | \"social_image_url\", \"dark-logo\" | \"monogram\" | \"social-preview\", RefObject<HTMLInputElement | null>]>",
);

try {
  execFileSync("git", ["config", "user.name", "github-actions[bot]"], { stdio: "inherit" });
  execFileSync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { stdio: "inherit" });
  execFileSync("git", ["add", "package-lock.json", "scripts/ci/repair-baseline.mjs", "src/components/site-nav.tsx", "src/lib/ai-provider.server.ts", "src/lib/ai.functions.ts", "src/lib/cart.tsx", "src/routes/admin/appearance/content.tsx"], { stdio: "inherit" });
  const status = execFileSync("git", ["diff", "--cached", "--quiet"], { stdio: "ignore" });
  void status;
} catch {
  try {
    execFileSync("git", ["commit", "-m", "fix: repair typecheck baseline and add npm lockfile"], { stdio: "inherit" });
    execFileSync("git", ["push", "origin", "HEAD:feature/product-admin"], { stdio: "inherit" });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
