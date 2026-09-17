import type { ThemeColors } from "@/lib/theme";

export type SemanticToken = {
  name: string;
  value: string;
  role: string;
};

export function hexToRgb(hex: string): [number, number, number] | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

export function contrastRatio(foreground: string, background: string): number | null {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  if (a === null || b === null) return null;
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastLevel(ratio: number | null): "AAA" | "AA" | "Fail" {
  if (ratio === null) return "Fail";
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

export function shadeScale(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const steps = [0.05, 0.15, 0.25, 0.4, 0.6, 0.8, 1, 1.15, 1.3];
  return steps.map((factor) => {
    const target = factor <= 1 ? 255 : 0;
    const amount = factor <= 1 ? 1 - factor : factor - 1;
    const next = rgb.map((value) => Math.round(value + (target - value) * amount));
    return `#${next.map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  });
}

export function semanticTokens(colors: ThemeColors): SemanticToken[] {
  return [
    { name: "--color-brand", value: colors.primary, role: "Primary brand identity" },
    { name: "--color-brand-secondary", value: colors.secondary, role: "Supporting brand surface" },
    { name: "--color-page", value: colors.background, role: "Global page background" },
    { name: "--color-surface", value: colors.surface, role: "Cards, panels and controls" },
    { name: "--color-action", value: colors.accent, role: "CTA, active and highlight states" },
    { name: "--color-content", value: colors.foreground, role: "Primary readable content" },
  ];
}

export const TYPOGRAPHY_TOKENS = [
  { name: "Display", value: "clamp(2rem, 5vw, 4.5rem)", role: "Hero and campaign headlines" },
  { name: "Heading", value: "1.5rem / 1.1", role: "Section and card headings" },
  { name: "Body", value: "0.9375rem / 1.6", role: "Primary reading text" },
  { name: "Label", value: "0.625rem / 0.12em", role: "Navigation, metadata and UI labels" },
] as const;
