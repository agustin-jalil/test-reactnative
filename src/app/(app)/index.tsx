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
