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
