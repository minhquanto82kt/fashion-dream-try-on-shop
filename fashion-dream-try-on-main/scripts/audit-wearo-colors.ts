import {
  buildWearoColorMatrix,
  WEARO_COLORS,
  WEARO_CONTRAST_THRESHOLDS,
  WEARO_NEUTRAL_STANDARD_PAIR_IDS,
  WEARO_COLOR_VARIANT_PAIRS,
} from '../src/lib/wearo-color-system.ts';

const matrix = buildWearoColorMatrix();
const identical = matrix.filter((pair) => pair.text === pair.background);
const candidates = matrix.filter((pair) => pair.text !== pair.background);
const variants = WEARO_COLOR_VARIANT_PAIRS;
const neutralStandard = candidates.filter((pair) => WEARO_NEUTRAL_STANDARD_PAIR_IDS.has(pair.id));
const restricted = variants.filter((pair) => pair.status === 'RESTRICTED');
const editorialLow = variants.filter((pair) => pair.status === 'EDITORIAL_LOW');
const display = variants.filter((pair) => pair.status === 'DISPLAY');
const aaText = variants.filter((pair) => pair.status === 'AA_TEXT');

const failures: string[] = [];
if (Object.keys(WEARO_COLORS).length !== 7) failures.push('WEARO must contain exactly 7 matrix colors: 5 brand + white + black.');
if (matrix.length !== 49) failures.push(`Expected 49 matrix pairs, got ${matrix.length}.`);
if (identical.length !== 7) failures.push(`Expected 7 identical pairs, got ${identical.length}.`);
if (candidates.length !== 42) failures.push(`Expected 42 non-identical pairs, got ${candidates.length}.`);
if (neutralStandard.length !== 2) failures.push(`Expected 2 neutral standard pairs, got ${neutralStandard.length}.`);
if (variants.length !== 40) failures.push(`Expected 40 design variants, got ${variants.length}.`);
if (variants.some((pair) => pair.status === 'EDITORIAL_LOW' && pair.shadow === 'none')) {
  failures.push('Every EDITORIAL_LOW variant must have a shadow treatment.');
}
if (variants.some((pair) => pair.status !== 'EDITORIAL_LOW' && pair.shadow !== 'none')) {
  failures.push('Only EDITORIAL_LOW variants may receive automatic text shadow.');
}
if (variants.some((pair) => pair.contrast < 0)) failures.push('Contrast ratio cannot be negative.');
if (neutralStandard.some((pair) => pair.status === 'RESTRICTED')) {
  failures.push('White-on-black and black-on-white must remain valid neutral standard pairs.');
}

console.log('WEARO COLOR AUDIT');
console.log('=================');
console.log(`Matrix colors: ${Object.keys(WEARO_COLORS).length}`);
console.log(`Raw combinations: ${matrix.length}`);
console.log(`Identical pairs removed: ${identical.length}`);
console.log(`Non-identical pairs: ${candidates.length}`);
console.log(`Neutral standard pairs excluded from variants: ${neutralStandard.length}`);
console.log(`Design variants: ${variants.length}`);
console.log(`AA text: ${aaText.length}`);
console.log(`Display: ${display.length}`);
console.log(`Editorial low + shadow: ${editorialLow.length}`);
console.log(`Restricted: ${restricted.length}`);
console.log(`Thresholds: AA=${WEARO_CONTRAST_THRESHOLDS.aaText}, Display=${WEARO_CONTRAST_THRESHOLDS.display}, Editorial=${WEARO_CONTRAST_THRESHOLDS.editorialLow}`);
console.log('');

for (const pair of candidates) {
  const marker = WEARO_NEUTRAL_STANDARD_PAIR_IDS.has(pair.id) ? ' [STANDARD]' : '';
  console.log(`${pair.id.padEnd(28)} ${pair.contrast.toFixed(2).padStart(5)}  ${pair.status.padEnd(15)} shadow=${pair.shadow}${marker}`);
}

if (failures.length) {
  console.error('\nFAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('\nPASS — WEARO 7x7 color matrix is internally consistent.');
console.log('40 design variants = 49 combinations - 7 identical - 2 neutral standard pairs.');
