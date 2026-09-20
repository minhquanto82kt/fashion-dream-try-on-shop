export const WEARO_COLORS = {
  blue: '#54728C',
  blueLight: '#7794A6',
  peach: '#F2CEAE',
  beige: '#D9BBA9',
  coral: '#F2AD94',
} as const;

export type WearoColorName = keyof typeof WEARO_COLORS;
export type WearoPairStatus = 'AA_TEXT' | 'DISPLAY' | 'EDITORIAL_LOW' | 'RESTRICTED';
export type WearoShadow = 'none' | 'soft' | 'editorial';

export const WEARO_COLOR_ROLES: Record<WearoColorName, string> = {
  blue: 'foundation',
  blueLight: 'supporting',
  peach: 'warm-light',
  beige: 'neutral-warm',
  coral: 'accent',
};

export const WEARO_CONTRAST_THRESHOLDS = {
  aaText: 4.5,
  display: 3,
  editorialLow: 2,
} as const;

export const WEARO_SHADOWS: Record<WearoShadow, string> = {
  none: 'none',
  soft: '0 1px 3px color-mix(in oklab, var(--wearo-ink) 24%, transparent)',
  editorial: '0 2px 6px color-mix(in oklab, var(--wearo-ink) 32%, transparent)',
};

export function hexToLinearRgb(hex: string): [number, number, number] {
  const values = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  return values.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)) as [number, number, number];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToLinearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(text: string, background: string): number {
  const a = relativeLuminance(text);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function classifyContrast(ratio: number): WearoPairStatus {
  if (ratio >= WEARO_CONTRAST_THRESHOLDS.aaText) return 'AA_TEXT';
  if (ratio >= WEARO_CONTRAST_THRESHOLDS.display) return 'DISPLAY';
  if (ratio >= WEARO_CONTRAST_THRESHOLDS.editorialLow) return 'EDITORIAL_LOW';
  return 'RESTRICTED';
}

export function shadowForContrast(status: WearoPairStatus): WearoShadow {
  if (status === 'EDITORIAL_LOW') return 'soft';
  return 'none';
}

export function pairName(text: WearoColorName, background: WearoColorName): string {
  return `${text}-on-${background}`;
}

export interface WearoColorPair {
  id: string;
  text: WearoColorName;
  background: WearoColorName;
  textHex: string;
  backgroundHex: string;
  contrast: number;
  status: WearoPairStatus;
  shadow: WearoShadow;
}

export function buildWearoColorMatrix(): WearoColorPair[] {
  return (Object.keys(WEARO_COLORS) as WearoColorName[]).flatMap((text) =>
    (Object.keys(WEARO_COLORS) as WearoColorName[]).map((background) => {
      const contrast = contrastRatio(WEARO_COLORS[text], WEARO_COLORS[background]);
      const status = text === background ? 'RESTRICTED' : classifyContrast(contrast);
      return {
        id: pairName(text, background),
        text,
        background,
        textHex: WEARO_COLORS[text],
        backgroundHex: WEARO_COLORS[background],
        contrast: Number(contrast.toFixed(2)),
        status,
        shadow: text === background ? 'none' : shadowForContrast(status),
      };
    }),
  );
}

export const WEARO_COLOR_MATRIX = buildWearoColorMatrix();

export const WEARO_ALLOWED_PAIR_IDS = new Set(
  WEARO_COLOR_MATRIX.filter((pair) => pair.status !== 'RESTRICTED').map((pair) => pair.id),
);
