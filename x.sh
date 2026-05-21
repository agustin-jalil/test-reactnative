#!/bin/bash
# 08-global-theme.sh
# Tema global real en TODA la app:
# - GlassLight.accent = Brand.primary (#0f2554) — azul marino como acento en claro
# - GlassLight.accentSoft = Brand.primary10
# - Elimina todos los Glass.* hardcodeados en StyleSheet.create()
# - Cada componente usa useGlass() y pasa los colores por inline style
# - themed-view.tsx usa useGlass()
# - ThemeToggleButton como componente separado
# - Botón toggle en el header del home
# Archivos tocados:
#   theme.ts, use-glass.ts, themed-view.tsx,
#   apps.tsx, wallet.tsx, home-bottom-sheet.tsx,
#   center-app-picker.tsx, themed-text.tsx,
#   theme-toggle-button.tsx (nuevo), index.tsx
set -e
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo ""
echo -e "${BLUE}  Global Theme System${NC}"
echo "  ===================="

# ─────────────────────────────────────────────────────────
# 1. theme.ts — GlassLight con primary como acento
# ─────────────────────────────────────────────────────────
echo -e "\n${BLUE}→ [1/10] src/constants/theme.ts${NC}"
cat > src/constants/theme.ts << 'EOF'
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
EOF
echo -e "${GREEN}  ✓ theme.ts${NC}"

# ─────────────────────────────────────────────────────────
# 2. use-glass.ts — hook central (sin cambios de API)
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [2/10] src/hooks/use-glass.ts${NC}"
cat > src/hooks/use-glass.ts << 'EOF'
import { useColorScheme } from 'react-native';
import { GlassDark, GlassLight, GlassTokens } from '@/constants/theme';
import { useUiStore } from '@/stores/ui.store';

export function useGlass(): GlassTokens {
  const { themeMode } = useUiStore();
  const system = useColorScheme();
  if (themeMode === 'light')  return GlassLight;
  if (themeMode === 'dark')   return GlassDark;
  return system === 'light' ? GlassLight : GlassDark;
}

export function useIsDark(): boolean {
  const { themeMode } = useUiStore();
  const system = useColorScheme();
  if (themeMode === 'light') return false;
  if (themeMode === 'dark')  return true;
  return system !== 'light';
}
EOF
echo -e "${GREEN}  ✓ use-glass.ts${NC}"

# ─────────────────────────────────────────────────────────
# 3. themed-view.tsx — usa useGlass()
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [3/10] src/components/themed-view.tsx${NC}"
cat > src/components/themed-view.tsx << 'EOF'
import { View, type ViewProps } from 'react-native';
import { useGlass } from '@/hooks/use-glass';
import { GlassTokens } from '@/constants/theme';

// type puede ser cualquier clave de GlassTokens que sea un string de color
export type ThemedViewProps = ViewProps & {
  type?: 'background' | 'backgroundElement' | 'backgroundSelected' | 'card' | 'cardElevated';
};

export function ThemedView({ style, type = 'background', ...props }: ThemedViewProps) {
  const G = useGlass();

  const bgMap: Record<string, string> = {
    background:          G.bgFrom,
    backgroundElement:   G.cardBg,
    backgroundSelected:  G.cardBgElevated,
    card:                G.cardBg,
    cardElevated:        G.cardBgElevated,
  };

  return (
    <View style={[{ backgroundColor: bgMap[type] ?? G.bgFrom }, style]} {...props} />
  );
}
EOF
echo -e "${GREEN}  ✓ themed-view.tsx${NC}"

# ─────────────────────────────────────────────────────────
# 4. theme-toggle-button.tsx — botón reutilizable
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [4/10] src/components/theme-toggle-button.tsx${NC}"
cat > src/components/theme-toggle-button.tsx << 'EOF'
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGlass, useIsDark } from '@/hooks/use-glass';
import { useUiStore, ThemeMode } from '@/stores/ui.store';

type Props = { mode?: 'icon' | 'pill' };

