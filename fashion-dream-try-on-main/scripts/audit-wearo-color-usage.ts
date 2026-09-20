import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(process.cwd(), 'src');

const COLOR_ALIASES: Record<string, string> = {
  '#54728c': 'blue',
  '#7794a6': 'blueLight',
  '#f2ceae': 'peach',
  '#d9bba9': 'beige',
  '#f2ad94': 'coral',
  'var(--wearo-blue)': 'blue',
  'var(--wearo-primary)': 'blue',
  'var(--primary)': 'blue',
  'var(--brand-primary)': 'blue',
  'var(--wearo-blue-light)': 'blueLight',
  'var(--wearo-primary-light)': 'blueLight',
  'var(--primary-light)': 'blueLight',
  'var(--wearo-peach)': 'peach',
  'var(--wearo-beige)': 'beige',
  'var(--wearo-coral)': 'coral',
  'var(--wearo-secondary)': 'coral',
  'var(--accent)': 'coral',
  'var(--brand-accent)': 'coral',
};

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/!important/g, '')
  .replace(/\s+/g, ' ')
  .trim();

function canonicalColor(value: string): string | null {
  const normalized = normalize(value);
  return COLOR_ALIASES[normalized] ?? null;
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else if (/\.(css|scss|tsx|ts)$/.test(entry)) files.push(path);
  }
  return files;
}

function auditCssFile(path: string): string[] {
  const source = readFileSync(path, 'utf8');
  const failures: string[] = [];
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(source))) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    if (selector.startsWith('@keyframes') || selector.includes('@keyframes')) continue;

    const body = match[2];
    const colors = [...body.matchAll(/(?:^|[;\s])(color|background-color|background)\s*:\s*([^;]+)/gi)]
      .map((item) => ({ property: item[1].toLowerCase(), value: item[2].trim() }));

    const textColors = colors.filter((item) => item.property === 'color');
    const backgrounds = colors.filter((item) => item.property === 'background' || item.property === 'background-color');

    for (const text of textColors) {
      const textColor = canonicalColor(text.value);
      if (!textColor) continue;
      for (const background of backgrounds) {
        const backgroundColor = canonicalColor(background.value);
        if (backgroundColor && textColor === backgroundColor) {
          failures.push(`${relative(process.cwd(), path)} :: ${selector} :: color=${text.value} conflicts with ${background.property}=${background.value}`);
        }
      }
    }
  }

  return failures;
}

const cssFiles = walk(ROOT).filter((path) => path.endsWith('.css'));
const failures = cssFiles.flatMap(auditCssFile);

console.log('WEARO COLOR USAGE AUDIT');
console.log('=======================');
console.log(`CSS files scanned: ${cssFiles.length}`);
console.log(`Direct WEARO color/background collisions: ${failures.length}`);

if (failures.length) {
  console.error('\nFAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PASS — no direct WEARO brand/semantic color-background collision found.');
