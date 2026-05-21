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
