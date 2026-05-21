import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue,
  withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H_PAD, NAV_BOTTOM, NAV_HEIGHT } from '@/constants/theme';
import { useGlass } from '@/hooks/use-glass';
import { useUiStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';

type Tab = { name: string; href: string; label: string; icon?: string; center?: boolean; isAvatar?: boolean };

const TABS: Tab[] = [
  { name: 'index',   href: '/(app)',         label: 'Inicio', icon: '⌂' },
  { name: 'explore', href: '/(app)/explore', label: 'Reels',  icon: '▶' },
  { name: 'center',  href: '',               label: '',        center: true },
  { name: 'wallet',  href: '/(app)/wallet',  label: 'IA',     icon: '◈' },
  { name: 'profile', href: '/(app)/profile', label: 'Perfil', isAvatar: true },
];

function usePressSpring() {
  const scale = useSharedValue(1);
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  function press(cb: () => void) {
    scale.value = withSpring(0.85, { duration: 80 }, () => { scale.value = withSpring(1, { duration: 200 }); });
    cb();
  }
  return { anim, press };
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function SmartCenterBtn() {
  const router = useRouter();
  const G      = useGlass();
  const { centerApp, loadCenterApp } = useUiStore();
  useEffect(() => { loadCenterApp(); }, []);

  const scale    = useSharedValue(1);
  const glowSize = useSharedValue(0);
  const btnAnim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowAnim = useAnimatedStyle(() => ({
    width: 50 + glowSize.value, height: 50 + glowSize.value,
    borderRadius: (50 + glowSize.value) / 2,
    opacity: glowSize.value / 30,
    marginLeft: -(glowSize.value / 2), marginTop: -(glowSize.value / 2),
  }));

  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLong   = useRef(false);
  const pressedAt = useRef(0);

  function startPress() {
    didLong.current   = false;
    pressedAt.current = Date.now();
    scale.value = withTiming(0.93, { duration: 600 });
    glowSize.value = withRepeat(withSequence(withTiming(28, { duration: 280 }), withTiming(8, { duration: 280 })), -1, false);
    longTimer.current = setTimeout(() => {
      didLong.current = true;
      scale.value    = withSpring(1, { damping: 8 });
      glowSize.value = withTiming(0, { duration: 150 });
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      router.push('/(app)/apps' as any);
    }, 600);
  }

  function endPress() {
    if (longTimer.current) clearTimeout(longTimer.current);
    scale.value    = withSpring(1, { damping: 10 });
    glowSize.value = withTiming(0, { duration: 120 });
    if (!didLong.current && Date.now() - pressedAt.current < 600) {
      scale.value = withSequence(withSpring(0.85, { duration: 80 }), withSpring(1, { duration: 200 }));
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push((centerApp?.href ?? '/(app)/apps') as any);
    }
  }

  const icon    = centerApp?.icon    ?? '✦';
  const colFrom = centerApp?.color   ?? G.centerBtnFrom;
  const colTo   = centerApp?.colorTo ?? G.centerBtnTo;

  return (
    <View style={styles.centerWrapper}>
      <Animated.View style={[styles.glowRing, { backgroundColor: G.accentSoft }, glowAnim]} />
      <Animated.View style={btnAnim}>
        <TouchableOpacity onPressIn={startPress} onPressOut={endPress} activeOpacity={1}
          accessibilityLabel={centerApp ? `Abrir ${centerApp.label}` : 'Configurar acceso rápido'}>
          <LinearGradient colors={[colFrom, colTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.centerBtn}>
            <Text style={styles.centerIcon}>{icon}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      {centerApp
        ? <Text style={[styles.centerLabel, { color: G.textSecondary }]} numberOfLines={1}>{centerApp.label}</Text>
        : <Text style={[styles.centerHint,  { color: G.textMuted }]}>mantén para apps</Text>
      }
    </View>
  );
}

function AvatarBtn({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const router  = useRouter();
  const G       = useGlass();
  const { anim, press } = usePressSpring();
  const { user } = useAuthStore();
  const initials = user ? getInitials(user.name) : 'U';
  return (
    <TouchableOpacity onPress={() => press(() => router.push(tab.href as any))} accessibilityLabel="Mi perfil" style={styles.tabItem}>
      <Animated.View style={[anim, styles.avatarTab, {
        backgroundColor: G.accentSoft,
        borderColor: isActive ? G.accent : G.cardBorder,
      }]}>
        <Text style={[styles.avatarTabTxt, { color: G.accent }]}>{initials}</Text>
      </Animated.View>
      {isActive && <View style={[styles.activeDot, { backgroundColor: G.accent }]} />}
    </TouchableOpacity>
  );
}

function RegularBtn({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const router = useRouter();
  const G      = useGlass();
  const { anim, press } = usePressSpring();
  return (
    <TouchableOpacity onPress={() => press(() => router.push(tab.href as any))} accessibilityLabel={tab.label} style={styles.tabItem}>
      <Animated.View style={[anim, styles.tabInner]}>
        <Text style={[styles.tabIcon, isActive && { color: G.textPrimary }]}>{tab.icon}</Text>
      </Animated.View>
      {isActive && <View style={[styles.activeDot, { backgroundColor: G.accent }]} />}
    </TouchableOpacity>
  );
}

export function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const G      = useGlass();
  const isWeb  = Platform.OS === 'web';

  function isActive(tab: Tab) {
    if (tab.center) return false;
    if (tab.href === '/(app)') return pathname === '/' || pathname === '/(app)';
    return pathname.includes(tab.name);
  }

  const containerStyle = isWeb
    ? [styles.container, { backgroundColor: G.navBg, borderColor: G.navBorder }, styles.containerWeb]
    : [styles.container, { backgroundColor: G.navBg, borderColor: G.navBorder }, {
        position: 'absolute' as const,
        bottom: (insets.bottom || 0) + NAV_BOTTOM,
        left: H_PAD, right: H_PAD,
      }];

  return (
    <View style={containerStyle}>
      {TABS.map((t) => {
        if (t.center)   return <SmartCenterBtn  key={t.name} />;
        if (t.isAvatar) return <AvatarBtn key={t.name} tab={t} isActive={isActive(t)} />;
        return              <RegularBtn key={t.name} tab={t} isActive={isActive(t)} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: NAV_HEIGHT, borderWidth: 0.5,
    borderRadius: NAV_HEIGHT / 2,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8, zIndex: 100,
  },
  containerWeb: { position: 'sticky' as any, bottom: NAV_BOTTOM, marginHorizontal: H_PAD, marginBottom: NAV_BOTTOM, alignSelf: 'stretch' },
  tabItem:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 },
  tabInner:  { alignItems: 'center' },
  tabIcon:   { fontSize: 18, lineHeight: 22, color: 'rgba(128,128,128,0.50)' },
  activeDot: { width: 3, height: 3, borderRadius: 1.5, marginTop: 2 },
  avatarTab: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarTabTxt: { fontSize: 10, fontWeight: '700' },
  centerWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: -26, position: 'relative' },
  glowRing:  { position: 'absolute', zIndex: -1 },
  centerBtn: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  centerIcon: { fontSize: 22, color: '#fff', lineHeight: 26 },
  centerLabel: { fontSize: 9, lineHeight: 11, maxWidth: 52, textAlign: 'center' },
  centerHint:  { fontSize: 8, lineHeight: 10, textAlign: 'center' },
});
