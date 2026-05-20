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
