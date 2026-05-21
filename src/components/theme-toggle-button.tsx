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
