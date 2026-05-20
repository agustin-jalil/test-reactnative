#!/bin/bash
# =============================================================================
# SFVC Mobile — Glass Bento v3
# Fixes: modal ancho correcto, scroll sin corte, container de ancho máximo
# Uso: chmod +x gen-glass-bento-v3.sh && ./gen-glass-bento-v3.sh
# =============================================================================

set -e

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}→${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

echo ""; echo "  SFVC — Glass Bento v3 (fixes modal + scroll)"; echo "  =============================================="; echo ""

# =============================================================================
# 1. DEPENDENCIAS
# =============================================================================
log "Verificando dependencias..."
npx expo install expo-linear-gradient
npm install @gorhom/bottom-sheet
ok "Dependencias listas"

# =============================================================================
# 2. THEME
# =============================================================================
log "Actualizando src/constants/theme.ts..."
cat > src/constants/theme.ts << 'EOF'
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
EOF
ok "theme.ts actualizado"

# =============================================================================
# 3. GLASS CARD
# =============================================================================
log "Generando src/components/glass-card.tsx..."
cat > src/components/glass-card.tsx << 'EOF'
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Glass } from '@/constants/theme';

type GlassCardProps = ViewProps & { active?: boolean };

export function GlassCard({ style, active = false, children, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        { borderColor: active ? Glass.cardBorderActive : Glass.cardBorder },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Glass.cardBg,
    borderWidth: 0.5,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
EOF
ok "glass-card.tsx listo"

# =============================================================================
# 4. FLOATING NAVBAR
# =============================================================================
log "Generando src/components/custom-tab-bar.tsx..."
cat > src/components/custom-tab-bar.tsx << 'EOF'
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, H_PAD, NAV_BOTTOM, NAV_HEIGHT } from '@/constants/theme';

type Tab = { name: string; href: string; label: string; icon: string; center?: boolean };

const TABS: Tab[] = [
  { name: 'index',   href: '/(app)',         label: 'Inicio',   icon: '⌂' },
  { name: 'explore', href: '/(app)/explore', label: 'Explorar', icon: '◎' },
  { name: 'pay',     href: '/(app)/wallet',  label: 'Pagar',    icon: '+', center: true },
  { name: 'wallet',  href: '/(app)/wallet',  label: 'Wallet',   icon: '▣' },
  { name: 'profile', href: '/(app)/profile', label: 'Perfil',   icon: '◉' },
];

function useSpring() {
  const scale = useSharedValue(1);
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  function press(cb: () => void) {
    scale.value = withSpring(0.87, { duration: 80 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    cb();
  }
  return { anim, press };
}

function CenterBtn({ tab }: { tab: Tab }) {
  const router = useRouter();
  const { anim, press } = useSpring();
  return (
    <TouchableOpacity
      onPress={() => press(() => router.push(tab.href as any))}
      accessibilityLabel={tab.label}
      style={styles.centerWrapper}>
      <Animated.View style={anim}>
        <LinearGradient
          colors={[Glass.centerBtnFrom, Glass.centerBtnTo]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.centerBtn}>
          <Text style={styles.centerIcon}>{tab.icon}</Text>
        </LinearGradient>
      </Animated.View>
      <Text style={styles.centerLabel}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

function RegularBtn({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const router = useRouter();
  const { anim, press } = useSpring();
  return (
    <TouchableOpacity
      onPress={() => press(() => router.push(tab.href as any))}
      accessibilityLabel={tab.label}
      style={styles.tabItem}>
      <Animated.View style={[anim, styles.tabInner]}>
        <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
      </Animated.View>
      {isActive && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
}

export function CustomTabBar() {
  const insets   = useSafeAreaInsets();
  const pathname = usePathname();

  function isActive(tab: Tab) {
    if (tab.center) return false;
    if (tab.href === '/(app)') return pathname === '/' || pathname === '/(app)';
    return pathname.includes(tab.name);
  }

  return (
    <View style={[styles.container, { bottom: (insets.bottom || 0) + NAV_BOTTOM }]}>
      {TABS.map((t) =>
        t.center
          ? <CenterBtn  key={t.name} tab={t} />
          : <RegularBtn key={t.name} tab={t} isActive={isActive(t)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: H_PAD, right: H_PAD,
    height: NAV_HEIGHT,
    backgroundColor: Glass.navBg,
    borderWidth: 0.5, borderColor: Glass.navBorder,
    borderRadius: NAV_HEIGHT / 2,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    zIndex: 10,
  },
  tabItem:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 },
  tabInner:      { alignItems: 'center' },
  tabIcon:       { fontSize: 20, lineHeight: 24, color: 'rgba(255,255,255,0.32)' },
  tabIconActive: { color: 'rgba(255,255,255,0.95)' },
  activeDot:     { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' },
  centerWrapper: { flex: 1, alignItems: 'center', gap: 5, marginTop: -28 },
  centerBtn: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55, shadowRadius: 16, elevation: 12,
  },
  centerIcon:  { fontSize: 24, color: '#fff', fontWeight: '300', lineHeight: 28 },
  centerLabel: { fontSize: 9, color: 'rgba(255,255,255,0.42)', lineHeight: 12 },
});
EOF
ok "custom-tab-bar.tsx listo"

# =============================================================================
# 5. BOTTOM SHEET — fix ancho modal + scroll interno
# Clave: el Modal usa flex para centrar, el sheet tiene width: '100%'
# =============================================================================
log "Generando src/components/home-bottom-sheet.tsx..."
cat > src/components/home-bottom-sheet.tsx << 'EOF'
import { useEffect, useRef } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import { Glass, Spacing } from '@/constants/theme';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const SHEET_RADIUS = 24;

type Item = { id: string; title: string; desc: string; amount: string } | null;
type Props = { isOpen: boolean; onClose: () => void; item: Item };

export function HomeBottomSheet({ isOpen, onClose, item }: Props) {
  const translateY     = useSharedValue(SCREEN_H);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      overlayOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.ease) });
      translateY.value     = withTiming(0,       { duration: 320, easing: Easing.out(Easing.cubic) });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 220 });
      translateY.value     = withTiming(SCREEN_H, { duration: 280, easing: Easing.in(Easing.ease) });
    }
  }, [isOpen]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const ACTIONS = [
    { id: '1', label: 'Nueva transferencia', icon: '↑' },
    { id: '2', label: 'Pagar servicio',       icon: '⚡' },
    { id: '3', label: 'Ver historial',        icon: '☰' },
  ];

  const DETAIL_ROWS = item ? [
    { label: 'Fecha',      value: 'Hoy, 14:32' },
    { label: 'Estado',     value: 'Completado', color: Glass.positive },
    { label: 'Referencia', value: `TXN-${item.id}928374` },
  ] : [];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>

      {/* Overlay — toca para cerrar */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      {/* Sheet — anclado al fondo, ancho 100% de la pantalla */}
      <Animated.View style={[styles.sheetWrapper, sheetStyle]}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {/* Contenido scrolleable */}
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

          {item ? (
            <>
              <Text style={styles.sheetTitle}>{item.title}</Text>
              <Text style={styles.sheetSub}>{item.desc}</Text>

              {/* Monto */}
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>MONTO</Text>
                <Text style={[styles.amountValue,
                  { color: item.amount.startsWith('+') ? Glass.positive : Glass.negative }]}>
                  {item.amount}
                </Text>
              </View>

              {/* Detalles */}
              <View style={styles.detailCard}>
                {DETAIL_ROWS.map((row, i) => (
                  <View key={row.label}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={[styles.detailValue, row.color ? { color: row.color } : {}]}>
                        {row.value}
                      </Text>
                    </View>
                    {i < DETAIL_ROWS.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={onClose} accessibilityLabel="Compartir" style={styles.btn}>
                <Text style={styles.btnText}>Compartir comprobante</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Cerrar" style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sheetTitle}>Acciones</Text>
              <View style={styles.detailCard}>
                {ACTIONS.map((action, i) => (
                  <View key={action.id}>
                    <TouchableOpacity
                      onPress={onClose}
                      accessibilityLabel={action.label}
                      style={styles.actionRow}>
                      <View style={styles.actionIcon}>
                        <Text style={styles.actionIconTxt}>{action.icon}</Text>
                      </View>
                      <Text style={styles.detailValue}>{action.label}</Text>
                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                    {i < ACTIONS.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Cerrar" style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: Glass.overlayBg },

  // Sheet anclado al fondo, ocupa ancho completo
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,                        // 100% del ancho de pantalla
    maxHeight: SCREEN_H * 0.82,
    backgroundColor: Glass.sheetBg,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    borderWidth: 0.5,
    borderColor: Glass.cardBorder,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },

  handleWrap: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },

  sheetTitle: { fontSize: 20, fontWeight: '600', color: Glass.textPrimary, marginTop: Spacing.one },
  sheetSub:   { fontSize: 13, color: Glass.textSecondary, marginTop: -Spacing.two },

  amountCard: {
    backgroundColor: Glass.cardBg, borderWidth: 0.5, borderColor: Glass.cardBorder,
    borderRadius: 16, padding: Spacing.four, alignItems: 'center', gap: 4,
  },
  amountLabel: { fontSize: 10, color: Glass.textSecondary, letterSpacing: 0.8 },
  amountValue: { fontSize: 36, fontWeight: '700', letterSpacing: -0.5 },

  detailCard: {
    backgroundColor: Glass.cardBg, borderWidth: 0.5,
    borderColor: Glass.cardBorder, borderRadius: 16, overflow: 'hidden',
  },
  detailRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: 13 },
  detailLabel:{ fontSize: 13, color: Glass.textSecondary },
  detailValue:{ fontSize: 13, color: Glass.textPrimary, fontWeight: '500' },
  divider:    { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: Spacing.three },

  btn:       { backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 0.5, borderColor: Glass.cardBorder, borderRadius: 14, padding: Spacing.three, alignItems: 'center' },
  btnText:   { fontSize: 14, fontWeight: '600', color: Glass.textPrimary },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: Glass.cardBorder, borderRadius: 14, padding: Spacing.three, alignItems: 'center' },
  cancelText:{ fontSize: 14, color: Glass.textSecondary },

  actionRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: 13, gap: 12 },
  actionIcon:   { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  actionIconTxt:{ fontSize: 14, color: Glass.textPrimary },
  chevron:      { marginLeft: 'auto', fontSize: 20, color: Glass.textSecondary },
});
EOF
ok "home-bottom-sheet.tsx — ancho correcto + scroll interno + animación manual"

# =============================================================================
# 6. (app)/_layout.tsx
# =============================================================================
log "Reescribiendo src/app/(app)/_layout.tsx..."
cat > "src/app/(app)/_layout.tsx" << 'EOF'
import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CustomTabBar } from '@/components/custom-tab-bar';

export default function AppLayout() {
  return (
    <View style={styles.root}>
      <Slot />
      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
EOF
ok "(app)/_layout.tsx listo"

# =============================================================================
# 7. HOME SCREEN — bento glass, scroll que no se corta
# Fix clave: flex:1 en root + SafeAreaView, paddingBottom = NAV_SAFE_PAD
# =============================================================================
log "Generando src/app/(app)/index.tsx..."
cat > "src/app/(app)/index.tsx" << 'EOF'
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { HomeBottomSheet } from '@/components/home-bottom-sheet';
import {
  CARD_GAP,
  Glass,
  H_PAD,
  NAV_SAFE_PAD,
  SCREEN_WIDTH,
  Spacing,
} from '@/constants/theme';

// Columnas del bento calculadas con el ancho real de pantalla
const COL_WIDE = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) * 0.58;
const COL_NARR = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) * 0.42;

const MOVIMIENTOS = [
  { id: '1', title: 'Transferencia recibida', desc: 'Juan Pérez',   amount: '+$1.200' },
  { id: '2', title: 'Pago de servicio',       desc: 'Edenor',       amount: '-$340'   },
  { id: '3', title: 'Transferencia enviada',  desc: 'María García', amount: '-$500'   },
  { id: '4', title: 'Cobro de factura',       desc: 'Cliente A',    amount: '+$3.000' },
];

const BARS = [0.30, 0.55, 0.40, 0.80, 0.60, 0.45, 0.70];
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

type Mov = typeof MOVIMIENTOS[0];

export default function HomeScreen() {
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [selectedItem, setSelected] = useState<Mov | null>(null);

  function openSheet(item: Mov | null) {
    setSelected(item);
    setSheetOpen(true);
  }

  return (
    // root ocupa toda la pantalla — el fondo del gradiente cubre detrás del scroll
    <View style={styles.root}>
      <LinearGradient
        colors={[Glass.bgFrom, Glass.bgMid, Glass.bgTo]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Orbs decorativos */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      {/* SafeAreaView solo para top — bottom lo maneja el padding del scroll */}
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header fuera del scroll para que no se mueva */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Buenos días</Text>
            <Text style={styles.title}>Tu cuenta</Text>
          </View>
          <TouchableOpacity
            onPress={() => openSheet(null)}
            accessibilityLabel="Abrir opciones"
            style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </TouchableOpacity>
        </View>

        {/* ScrollView — flex:1 para ocupar el espacio restante sin cortarse */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces>

          {/* BENTO ROW 1 — balance + métricas */}
          <View style={styles.row}>
            <GlassCard style={[styles.cardBal, { width: COL_WIDE }]}>
              <View style={styles.balOrb} />
              <Text style={styles.lbl}>BALANCE</Text>
              <Text style={styles.balAmount}>$8.170</Text>
              <Text style={styles.balSub}>Actualizado hoy</Text>
            </GlassCard>

            <View style={[styles.colStack, { width: COL_NARR }]}>
              <GlassCard style={styles.cardMini}>
                <Text style={styles.lbl}>INGRESOS</Text>
                <Text style={styles.metricVal}>$12.4k</Text>
                <Text style={[styles.trend, { color: Glass.positive }]}>+8%</Text>
              </GlassCard>
              <GlassCard style={styles.cardMini}>
                <Text style={styles.lbl}>GASTOS</Text>
                <Text style={styles.metricVal}>$4.2k</Text>
                <Text style={[styles.trend, { color: Glass.negative }]}>-3%</Text>
              </GlassCard>
            </View>
          </View>

          {/* BENTO ROW 2 — gráfico de barras */}
          <GlassCard style={styles.cardWide}>
            <Text style={styles.lbl}>ACTIVIDAD — MAYO</Text>
            <View style={styles.barsWrap}>
              {BARS.map((h, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, {
                    height: `${h * 100}%`,
                    backgroundColor: i === 3 ? Glass.barActive : Glass.barInactive,
                  }]} />
                </View>
              ))}
            </View>
            <View style={styles.barsLabels}>
              {DAYS.map((d) => (
                <Text key={d} style={styles.barLbl}>{d}</Text>
              ))}
            </View>
          </GlassCard>

          {/* BENTO ROW 3 — movimientos */}
          <GlassCard style={styles.cardWide}>
            <View style={styles.sectionHeader}>
              <Text style={styles.lbl}>ÚLTIMOS MOVIMIENTOS</Text>
              <TouchableOpacity onPress={() => openSheet(null)} accessibilityLabel="Ver todos">
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {MOVIMIENTOS.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => openSheet(item)}
                accessibilityLabel={`Ver ${item.title}`}
                style={[
                  styles.txRow,
                  idx < MOVIMIENTOS.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: 'rgba(255,255,255,0.08)',
                  },
                ]}>
                <View style={styles.txIcon}>
                  <Text style={styles.txIconTxt}>
                    {item.amount.startsWith('+') ? '↑' : '↓'}
                  </Text>
                </View>
                <View style={styles.txMeta}>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  <Text style={styles.txDesc}>{item.desc}</Text>
                </View>
                <Text style={[
                  styles.txAmount,
                  { color: item.amount.startsWith('+') ? Glass.positive : Glass.negative },
                ]}>
                  {item.amount}
                </Text>
              </TouchableOpacity>
            ))}
          </GlassCard>

          {/* CTA */}
          <TouchableOpacity onPress={() => openSheet(null)} accessibilityLabel="Nueva operación">
            <GlassCard active style={styles.cta}>
              <Text style={styles.ctaText}>+ Nueva operación</Text>
            </GlassCard>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* Modal sheet — fuera del SafeAreaView para cubrir todo */}
      <HomeBottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        item={selectedItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  orb1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: Glass.orb1, top: -80, right: -60 },
  orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Glass.orb2, bottom: 200, left: -60 },
  orb3: { position: 'absolute', width: 160, height: 160, borderRadius: 80,  backgroundColor: Glass.orb3, top: 260, right: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  greeting:   { fontSize: 12, color: Glass.textSecondary, letterSpacing: 0.3 },
  title:      { fontSize: 22, fontWeight: '600', color: Glass.textPrimary, marginTop: 2 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '600', color: Glass.textPrimary },

  // scrollView con flex:1 — ocupa todo el espacio disponible
  scrollView:    { flex: 1 },
  scrollContent: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.two,
    paddingBottom: NAV_SAFE_PAD,  // espacio para la navbar flotante
    gap: CARD_GAP,
  },

  row:      { flexDirection: 'row', gap: CARD_GAP },
  colStack: { gap: CARD_GAP },

  cardBal: { padding: Spacing.three, minHeight: 128, justifyContent: 'flex-end', overflow: 'hidden' },
  balOrb:  { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(100,60,255,0.28)', top: -20, right: -20 },
  balAmount: { fontSize: 26, fontWeight: '700', color: Glass.textPrimary, letterSpacing: -0.5, marginVertical: 4 },
  balSub:    { fontSize: 11, color: Glass.textMuted },

  cardMini:  { flex: 1, padding: 12, minHeight: 60 },
  metricVal: { fontSize: 16, fontWeight: '700', color: Glass.textPrimary, marginVertical: 3 },
  trend:     { fontSize: 11 },
  lbl:       { fontSize: 10, color: Glass.textSecondary, letterSpacing: 0.8, marginBottom: Spacing.two },

  cardWide:  { padding: Spacing.three },
  barsWrap:  { flexDirection: 'row', alignItems: 'flex-end', height: 52, gap: 5, marginBottom: 6 },
  barCol:    { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar:       { borderRadius: 3, width: '100%' },
  barsLabels:{ flexDirection: 'row', justifyContent: 'space-between' },
  barLbl:    { flex: 1, fontSize: 9, color: Glass.textMuted, textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two },
  seeAll:        { fontSize: 11, color: Glass.textSecondary },

  txRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 12 },
  txIcon:   { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  txIconTxt:{ fontSize: 13, color: Glass.textPrimary },
  txMeta:   { flex: 1, gap: 2 },
  txTitle:  { fontSize: 12, fontWeight: '500', color: Glass.textPrimary },
  txDesc:   { fontSize: 11, color: Glass.textMuted },
  txAmount: { fontSize: 13, fontWeight: '600' },

  cta:     { padding: Spacing.three, alignItems: 'center' },
  ctaText: { fontSize: 14, fontWeight: '600', color: Glass.textPrimary },
});
EOF
ok "src/app/(app)/index.tsx generado"

# =============================================================================
# 8. VERIFICAR
# =============================================================================
log "Verificando con expo-doctor..."
npx expo-doctor

echo ""
echo -e "${GREEN}  Listo — v3${NC}"
echo "  ==========="
echo ""
echo "  Fixes aplicados:"
echo "    ✓ Modal sheet: left:0 right:0 — ancho exacto de pantalla"
echo "    ✓ Sheet tiene maxHeight: 82% — nunca más grande que la pantalla"
echo "    ✓ Scroll interno en el sheet con ScrollView"
echo "    ✓ Animación manual translate — sin dependencia de @gorhom"
echo "    ✓ ScrollView home con flex:1 — no se corta en pantalla en blanco"
echo "    ✓ paddingBottom = NAV_SAFE_PAD — último elemento visible sobre navbar"
echo "    ✓ SCREEN_WIDTH en theme.ts — columnas bento siempre correctas"
echo "    ✓ Orbs de luz con posición absoluta fuera del scroll"
echo ""
echo "  Correr:"
echo "    npx expo start --clear"
echo ""