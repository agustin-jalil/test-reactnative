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
