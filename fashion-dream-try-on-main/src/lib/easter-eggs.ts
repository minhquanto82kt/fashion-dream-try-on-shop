/**
 * WEARO brand easter eggs.
 *
 * UpThink is intentionally preserved here as a hidden historical nod to the
 * project's earlier identity. It is NOT a runtime brand replacement and must
 * never be used for authorization, storage keys, database identifiers, or
 * user-facing primary branding.
 */
export const WEARO_EASTER_EGGS = {
  legacyName: "UpThink",
  enabled: true,
  attribution: "A hidden nod to WEARO's original project identity.",
} as const;

export function isWearoEasterEgg(value: string): boolean {
  return WEARO_EASTER_EGGS.enabled && value.trim().toLowerCase() === "upthink";
}
