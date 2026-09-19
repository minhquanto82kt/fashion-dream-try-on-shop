export const WEARO_BRAND = {
  name: "WEARO",
  colors: {
    primary: "#54728C",
    secondary: "#F2AD94",
    white: "#FFFFFF",
    blueMuted: "#7794A6",
    peach: "#F2CEAE",
    beige: "#D9BBA9",
  },
  public: {
    name: "WEARO",
  },
  admin: {
    operator: "UpThink",
    system: "WEARO Control System",
  },
} as const;

export type WearoBrand = typeof WEARO_BRAND;
