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
