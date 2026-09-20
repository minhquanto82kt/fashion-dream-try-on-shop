import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

type ColorName = 'blue' | 'blueLight' | 'peach' | 'beige' | 'coral' | 'white' | 'black';

const ROOT = join(process.cwd(), 'src');
const COLORS: Record<ColorName, string> = {
  blue: '#54728C', blueLight: '#7794A6', peach: '#F2CEAE', beige: '#D9BBA9', coral: '#F2AD94', white: '#FFFFFF', black: '#000000',
};
const COLOR_ALIASES: Record<string, ColorName> = {
  '#54728c': 'blue', '#7794a6': 'blueLight', '#f2ceae': 'peach', '#d9bba9': 'beige', '#f2ad94': 'coral',
  '#ffffff': 'white', '#fff': 'white', '#000000': 'black', '#000': 'black',
  'var(--wearo-blue)': 'blue', 'var(--wearo-primary)': 'blue', 'var(--primary)': 'blue', 'var(--brand-primary)': 'blue',
  'var(--wearo-blue-light)': 'blueLight', 'var(--wearo-primary-light)': 'blueLight', 'var(--primary-light)': 'blueLight',
  'var(--wearo-peach)': 'peach', 'var(--wearo-beige)': 'beige', 'var(--wearo-coral)': 'coral', 'var(--wearo-secondary)': 'coral',
  'var(--accent)': 'coral', 'var(--brand-accent)': 'coral', 'var(--wearo-white)': 'white', 'var(--wearo-black)': 'black',
  'var(--white)': 'white', 'var(--black)': 'black',
};
const normalize = (value: string) => value.toLowerCase().replace(/!important/g, '').replace(/\s+/g, ' ').trim();
function canonicalColor(value: string): ColorName | null { return COLOR_ALIASES[normalize(value)] ?? null; }
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(text: ColorName, background: ColorName): number {
  const a = luminance(COLORS[text]); const b = luminance(COLORS[background]);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry); const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path)); else if (/\.(css|scss|tsx|ts)$/.test(entry)) files.push(path);
  }
  return files;
}
function auditCssFile(path: string): string[] {
  const source = readFileSync(path, 'utf8'); const failures: string[] = [];
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g; let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(source))) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    if (selector.startsWith('@keyframes') || selector.includes('@keyframes') || selector.includes('.wearo-pair-')) continue;
    const declarations = [...match[2].matchAll(/(?:^|[;\s])(color|background-color|background)\s*:\s*([^;]+)/gi)]
      .map((item) => ({ property: item[1].toLowerCase(), value: item[2].trim() }));
    const textColors = declarations.filter((item) => item.property === 'color');
    const backgrounds = declarations.filter((item) => item.property === 'background' || item.property === 'background-color');
    for (const text of textColors) {
      const textColor = canonicalColor(text.value); if (!textColor) continue;
      for (const background of backgrounds) {
        const backgroundColor = canonicalColor(background.value); if (!backgroundColor) continue;
        const ratio = contrast(textColor, backgroundColor);
        if (textColor === backgroundColor || ratio < 2) failures.push(`${relative(process.cwd(), path)} :: ${selector} :: ${text.property}=${text.value} vs ${background.property}=${background.value} :: contrast=${ratio.toFixed(2)} :: RESTRICTED`);
      }
    }
  }
  return failures;
}
function auditMarkupFile(path: string): string[] {
  const source = readFileSync(path, 'utf8'); const failures: string[] = [];
  for (const match of source.matchAll(/className=(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\})/g)) {
    const className = match[1] ?? match[2] ?? match[3] ?? ''; if (className.includes('wearo-pair-')) continue;
    const textMatches = [...className.matchAll(/(?:^|\s)text-\[#([0-9a-fA-F]{3,6})\](?=\s|$)/g)];
    const backgroundMatches = [...className.matchAll(/(?:^|\s)bg-\[#([0-9a-fA-F]{3,6})\](?=\s|$)/g)];
    for (const text of textMatches) {
      const textHex = text[1].length === 3 ? text[1].split('').map((c) => c + c).join('') : text[1]; const textColor = canonicalColor(`#${textHex}`); if (!textColor) continue;
      for (const background of backgroundMatches) {
        const backgroundHex = background[1].length === 3 ? background[1].split('').map((c) => c + c).join('') : background[1]; const backgroundColor = canonicalColor(`#${backgroundHex}`); if (!backgroundColor) continue;
        const ratio = contrast(textColor, backgroundColor);
        if (textColor === backgroundColor || ratio < 2) failures.push(`${relative(process.cwd(), path)} :: className="${className}" :: text=${text[0]} vs background=${background[0]} :: contrast=${ratio.toFixed(2)} :: RESTRICTED`);
      }
    }
  }
  return failures;
}
const files = walk(ROOT); const cssFiles = files.filter((path) => path.endsWith('.css')); const markupFiles = files.filter((path) => /\.(tsx|ts)$/.test(path));
const failures = [...cssFiles.flatMap(auditCssFile), ...markupFiles.flatMap(auditMarkupFile)];
console.log('WEARO COLOR USAGE AUDIT'); console.log('======================='); console.log(`CSS files scanned: ${cssFiles.length}`); console.log(`TS/TSX files scanned: ${markupFiles.length}`); console.log(`Restricted text/background collisions: ${failures.length}`);
if (failures.length) { console.error('\nFAIL'); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log('PASS — no direct WEARO restricted text/background collision found.');
