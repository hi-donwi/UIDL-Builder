import {
  meridianDarkTheme,
  meridianLightTheme,
  themeToCssVariablesMap,
  type Theme,
} from "uidl-runtime";

export type AccentColorKey =
  | "cyan"
  | "indigo"
  | "emerald"
  | "violet"
  | "rose"
  | "amber"
  | "orange"
  | "teal";

export type RadiusPresetKey = "none" | "subtle" | "rounded" | "pill";

export type FontPresetKey = "inter" | "outfit" | "plusJakarta" | "jetbrainsMono" | "system";

export interface ThemeCustomizationConfig {
  accentColor: AccentColorKey;
  radius: RadiusPresetKey;
  fontFamily: FontPresetKey;
  customPrimaryHex?: string;
  customBgHex?: string;
}

export const DEFAULT_THEME_CONFIG: ThemeCustomizationConfig = {
  accentColor: "cyan",
  radius: "rounded",
  fontFamily: "inter",
};

export const ACCENT_PALETTES: Record<
  AccentColorKey,
  { label: string; primary: string; hover: string; ring: string; lightBg: string; darkBg: string }
> = {
  cyan: {
    label: "Cyan",
    primary: "#06b6d4",
    hover: "#0891b2",
    ring: "#22d3ee",
    lightBg: "#ecfeff",
    darkBg: "#083344",
  },
  indigo: {
    label: "Indigo",
    primary: "#6366f1",
    hover: "#4f46e5",
    ring: "#818cf8",
    lightBg: "#eef2ff",
    darkBg: "#1e1b4b",
  },
  emerald: {
    label: "Emerald",
    primary: "#10b981",
    hover: "#059669",
    ring: "#34d399",
    lightBg: "#ecfdf5",
    darkBg: "#064e3b",
  },
  violet: {
    label: "Violet",
    primary: "#8b5cf6",
    hover: "#7c3aed",
    ring: "#a78bfa",
    lightBg: "#f5f3ff",
    darkBg: "#2e1065",
  },
  rose: {
    label: "Rose",
    primary: "#f43f5e",
    hover: "#e11d48",
    ring: "#fb7185",
    lightBg: "#fff1f2",
    darkBg: "#4c0519",
  },
  amber: {
    label: "Amber",
    primary: "#f59e0b",
    hover: "#d97706",
    ring: "#fbbf24",
    lightBg: "#fffbeb",
    darkBg: "#451a03",
  },
  orange: {
    label: "Orange",
    primary: "#f97316",
    hover: "#ea580c",
    ring: "#fb923c",
    lightBg: "#fff7ed",
    darkBg: "#431407",
  },
  teal: {
    label: "Teal",
    primary: "#14b8a6",
    hover: "#0d9488",
    ring: "#2dd4bf",
    lightBg: "#f0fdfa",
    darkBg: "#042f2e",
  },
};

export const RADIUS_PRESETS: Record<
  RadiusPresetKey,
  { label: string; sm: string; md: string; lg: string; full: string }
> = {
  none: { label: "Sharp (0px)", sm: "0px", md: "0px", lg: "0px", full: "0px" },
  subtle: { label: "Subtle (4px)", sm: "2px", md: "4px", lg: "6px", full: "9999px" },
  rounded: { label: "Rounded (8px)", sm: "4px", md: "8px", lg: "12px", full: "9999px" },
  pill: { label: "Pill (16px)", sm: "8px", md: "16px", lg: "24px", full: "9999px" },
};

export const FONT_PRESETS: Record<FontPresetKey, { label: string; stack: string }> = {
  inter: { label: "Inter", stack: "'Inter', sans-serif" },
  outfit: { label: "Outfit", stack: "'Outfit', sans-serif" },
  plusJakarta: { label: "Plus Jakarta Sans", stack: "'Plus Jakarta Sans', sans-serif" },
  jetbrainsMono: { label: "JetBrains Mono", stack: "'JetBrains Mono', monospace" },
  system: {
    label: "System UI",
    stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

export function buildCustomizedTheme(
  baseTheme: Theme,
  config: ThemeCustomizationConfig
): Theme {
  const themeClone: Theme = JSON.parse(JSON.stringify(baseTheme));
  const palette = ACCENT_PALETTES[config.accentColor] || ACCENT_PALETTES.cyan;
  const primaryColor = config.customPrimaryHex || palette.primary;
  const radius = RADIUS_PRESETS[config.radius] || RADIUS_PRESETS.rounded;
  const font = FONT_PRESETS[config.fontFamily] || FONT_PRESETS.inter;

  if (themeClone.primitives?.color) {
    themeClone.primitives.color.primary = primaryColor;
    themeClone.primitives.color["primary-hover"] = palette.hover;
    themeClone.primitives.color["primary-focus"] = palette.ring;
  }

  if (themeClone.semantics?.color) {
    themeClone.semantics.color.primary = primaryColor;
    themeClone.semantics.color["primary-hover"] = palette.hover;
  }

  if (themeClone.primitives?.radius) {
    themeClone.primitives.radius.sm = radius.sm;
    themeClone.primitives.radius.md = radius.md;
    themeClone.primitives.radius.lg = radius.lg;
    themeClone.primitives.radius.full = radius.full;
  }

  if (themeClone.primitives?.font) {
    themeClone.primitives.font.body = font.stack;
    themeClone.primitives.font.heading = font.stack;
  }

  return themeClone;
}

export function generateCanvasStyleVars(
  themeMode: "light" | "dark",
  config: ThemeCustomizationConfig
): Record<string, string> {
  const baseTheme = themeMode === "dark" ? meridianDarkTheme : meridianLightTheme;
  const customized = buildCustomizedTheme(baseTheme, config);
  const vars = themeToCssVariablesMap(customized);
  const font = FONT_PRESETS[config.fontFamily] || FONT_PRESETS.inter;
  const palette = ACCENT_PALETTES[config.accentColor] || ACCENT_PALETTES.cyan;

  return {
    ...vars,
    "--color-primary": config.customPrimaryHex || palette.primary,
    "--color-primary-hover": palette.hover,
    fontFamily: font.stack,
  };
}
