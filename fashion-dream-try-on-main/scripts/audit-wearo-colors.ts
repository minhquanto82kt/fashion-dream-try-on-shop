import { buildWearoColorMatrix, WEARO_COLORS, WEARO_CONTRAST_THRESHOLDS } from '../src/lib/wearo-color-system.ts';

const matrix = buildWearoColorMatrix();
const identical = matrix.filter((pair) => pair.text === pair.background);
const candidates = matrix.filter((pair) => pair.text !== pair.background);
const restricted = candidates.filter((pair) => pair.status === 'RESTRICTED');
const editorialLow = candidates.filter((pair) => pair.status === 'EDITORIAL_LOW');
const display = candidates.filter((pair) => pair.status === 'DISPLAY');
const aaText = candidates.filter((pair) => pair.status === 'AA_TEXT');

const failures: string[] = [];
if (Object.keys(WEARO_COLORS).length !== 5) failures.push('WEARO must contain exactly 5 brand colors.');
if (matrix.length !== 25) failures.push(`Expected 25 matrix pairs, got ${matrix.length}.`);
if (identical.length !== 5) failures.push(`Expected 5 identical pairs, got ${identical.length}.`);
if (candidates.length !== 20) failures.push(`Expected 20 non-identical pairs, got ${candidates.length}.`);
if (candidates.some((pair) => pair.status === 'EDITORIAL_LOW' && pair.shadow === 'none')) {
  failures.push('Every EDITORIAL_LOW pair must have a shadow treatment.');
}
if (candidates.some((pair) => pair.status !== 'EDITORIAL_LOW' && pair.shadow !== 'none')) {
  failures.push('Only EDITORIAL_LOW pairs may receive automatic text shadow.');
}
if (candidates.some((pair) => pair.contrast < 0)) failures.push('Contrast ratio cannot be negative.');

console.log('WEARO COLOR AUDIT');
console.log('=================');
console.log(`Brand colors: ${Object.keys(WEARO_COLORS).length}`);
console.log(`Raw combinations: ${matrix.length}`);
console.log(`Identical pairs removed: ${identical.length}`);
console.log(`Candidate pairs: ${candidates.length}`);
console.log(`AA text: ${aaText.length}`);
console.log(`Display: ${display.length}`);
console.log(`Editorial low + shadow: ${editorialLow.length}`);
console.log(`Restricted: ${restricted.length}`);
console.log(`Thresholds: AA=${WEARO_CONTRAST_THRESHOLDS.aaText}, Display=${WEARO_CONTRAST_THRESHOLDS.display}, Editorial=${WEARO_CONTRAST_THRESHOLDS.editorialLow}`);
console.log('');

for (const pair of candidates) {
  console.log(`${pair.id.padEnd(24)} ${pair.contrast.toFixed(2).padStart(5)}  ${pair.status.padEnd(15)} shadow=${pair.shadow}`);
}

if (failures.length) {
  console.error('\nFAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('\nPASS — WEARO color matrix is internally consistent.');
