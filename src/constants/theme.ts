import '@/global.css';
import { Dimensions, Platform } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

// ── Brand ────────────────────────────────────────────────
export const Brand = {
  primary:      '#0f2554',
  primaryLight: '#1a3a7a',
  primaryDark:  '#080f2a',

  secondary:      '#00b5db',
  secondaryLight: '#33c7e6',
  secondaryDark:  '#007fa0',

  tertiary:      '#f2931b',
  tertiaryLight: '#f5a94a',
  tertiaryDark:  '#c46e0a',

  primary10:   'rgba(15,37,84,0.10)',
  primary20:   'rgba(15,37,84,0.20)',
  primary40:   'rgba(15,37,84,0.40)',
  secondary10: 'rgba(0,181,219,0.10)',
  secondary20: 'rgba(0,181,219,0.20)',
  secondary40: 'rgba(0,181,219,0.40)',
  tertiary10:  'rgba(242,147,27,0.10)',
  tertiary20:  'rgba(242,147,27,0.20)',
} as const;

// ── Glass DARK ───────────────────────────────────────────
export const GlassDark = {
  bgFrom: '#04091a', bgMid: '#0a1230', bgTo: '#071e3d',

  cardBg:           'rgba(255,255,255,0.06)',
  cardBgElevated:   'rgba(255,255,255,0.10)',
  cardBorder:       'rgba(255,255,255,0.10)',
  cardBorderActive: 'rgba(0,181,219,0.45)',

  textPrimary:   '#ffffff',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted:     'rgba(255,255,255,0.30)',

  orb1: 'rgba(15,37,84,0.55)',
  orb2: 'rgba(0,181,219,0.18)',
  orb3: 'rgba(242,147,27,0.12)',

  centerBtnFrom: Brand.secondary,
  centerBtnTo:   Brand.secondaryDark,

  positive: '#34d399',
  negative: '#fb7185',

  navBg:     'rgba(4,9,26,0.90)',
  navBorder: 'rgba(0,181,219,0.18)',

  barActive:   Brand.secondary,
  barInactive: 'rgba(255,255,255,0.10)',

  sheetBg:   '#080f2a',
  overlayBg: 'rgba(0,0,0,0.65)',

  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',

  // Oscuro: acento = secondary (cyan) — contrasta bien sobre fondos oscuros
  accent:         Brand.secondary,
  accentSoft:     Brand.secondary20,
  accentContrast: '#ffffff',          // texto sobre acento
} as const;

// ── Glass LIGHT ──────────────────────────────────────────
// Prioridad: Brand.primary (#0f2554) como color dominante
export const GlassLight = {
  bgFrom: '#f0f5ff', bgMid: '#e4edf9', bgTo: '#d6e4f5',

  cardBg:           'rgba(255,255,255,0.82)',
  cardBgElevated:   '#ffffff',
  cardBorder:       'rgba(15,37,84,0.10)',
  cardBorderActive: 'rgba(15,37,84,0.40)',

  // Texto: primary como color dominante → legible y con identidad de marca
  textPrimary:   Brand.primary,        // #0f2554 — azul marino profundo
  textSecondary: 'rgba(15,37,84,0.62)',
  textMuted:     'rgba(15,37,84,0.40)',

  orb1: 'rgba(15,37,84,0.07)',
  orb2: 'rgba(0,181,219,0.10)',
  orb3: 'rgba(242,147,27,0.08)',

  centerBtnFrom: Brand.primary,
  centerBtnTo:   Brand.primaryLight,

  positive: '#059669',
  negative: '#dc2626',

  navBg:     'rgba(255,255,255,0.92)',
  navBorder: 'rgba(15,37,84,0.14)',

  barActive:   Brand.primary,          // barras del gráfico en primary
  barInactive: 'rgba(15,37,84,0.10)',

  sheetBg:   '#eef4ff',
  overlayBg: 'rgba(15,37,84,0.40)',

  inputBg:     'rgba(15,37,84,0.05)',
  inputBorder: 'rgba(15,37,84,0.15)',

  // Claro: acento = primary (#0f2554) — identidad de marca, contraste AAA sobre fondos claros
  accent:         Brand.primary,
  accentSoft:     Brand.primary10,
  accentContrast: '#ffffff',           // texto blanco sobre primary
} as const;

export type GlassTokens = typeof GlassDark;

// Compatibilidad hacia atrás (siempre dark — para código que aún no migró)
export const Glass = GlassDark;

// ── Colors legacy (ThemedText / ThemedView) ───────────────
export const Colors = {
  light: {
    text:               Brand.primary,
    background:         '#f0f5ff',
    backgroundElement:  '#dce8f7',
    backgroundSelected: '#c8d9f0',
    textSecondary:      'rgba(15,37,84,0.60)',
  },
  dark: {
    text:               '#ffffff',
    background:         '#04091a',
    backgroundElement:  '#0d1633',
    backgroundSelected: '#162044',
    textSecondary:      'rgba(255,255,255,0.55)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios:     { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web:     { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const SCREEN_WIDTH  = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;
export const NAV_HEIGHT    = 62;
export const NAV_BOTTOM    = 10;
export const NAV_SAFE_PAD  = NAV_HEIGHT + NAV_BOTTOM + 24;
export const H_PAD         = 16;
export const CARD_GAP      = 10;
