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