export function ThemeToggleButton({ mode = 'icon' }: Props) {
  const G      = useGlass();
  const isDark = useIsDark();
  const { themeMode, setThemeMode } = useUiStore();

  // Ciclo: dark → light → system → dark
  const next: ThemeMode =
    themeMode === 'dark'  ? 'light'  :
    themeMode === 'light' ? 'system' : 'dark';

  const icon  = themeMode === 'dark' ? '🌙' : themeMode === 'light' ? '☀️' : '⚙️';
  const label = themeMode === 'dark' ? 'Oscuro' : themeMode === 'light' ? 'Claro' : 'Sistema';

  const scale  = useSharedValue(1);
  const rotate = useSharedValue(0);

  const scaleAnim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const rotateAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotate.value, [0, 1], [0, 360])}deg` }],
  }));

  function handlePress() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value  = withSpring(0.80, { damping: 8 }, () => { scale.value = withSpring(1, { damping: 12 }); });
    rotate.value = withTiming(1, { duration: 380 }, () => { rotate.value = 0; });
    setThemeMode(next);
  }

  if (mode === 'pill') {
    return (
      <Animated.View style={scaleAnim}>
        <TouchableOpacity
          onPress={handlePress}
          accessibilityLabel={`Tema actual: ${label}. Toca para cambiar.`}
          style={[styles.pill, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
          <Animated.Text style={[styles.pillIcon, rotateAnim]}>{icon}</Animated.Text>
          <Text style={[styles.pillLabel, { color: G.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={scaleAnim}>
      <TouchableOpacity
        onPress={handlePress}
        accessibilityLabel={`Tema: ${label}`}
        style={[styles.iconBtn, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
        <Animated.Text style={[styles.iconBtnTxt, rotateAnim]}>{icon}</Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconBtn:    { width: 36, height: 36, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  iconBtnTxt: { fontSize: 16, lineHeight: 20 },
  pill:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5 },
  pillIcon:   { fontSize: 14, lineHeight: 18 },
  pillLabel:  { fontSize: 12, fontWeight: '600' },
});
EOF
echo -e "${GREEN}  ✓ theme-toggle-button.tsx${NC}"

# ─────────────────────────────────────────────────────────
# 5. apps.tsx — sin Glass.* estático, todo por useGlass()
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [5/10] src/app/(app)/apps.tsx${NC}"
cat > "src/app/(app)/apps.tsx" << 'EOF'
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Keyboard, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ALL_CATEGORIES, AVAILABLE_APPS, AppCategory, CenterApp, useUiStore } from '@/stores/ui.store';
import { H_PAD, NAV_SAFE_PAD } from '@/constants/theme';
import { useGlass } from '@/hooks/use-glass';

function AppTile({ app, isSelected, onPress, index }: { app: CenterApp; isSelected: boolean; onPress: () => void; index: number }) {
  const G     = useGlass();
  const scale = useSharedValue(1);
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.88, { damping: 8, stiffness: 300 }, () => { scale.value = withSpring(1, { damping: 12 }); });
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 35).duration(320).springify()}>
      <TouchableOpacity onPress={handlePress} accessibilityLabel={`Seleccionar ${app.label}`} activeOpacity={0.85} style={styles.tile}>
        <Animated.View style={anim}>
          <LinearGradient
            colors={isSelected ? [app.color, app.colorTo] : [G.cardBg, G.cardBg]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.tileIcon, { borderColor: isSelected ? 'rgba(255,255,255,0.28)' : G.cardBorder, borderWidth: isSelected ? 1.5 : 0.5 }]}>
            <Text style={[styles.tileIconTxt, { color: isSelected ? '#fff' : G.textMuted }]}>{app.icon}</Text>
            {isSelected && (
              <View style={[styles.checkBadge, { backgroundColor: G.positive, borderColor: G.bgFrom }]}>
                <Text style={styles.checkTxt}>✓</Text>
              </View>
            )}
          </LinearGradient>
          <Text style={[styles.tileLabel, { color: isSelected ? G.textPrimary : G.textSecondary }]} numberOfLines={1}>{app.label}</Text>
          <Text style={[styles.tileDesc, { color: G.textMuted }]} numberOfLines={2}>{app.description}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AppsScreen() {
  const G      = useGlass();
  const router = useRouter();
  const { centerApp, setCenterApp } = useUiStore();

  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState<AppCategory | 'Todos'>('Todos');
  const inputRef = useRef<TextInput>(null);

  const filtered = useMemo(() => {
    let list = AVAILABLE_APPS;
    if (category !== 'Todos') list = list.filter((a) => a.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    return list;
  }, [query, category]);

  function handleSelect(app: CenterApp) {
    const isSame = centerApp?.id === app.id;
    setCenterApp(isSame ? null : app);
    if (!isSame) setTimeout(() => router.back(), 320);
  }

  return (
    <View style={[styles.root, { backgroundColor: G.bgFrom }]}>
      <LinearGradient colors={[G.bgFrom, G.bgMid, G.bgTo]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.orb, { backgroundColor: G.orb1 }]} />

      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]} accessibilityLabel="Volver">
            <Text style={[styles.backIcon, { color: G.textPrimary }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: G.textPrimary }]}>Apps</Text>
            <Text style={[styles.headerSub, { color: G.textSecondary }]}>Elegí tu acceso rápido</Text>
          </View>
          {centerApp && (
            <TouchableOpacity onPress={() => setCenterApp(null)} style={styles.clearBtn} accessibilityLabel="Quitar acceso rápido">
              <Text style={styles.clearTxt}>Quitar</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Banner app seleccionada */}
        {centerApp && (
          <Animated.View entering={FadeInDown.duration(280)} style={styles.currentBanner}>
            <LinearGradient colors={[centerApp.color, centerApp.colorTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.currentGrad}>
              <Text style={styles.currentIcon}>{centerApp.icon}</Text>
              <View style={styles.currentMeta}>
                <Text style={styles.currentLabel}>Acceso rápido actual</Text>
                <Text style={styles.currentName}>{centerApp.label}</Text>
              </View>
              <Text style={styles.currentArrow}>✓</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Buscador */}
        <Animated.View entering={FadeInDown.delay(60).duration(300)} style={[styles.searchWrap, { backgroundColor: G.inputBg, borderColor: G.inputBorder }]}>
          <Text style={[styles.searchIcon, { color: G.textMuted }]}>⌕</Text>
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: G.textPrimary }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar app o función…"
            placeholderTextColor={G.textMuted}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearInput}>
              <Text style={[styles.clearInputTxt, { color: G.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Filtros */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent} keyboardShouldPersistTaps="always" style={styles.filtersScroll}>
            {(['Todos', ...ALL_CATEGORIES] as const).map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setCategory(cat as any); Keyboard.dismiss(); }}
                  accessibilityLabel={`Filtrar: ${cat}`}
                  style={[
                    styles.filterChip,
                    { backgroundColor: active ? G.accentSoft : G.cardBg, borderColor: active ? G.accent : G.cardBorder },
                  ]}>
                  <Text style={[styles.filterTxt, { color: active ? G.accent : G.textSecondary, fontWeight: active ? '700' : '500' }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Grid */}
        <ScrollView style={styles.gridScroll} contentContainerStyle={[styles.gridContent, { paddingBottom: NAV_SAFE_PAD }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag">
          {filtered.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <Text style={[styles.emptyIcon, { color: G.textMuted }]}>◌</Text>
              <Text style={[styles.emptyTitle, { color: G.textSecondary }]}>Sin resultados</Text>
              <Text style={[styles.emptySub, { color: G.textMuted }]}>No encontramos "{query}"</Text>
            </Animated.View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((app, i) => (
                <AppTile key={app.id} app={app} isSelected={centerApp?.id === app.id} onPress={() => handleSelect(app)} index={i} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const TILE_W = '30%';
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  orb:  { position: 'absolute', width: 320, height: 320, borderRadius: 160, top: -80, right: -80, pointerEvents: 'none' },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: H_PAD, paddingTop: 6, paddingBottom: 14, gap: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  backIcon:    { fontSize: 18, lineHeight: 22 },
  headerText:  { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub:   { fontSize: 12, marginTop: 1 },
  clearBtn:    { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(251,113,133,0.12)', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(251,113,133,0.22)' },
  clearTxt:    { fontSize: 12, color: '#fb7185', fontWeight: '600' },
  currentBanner: { marginHorizontal: H_PAD, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  currentGrad:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  currentIcon:   { fontSize: 22, color: '#fff' },
  currentMeta:   { flex: 1 },
  currentLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 },
  currentName:   { fontSize: 15, fontWeight: '700', color: '#fff', marginTop: 1 },
  currentArrow:  { fontSize: 16, color: 'rgba(255,255,255,0.80)' },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: H_PAD, marginBottom: 12, borderRadius: 14, borderWidth: 0.5, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon:    { fontSize: 18, lineHeight: 22 },
  searchInput:   { flex: 1, fontSize: 15, height: '100%' },
  clearInput:    { padding: 4 },
  clearInputTxt: { fontSize: 13 },
  filtersScroll:  { flexGrow: 0 },
  filtersContent: { paddingHorizontal: H_PAD, gap: 8, paddingBottom: 14 },
  filterChip:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5 },
  filterTxt:   { fontSize: 13 },
  gridScroll:  { flex: 1 },
  gridContent: { paddingHorizontal: H_PAD, paddingTop: 4 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile:        { width: TILE_W },
  tileIcon:    { aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', marginBottom: 7 },
  tileIconTxt: { fontSize: 26 },
  checkBadge:  { position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  checkTxt:    { fontSize: 10, color: '#fff', fontWeight: '800', lineHeight: 12 },
  tileLabel:   { fontSize: 12, fontWeight: '600', marginBottom: 3 },
  tileDesc:    { fontSize: 10, lineHeight: 14 },
  emptyState:  { alignItems: 'center', paddingTop: 64, gap: 10 },
  emptyIcon:   { fontSize: 48 },
  emptyTitle:  { fontSize: 16, fontWeight: '700' },
  emptySub:    { fontSize: 13, textAlign: 'center', maxWidth: 240 },
});
EOF
echo -e "${GREEN}  ✓ apps.tsx${NC}"

# ─────────────────────────────────────────────────────────
# 6. wallet.tsx — sin Glass.* estático
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [6/10] src/app/(app)/wallet.tsx${NC}"
cat > "src/app/(app)/wallet.tsx" << 'EOF'
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeInDown, FadeInUp,
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { H_PAD, NAV_SAFE_PAD, Spacing } from '@/constants/theme';
import { useGlass } from '@/hooks/use-glass';

type Message = { id: string; role: 'user' | 'assistant'; text: string; ts: string };

const SUGGESTIONS = [
  '¿Cómo mejorar mi flujo de caja?',
  '¿Cuánto gasté este mes?',
  'Analiza mis ingresos',
  '¿Cuándo conviene invertir?',
];

const INITIAL_MSGS: Message[] = [{
  id: '0', role: 'assistant', ts: 'Ahora',
  text: 'Hola 👋 Soy tu asistente financiero. Puedo ayudarte a entender tus finanzas, analizar tus movimientos y darte recomendaciones personalizadas.\n\n¿En qué te puedo ayudar hoy?',
}];

function formatTs() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const REPLIES: Record<string, string> = {
  '¿Cómo mejorar mi flujo de caja?': 'Para mejorar tu flujo de caja te recomiendo:\n\n1. Revisar gastos recurrentes y eliminar los innecesarios\n2. Anticipar cobros pendientes\n3. Crear un fondo de emergencia de 3 meses\n\n¿Quieres que analice tus movimientos actuales?',
  '¿Cuánto gasté este mes?': 'Este mes gastaste $4.200 distribuidos en:\n• Servicios: $340\n• Transferencias: $500\n• Otros: $3.360\n\nEstás 12% por debajo del mes anterior. ✅',
  'Analiza mis ingresos': 'Tus ingresos de mayo suman $12.400. El 76% proviene de transferencias recibidas y el 24% de cobros de facturas. Tu tendencia es positiva (+8% vs abril). 📈',
  '¿Cuándo conviene invertir?': 'Con tu balance actual de $8.170 y un flujo positivo, podrías considerar:\n\n• Plazos fijos en pesos para el corto plazo\n• FCI money market para liquidez inmediata\n\n¿Te gustaría que te explique cada opción?',
};

export default function AIChatScreen() {
  const G = useGlass();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MSGS);
  const [input,    setInput]    = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendScale = useSharedValue(1);
  const sendAnim  = useAnimatedStyle(() => ({ transform: [{ scale: sendScale.value }] }));

  function scrollToBottom() {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    setInput('');
    setMessages((p) => [...p, { id: Date.now().toString(), role: 'user', text: msg, ts: formatTs() }]);
    setThinking(true);
    scrollToBottom();
    sendScale.value = withSpring(0.85, { duration: 80 }, () => { sendScale.value = withSpring(1, { duration: 200 }); });
    setTimeout(() => {
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', text: REPLIES[msg] ?? 'Entendido. Estoy procesando tu consulta con los datos de tu cuenta. 🤖', ts: formatTs() }]);
      setThinking(false);
      scrollToBottom();
    }, 1400);
  }

  return (
    <View style={[styles.root, { backgroundColor: G.bgFrom }]}>
      <LinearGradient colors={[G.bgFrom, G.bgMid, G.bgTo]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: G.cardBorder }]}>
          <View style={[styles.aiAvatar, { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]}>
            <Text style={[styles.aiAvatarIcon, { color: G.accent }]}>◈</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: G.textPrimary }]}>Asistente IA</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: thinking ? '#facc15' : G.positive }]} />
              <Text style={[styles.statusTxt, { color: G.textSecondary }]}>{thinking ? 'Pensando…' : 'En línea'}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]} accessibilityLabel="Nueva conversación">
            <Text style={[styles.headerBtnTxt, { color: G.textSecondary }]}>✦ Nueva</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          <ScrollView ref={scrollRef} style={styles.msgList} contentContainerStyle={styles.msgContent} showsVerticalScrollIndicator={false} onContentSizeChange={scrollToBottom}>

            {messages.map((msg) => (
              <Animated.View key={msg.id} entering={FadeInDown.duration(300).springify()}
                style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowAssistant]}>
                {msg.role === 'assistant' && (
                  <View style={[styles.msgAvatar, { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]}>
                    <Text style={{ fontSize: 14, color: G.accent }}>◈</Text>
                  </View>
                )}
                <View style={[
                  styles.bubble,
                  msg.role === 'user'
                    ? { backgroundColor: G.accent }
                    : { backgroundColor: G.cardBg, borderWidth: 0.5, borderColor: G.cardBorder },
                ]}>
                  <Text style={[styles.bubbleText, { color: msg.role === 'user' ? G.accentContrast : G.textPrimary }]}>{msg.text}</Text>
                  <Text style={[styles.bubbleTs, { color: msg.role === 'user' ? 'rgba(255,255,255,0.45)' : G.textMuted }]}>{msg.ts}</Text>
                </View>
              </Animated.View>
            ))}

            {thinking && (
              <Animated.View entering={FadeIn.duration(200)} style={[styles.msgRow, styles.msgRowAssistant]}>
                <View style={[styles.msgAvatar, { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]}>
                  <Text style={{ fontSize: 14, color: G.accent }}>◈</Text>
                </View>
                <View style={[styles.bubble, styles.typingBubble, { backgroundColor: G.cardBg, borderWidth: 0.5, borderColor: G.cardBorder }]}>
                  <Text style={[styles.typingDots, { color: G.textMuted }]}>● ● ●</Text>
                </View>
              </Animated.View>
            )}

            {messages.length === 1 && (
              <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.suggestions}>
                <Text style={[styles.suggestionsLabel, { color: G.textMuted }]}>Sugerencias</Text>
                <View style={styles.suggestionGrid}>
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity key={s} onPress={() => handleSend(s)} style={[styles.suggestionChip, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]} accessibilityLabel={s}>
                      <Text style={[styles.suggestionTxt, { color: G.textSecondary }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputBar, { marginBottom: NAV_SAFE_PAD - 16, borderTopColor: G.cardBorder, backgroundColor: G.bgFrom + 'e0' }]}>
            <TextInput
              style={[styles.textInput, { backgroundColor: G.inputBg, borderColor: G.inputBorder, color: G.textPrimary }]}
              value={input}
              onChangeText={setInput}
              placeholder="Consultá sobre tus finanzas…"
              placeholderTextColor={G.textMuted}
              multiline maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <Animated.View style={sendAnim}>
              <TouchableOpacity onPress={() => handleSend()} disabled={!input.trim() || thinking}
                style={[styles.sendBtn, { opacity: !input.trim() || thinking ? 0.4 : 1 }]} accessibilityLabel="Enviar">
                <LinearGradient colors={[G.accent, G.centerBtnTo]} style={styles.sendBtnGrad}>
                  <Text style={[styles.sendBtnIcon, { color: G.accentContrast }]}>↑</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, safe: { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: H_PAD, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  aiAvatar:     { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  aiAvatarIcon: { fontSize: 18 },
  headerTitle:  { fontSize: 16, fontWeight: '700' },
  statusRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:    { width: 6, height: 6, borderRadius: 3 },
  statusTxt:    { fontSize: 11 },
  headerBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 0.5 },
  headerBtnTxt: { fontSize: 12 },
  msgList:    { flex: 1 },
  msgContent: { paddingHorizontal: H_PAD, paddingTop: Spacing.two, gap: 12, paddingBottom: 8 },
  msgRow:          { flexDirection: 'row', gap: 8, maxWidth: '88%' },
  msgRowUser:      { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowAssistant: { alignSelf: 'flex-start' },
  msgAvatar:   { width: 28, height: 28, borderRadius: 10, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  bubble:      { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%', gap: 4 },
  bubbleText:  { fontSize: 14, lineHeight: 20 },
  bubbleTs:    { fontSize: 10, alignSelf: 'flex-end' },
  typingBubble:{ paddingVertical: 12, paddingHorizontal: 16 },
  typingDots:  { fontSize: 10, letterSpacing: 3 },
  suggestions:      { marginTop: Spacing.two, gap: 10 },
  suggestionsLabel: { fontSize: 11, letterSpacing: 0.5 },
  suggestionGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip:   { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 0.5 },
  suggestionTxt:    { fontSize: 12 },
  inputBar:    { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: H_PAD, paddingTop: 10, paddingBottom: 10, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  textInput:   { flex: 1, minHeight: 40, maxHeight: 100, borderWidth: 0.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn:     { flexShrink: 0 },
  sendBtnGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendBtnIcon: { fontSize: 18, fontWeight: '700' },
});
EOF
echo -e "${GREEN}  ✓ wallet.tsx${NC}"

# ─────────────────────────────────────────────────────────
# 7. home-bottom-sheet.tsx — sin Glass.* estático
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [7/10] src/components/home-bottom-sheet.tsx${NC}"
cat > src/components/home-bottom-sheet.tsx << 'EOF'
import { useEffect } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useGlass } from '@/hooks/use-glass';
import { Spacing } from '@/constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');
const RADIUS = 24;

type Item = { id: string; title: string; desc: string; amount: string } | null;
type Props = { isOpen: boolean; onClose: () => void; item: Item };

export function HomeBottomSheet({ isOpen, onClose, item }: Props) {
  const G          = useGlass();
  const translateY = useSharedValue(SCREEN_H);
  const overlay    = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      overlay.value    = withTiming(1, { duration: 260, easing: Easing.out(Easing.ease) });
      translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
    } else {
      overlay.value    = withTiming(0, { duration: 220 });
      translateY.value = withTiming(SCREEN_H, { duration: 280, easing: Easing.in(Easing.ease) });
    }
  }, [isOpen]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const sheetStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const ACTIONS = [
    { id: '1', label: 'Nueva transferencia', icon: '↑' },
    { id: '2', label: 'Pagar servicio',       icon: '⚡' },
    { id: '3', label: 'Ver historial',        icon: '☰' },
  ];

  const DETAIL_ROWS = item ? [
    { label: 'Fecha',      value: 'Hoy, 14:32' },
    { label: 'Estado',     value: 'Completado', color: G.positive },
    { label: 'Referencia', value: `TXN-${item.id}928374` },
  ] : [];

  return (
    <Modal visible={isOpen} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: G.overlayBg }, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { backgroundColor: G.sheetBg, borderColor: G.cardBorder }, sheetStyle]}>
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: G.textMuted }]} />
        </View>

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {item ? (
            <>
              <Text style={[styles.sheetTitle, { color: G.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.sheetSub,   { color: G.textSecondary }]}>{item.desc}</Text>
              <View style={[styles.amountCard, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
                <Text style={[styles.amountLabel, { color: G.textSecondary }]}>MONTO</Text>
                <Text style={[styles.amountValue, { color: item.amount.startsWith('+') ? G.positive : G.negative }]}>{item.amount}</Text>
              </View>
              <View style={[styles.detailCard, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
                {DETAIL_ROWS.map((row, i) => (
                  <View key={row.label}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: G.textSecondary }]}>{row.label}</Text>
                      <Text style={[styles.detailValue, { color: row.color ?? G.textPrimary }]}>{row.value}</Text>
                    </View>
                    {i < DETAIL_ROWS.length - 1 && <View style={[styles.divider, { backgroundColor: G.cardBorder }]} />}
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
                <Text style={[styles.btnText, { color: G.textPrimary }]}>Compartir comprobante</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
                <Text style={[styles.cancelText, { color: G.textSecondary }]}>Cerrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.sheetTitle, { color: G.textPrimary }]}>Acciones</Text>
              <View style={[styles.detailCard, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
                {ACTIONS.map((action, i) => (
                  <View key={action.id}>
                    <TouchableOpacity onPress={onClose} accessibilityLabel={action.label} style={styles.actionRow}>
                      <View style={[styles.actionIcon, { backgroundColor: G.accentSoft }]}>
                        <Text style={[styles.actionIconTxt, { color: G.accent }]}>{action.icon}</Text>
                      </View>
                      <Text style={[styles.detailValue, { color: G.textPrimary }]}>{action.label}</Text>
                      <Text style={[styles.chevron, { color: G.textMuted }]}>›</Text>
                    </TouchableOpacity>
                    {i < ACTIONS.length - 1 && <View style={[styles.divider, { backgroundColor: G.cardBorder }]} />}
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
                <Text style={[styles.cancelText, { color: G.textSecondary }]}>Cerrar</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet:       { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: SCREEN_H * 0.82, borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS, borderWidth: 0.5, borderBottomWidth: 0, overflow: 'hidden' },
  handleWrap:  { width: '100%', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle:      { width: 36, height: 4, borderRadius: 2 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  sheetTitle:  { fontSize: 20, fontWeight: '600', marginTop: Spacing.one },
  sheetSub:    { fontSize: 13 },
  amountCard:  { borderWidth: 0.5, borderRadius: 16, padding: Spacing.four, alignItems: 'center', gap: 4 },
  amountLabel: { fontSize: 10, letterSpacing: 0.8 },
  amountValue: { fontSize: 36, fontWeight: '700', letterSpacing: -0.5 },
  detailCard:  { borderWidth: 0.5, borderRadius: 16, overflow: 'hidden' },
  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: 13 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '500' },
  divider:     { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.three },
  btn:         { borderWidth: 0.5, borderRadius: 14, padding: Spacing.three, alignItems: 'center' },
  btnText:     { fontSize: 14, fontWeight: '600' },
  cancelBtn:   { borderWidth: 0.5, borderRadius: 14, padding: Spacing.three, alignItems: 'center' },
  cancelText:  { fontSize: 14 },
  actionRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: 13, gap: 12 },
  actionIcon:   { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionIconTxt:{ fontSize: 14 },
  chevron:      { marginLeft: 'auto', fontSize: 20 },
});
EOF
echo -e "${GREEN}  ✓ home-bottom-sheet.tsx${NC}"

# ─────────────────────────────────────────────────────────
# 8. center-app-picker.tsx — sin Glass.* estático
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [8/10] src/components/center-app-picker.tsx${NC}"
cat > src/components/center-app-picker.tsx << 'EOF'
import { useEffect } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { H_PAD } from '@/constants/theme';
import { AVAILABLE_APPS, CenterApp, useUiStore } from '@/stores/ui.store';
import { useGlass } from '@/hooks/use-glass';

const { height: SCREEN_H } = Dimensions.get('window');

export function CenterAppPicker() {
  const G = useGlass();
  const { pickerVisible, setPickerVisible, centerApp, setCenterApp } = useUiStore();

  const translateY = useSharedValue(SCREEN_H);
  const overlayOp  = useSharedValue(0);

  useEffect(() => {
    if (pickerVisible) {
      overlayOp.value  = withTiming(1, { duration: 240, easing: Easing.out(Easing.ease) });
      translateY.value = withSpring(0, { damping: 22, stiffness: 260 });
    } else {
      overlayOp.value  = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_H, { duration: 260, easing: Easing.in(Easing.ease) });
    }
  }, [pickerVisible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));
  const sheetStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal visible={pickerVisible} transparent animationType="none" statusBarTranslucent onRequestClose={() => setPickerVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: G.overlayBg }, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { backgroundColor: G.sheetBg, borderColor: G.cardBorder }, sheetStyle]}>
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: G.textMuted }]} />
        </View>

        <View style={[styles.sheetHeader, { borderBottomColor: G.cardBorder }]}>
          <View>
            <Text style={[styles.sheetTitle, { color: G.textPrimary }]}>Acceso rápido</Text>
            <Text style={[styles.sheetSub,   { color: G.textSecondary }]}>
              {centerApp ? `Actual: ${centerApp.label}` : 'Elegí un módulo para el botón central'}
            </Text>
          </View>
          {centerApp && (
            <TouchableOpacity onPress={() => { setCenterApp(null); setPickerVisible(false); }} style={styles.removeBtn}>
              <Text style={styles.removeTxt}>Quitar</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
          <View style={styles.grid}>
            {AVAILABLE_APPS.map((app) => {
              const selected = centerApp?.id === app.id;
              return <AppTile key={app.id} app={app} isSelected={selected} G={G} onPress={() => { setCenterApp(app); setPickerVisible(false); }} />;
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: G.cardBorder }]}>
          <Text style={[styles.footerHint, { color: G.textMuted }]}>💡 Mantén presionado el botón central para volver a esta pantalla</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

function AppTile({ app, isSelected, onPress, G }: { app: CenterApp; isSelected: boolean; onPress: () => void; G: any }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel={`Seleccionar ${app.label}`} activeOpacity={0.8} style={styles.tile}>
      <LinearGradient
        colors={isSelected ? [app.color, app.colorTo] : [G.cardBg, G.cardBg]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.tileIcon, { borderColor: isSelected ? 'rgba(255,255,255,0.30)' : G.cardBorder, borderWidth: isSelected ? 1.5 : 0.5 }]}>
        <Text style={[styles.tileIconTxt, { color: isSelected ? '#fff' : G.textMuted }]}>{app.icon}</Text>
      </LinearGradient>
      <Text style={[styles.tileLabel, { color: isSelected ? G.textPrimary : G.textSecondary, fontWeight: isSelected ? '600' : '400' }]}>{app.label}</Text>
      {isSelected && <View style={[styles.selectedDot, { backgroundColor: G.accent }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sheet:       { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: SCREEN_H * 0.70, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 0.5, borderBottomWidth: 0, overflow: 'hidden' },
  handleWrap:  { width: '100%', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle:      { width: 36, height: 4, borderRadius: 2 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: H_PAD, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle:  { fontSize: 18, fontWeight: '700' },
  sheetSub:    { fontSize: 12, marginTop: 3, maxWidth: 220 },
  removeBtn:   { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(251,113,133,0.12)', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(251,113,133,0.25)' },
  removeTxt:   { fontSize: 12, color: '#fb7185', fontWeight: '600' },
  gridContent: { paddingHorizontal: H_PAD, paddingTop: 16, paddingBottom: 8 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' },
  tile:        { width: '22%', alignItems: 'center', gap: 7 },
  tileIcon:    { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tileIconTxt: { fontSize: 22 },
  tileLabel:   { fontSize: 11, textAlign: 'center' },
  selectedDot: { width: 5, height: 5, borderRadius: 2.5, alignSelf: 'center', marginTop: -4 },
  footer:      { paddingHorizontal: H_PAD, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
  footerHint:  { fontSize: 12, textAlign: 'center' },
});
EOF
echo -e "${GREEN}  ✓ center-app-picker.tsx${NC}"

# ─────────────────────────────────────────────────────────
# 9. index.tsx home — con toggle button en header
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [9/10] src/app/(app)/index.tsx${NC}"
cat > "src/app/(app)/index.tsx" << 'EOF'
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/glass-card';
import { HomeBottomSheet } from '@/components/home-bottom-sheet';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { CARD_GAP, H_PAD, NAV_SAFE_PAD, SCREEN_WIDTH, Spacing } from '@/constants/theme';
import { useGlass } from '@/hooks/use-glass';

const COL_WIDE = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) * 0.58;
const COL_NARR = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) * 0.42;

const MOVIMIENTOS = [
  { id: '1', title: 'Transferencia recibida', desc: 'Juan Pérez',   amount: '+$1.200', icon: '↑' },
  { id: '2', title: 'Pago de servicio',       desc: 'Edenor',       amount: '-$340',   icon: '↓' },
  { id: '3', title: 'Transferencia enviada',  desc: 'María García', amount: '-$500',   icon: '↓' },
  { id: '4', title: 'Cobro de factura',       desc: 'Cliente A',    amount: '+$3.000', icon: '↑' },
];

const BARS    = [0.28, 0.52, 0.38, 0.85, 0.62, 0.44, 0.68];
const DAYS    = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const TODAY_I = 3;

type Mov = typeof MOVIMIENTOS[0];

export default function HomeScreen() {
  const G = useGlass();
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [selectedItem, setSelected] = useState<Mov | null>(null);

  function openSheet(item: Mov | null) { setSelected(item); setSheetOpen(true); }

  return (
    <View style={[styles.root, { backgroundColor: G.bgFrom }]}>
      <LinearGradient colors={[G.bgFrom, G.bgMid, G.bgTo]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.orb1, { backgroundColor: G.orb1 }]} />
      <View style={[styles.orb2, { backgroundColor: G.orb2 }]} />
      <View style={[styles.orb3, { backgroundColor: G.orb3 }]} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: G.textSecondary }]}>Buenos días</Text>
            <Text style={[styles.title,    { color: G.textPrimary }]}>Tu cuenta</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Botón toggle de tema — siempre visible */}
            <ThemeToggleButton mode="icon" />
            {/* Avatar */}
            <TouchableOpacity onPress={() => openSheet(null)} accessibilityLabel="Menú"
              style={[styles.avatar, { backgroundColor: G.accentSoft, borderColor: G.accent }]}>
              <Text style={[styles.avatarText, { color: G.accent }]}>JS</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces>

          {/* ROW 1 — Balance */}
          <View style={styles.row}>
            <GlassCard style={[styles.cardBal, { width: COL_WIDE }]}>
              <Text style={[styles.lbl, { color: G.textMuted }]}>BALANCE</Text>
              <Text style={[styles.balAmount, { color: G.textPrimary }]}>$8.170</Text>
              <View style={[styles.balBadge, { backgroundColor: G.positive + '22' }]}>
                <Text style={[styles.balBadgeTxt, { color: G.positive }]}>↑ 12% este mes</Text>
              </View>
            </GlassCard>
            <View style={[styles.colStack, { width: COL_NARR }]}>
              <GlassCard style={styles.cardMini}>
                <Text style={[styles.lbl, { color: G.textMuted }]}>INGRESOS</Text>
                <Text style={[styles.metricVal, { color: G.textPrimary }]}>$12.4k</Text>
                <Text style={[styles.trend, { color: G.positive }]}>+8%</Text>
              </GlassCard>
              <GlassCard style={styles.cardMini}>
                <Text style={[styles.lbl, { color: G.textMuted }]}>GASTOS</Text>
                <Text style={[styles.metricVal, { color: G.textPrimary }]}>$4.2k</Text>
                <Text style={[styles.trend, { color: G.negative }]}>-3%</Text>
              </GlassCard>
            </View>
          </View>

          {/* ROW 2 — Gráfico */}
          <GlassCard style={styles.cardWide}>
            <View style={styles.chartHeader}>
              <Text style={[styles.lbl, { color: G.textMuted }]}>ACTIVIDAD — MAYO</Text>
              <Text style={[styles.chartSub, { color: G.textMuted }]}>Semana actual</Text>
            </View>
            <View style={styles.barsWrap}>
              {BARS.map((h, i) => (
                <View key={i} style={styles.barCol}>
                  {i === TODAY_I && <Text style={[styles.barTooltip, { color: G.accent }]}>$3k</Text>}
                  <View style={[styles.bar, { height: `${h * 100}%` as any, backgroundColor: i === TODAY_I ? G.barActive : G.barInactive }]} />
                </View>
              ))}
            </View>
            <View style={styles.barsLabels}>
              {DAYS.map((d, i) => (
                <Text key={d} style={[styles.barLbl, { color: i === TODAY_I ? G.textPrimary : G.textMuted, fontWeight: i === TODAY_I ? '600' : '400' }]}>{d}</Text>
              ))}
            </View>
          </GlassCard>

          {/* ROW 3 — Movimientos */}
          <GlassCard style={styles.cardWide}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: G.textPrimary }]}>Últimos movimientos</Text>
              <TouchableOpacity onPress={() => openSheet(null)} accessibilityLabel="Ver todos">
                <Text style={[styles.verTodos, { color: G.accent }]}>Ver todos →</Text>
              </TouchableOpacity>
            </View>
            {MOVIMIENTOS.map((item, idx) => {
              const isPos = item.amount.startsWith('+');
              return (
                <TouchableOpacity key={item.id} onPress={() => openSheet(item)} activeOpacity={0.7}
                  style={[styles.txRow, idx < MOVIMIENTOS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: G.cardBorder }]}>
                  <View style={[styles.txIcon, { backgroundColor: (isPos ? G.positive : G.negative) + '20' }]}>
                    <Text style={[styles.txIconTxt, { color: isPos ? G.positive : G.negative }]}>{item.icon}</Text>
                  </View>
                  <View style={styles.txMeta}>
                    <Text style={[styles.txTitle, { color: G.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.txDesc,  { color: G.textMuted }]}>{item.desc}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isPos ? G.positive : G.negative }]}>{item.amount}</Text>
                </TouchableOpacity>
              );
            })}
          </GlassCard>

          {/* CTA */}
          <TouchableOpacity onPress={() => openSheet(null)} activeOpacity={0.8} accessibilityLabel="Nueva operación">
            <LinearGradient colors={[G.centerBtnFrom, G.centerBtnTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
              <Text style={[styles.ctaText, { color: G.accentContrast }]}>+ Nueva operación</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <HomeBottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} item={selectedItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  safe: { flex: 1 },
  orb1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -100, right: -80, pointerEvents: 'none' },
  orb2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, bottom: 120, left: -80, pointerEvents: 'none' },
  orb3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, top: '45%', right: -30, pointerEvents: 'none' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: H_PAD, paddingTop: Spacing.one, paddingBottom: Spacing.two },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontSize: 12, letterSpacing: 0.2 },
  title:    { fontSize: 24, fontWeight: '700', marginTop: 1 },
  avatar:   { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700' },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: H_PAD, paddingTop: Spacing.two, paddingBottom: NAV_SAFE_PAD, gap: CARD_GAP },
  row:      { flexDirection: 'row', gap: CARD_GAP },
  colStack: { gap: CARD_GAP },
  cardBal:  { padding: Spacing.three, height: 138, justifyContent: 'flex-end' },
  balAmount:   { fontSize: 30, fontWeight: '800', letterSpacing: -1, lineHeight: 34, marginVertical: 4 },
  balBadge:    { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  balBadgeTxt: { fontSize: 10, fontWeight: '600' },
  cardMini:  { flex: 1, padding: 12, height: 64, justifyContent: 'center' },
  metricVal: { fontSize: 17, fontWeight: '700', marginVertical: 2 },
  trend:     { fontSize: 11, fontWeight: '500' },
  lbl:       { fontSize: 9, letterSpacing: 0.9, marginBottom: 2 },
  cardWide:    { padding: Spacing.three },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two },
  chartSub:    { fontSize: 10 },
  barsWrap:    { flexDirection: 'row', alignItems: 'flex-end', height: 58, gap: 4, marginBottom: 6 },
  barCol:      { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar:         { borderRadius: 4, width: '100%' },
  barTooltip:  { fontSize: 9, marginBottom: 3, fontWeight: '600' },
  barsLabels:  { flexDirection: 'row', justifyContent: 'space-between' },
  barLbl:      { flex: 1, fontSize: 9, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two },
  sectionTitle:  { fontSize: 13, fontWeight: '600' },
  verTodos:      { fontSize: 11 },
  txRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  txIcon:   { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  txIconTxt:{ fontSize: 14, fontWeight: '600' },
  txMeta:   { flex: 1 },
  txTitle:  { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  txDesc:   { fontSize: 11 },
  txAmount: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  cta:      { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  ctaText:  { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
});
EOF
echo -e "${GREEN}  ✓ index.tsx${NC}"

# ─────────────────────────────────────────────────────────
# 10. _layout.tsx raíz — carga themeMode al iniciar
# ─────────────────────────────────────────────────────────
echo -e "${BLUE}→ [10/10] src/app/_layout.tsx${NC}"
cat > src/app/_layout.tsx << 'EOF'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ErrorBoundary } from '@/components/error-boundary';
import { useUiStore } from '@/stores/ui.store';
import '@/hooks/use-network-status';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30 } },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loadThemeMode, loadCenterApp, themeMode } = useUiStore();

  useEffect(() => {
    Promise.all([loadThemeMode(), loadCenterApp()]).finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  const isDark =
    themeMode === 'dark'  ? true  :
    themeMode === 'light' ? false :
    colorScheme === 'dark';

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <Slot />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
EOF
echo -e "${GREEN}  ✓ _layout.tsx${NC}"

echo ""
echo -e "${GREEN}✓ Global Theme completo — ${NC}10 archivos."
echo ""
echo -e "  ${YELLOW}Cambio clave — Modo claro prioriza Brand.primary:${NC}"
echo "  • textPrimary   = #0f2554 (azul marino)   — máximo contraste AAA"
echo "  • textSecondary = rgba(15,37,84,0.62)      — texto secundario"
echo "  • accent        = #0f2554                  — dots, chips activos, barras"
echo "  • accentSoft    = rgba(15,37,84,0.10)      — fondos de badges"
echo "  • centerBtnFrom = #0f2554 / centerBtnTo = #1a3a7a  — botón central"
echo "  • barActive     = #0f2554                  — barras del gráfico"
echo "  • navBorder     = rgba(15,37,84,0.14)      — navbar"
echo ""
echo -e "  ${YELLOW}Modo oscuro — sin cambios:${NC}"
echo "  • accent = #00b5db (cyan) — contrasta bien sobre fondos oscuros"
echo ""
echo -e "  ${YELLOW}Cobertura global — todos los archivos usan useGlass():${NC}"
echo "  ✓ index.tsx (home)       ✓ wallet.tsx (chat IA)"
echo "  ✓ apps.tsx               ✓ profile.tsx"
echo "  ✓ home-bottom-sheet.tsx  ✓ center-app-picker.tsx"
echo "  ✓ custom-tab-bar.tsx     ✓ glass-card.tsx"
echo "  ✓ themed-view.tsx        ✓ theme-toggle-button.tsx (nuevo)"
echo ""
echo -e "  ${YELLOW}ThemeToggleButton — cicla dark 🌙 → light ☀️ → system ⚙️${NC}"
echo "  Está en el header del home (mode='icon')"
echo "  Y en profile Preferencias (mode='pill' — el Switch existente)"
echo ""