import '@/global.css';
import { Dimensions, Platform } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

export const Colors = {
  light: {
    text: '#000000', background: '#ffffff',
    backgroundElement: '#F0F0F3', backgroundSelected: '#E0E1E6', textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff', background: '#000000',
    backgroundElement: '#212225', backgroundSelected: '#2E3135', textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Glass = {
  bgFrom: '#0f0c29', bgMid: '#1a1535', bgTo: '#0f3460',
  cardBg: 'rgba(255,255,255,0.07)',
  cardBorder: 'rgba(255,255,255,0.14)',
  cardBorderActive: 'rgba(255,255,255,0.28)',
  textPrimary: 'rgba(255,255,255,0.95)',
  textSecondary: 'rgba(255,255,255,0.50)',
  textMuted: 'rgba(255,255,255,0.30)',
  orb1: 'rgba(100,60,255,0.25)',
  orb2: 'rgba(0,180,255,0.18)',
  orb3: 'rgba(255,100,150,0.14)',
  centerBtnFrom: '#7c3aed', centerBtnTo: '#4f46e5',
  positive: '#4ade80', negative: '#f87171',
  navBg: 'rgba(15,12,41,0.82)', navBorder: 'rgba(255,255,255,0.14)',
  barActive: 'rgba(124,58,237,0.85)', barInactive: 'rgba(255,255,255,0.12)',
  sheetBg: '#1a1535',
  overlayBg: 'rgba(0,0,0,0.60)',
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

// Layout
export const SCREEN_WIDTH  = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;
export const NAV_HEIGHT    = 66;
export const NAV_BOTTOM    = 16;
export const NAV_SAFE_PAD  = NAV_HEIGHT + NAV_BOTTOM + 20;
export const H_PAD         = 16;   // padding horizontal global
export const CARD_GAP      = 10;   // gap entre bento cards
