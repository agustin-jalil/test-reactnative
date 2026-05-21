import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReelItem, ReelData } from '@/components/reel-item';
import { NAV_SAFE_PAD } from '@/constants/theme';

const { height: H } = Dimensions.get('window');

const REELS: ReelData[] = [
  {
    id: '1',
    username: '@sofia.dev',
    handle: 'Sofía Morales',
    caption: 'Nuevo feature en producción 🚀 así se ve el deploy sin romper nada por primera vez',
    song: 'Lo-fi Coding Beats — Chill Mix',
    likes: 14200,
    comments: 843,
    shares: 521,
    bgColors: ['#0f0c29', '#302b63'],
    avatarEmoji: '👩‍💻',
    following: false,
    videoUri: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: '2',
    username: '@fintech.tips',
    handle: 'Fintech Tips',
    caption: '3 formas de optimizar tu flujo de caja en menos de 5 minutos 💰',
    song: 'Future Bass — LoFi Records',
    likes: 8900,
    comments: 312,
    shares: 890,
    bgColors: ['#0d2545', '#1a4a7a'],
    avatarEmoji: '📊',
    following: true,
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: '3',
    username: '@crypto.ar',
    handle: 'Crypto Argentina',
    caption: 'Bitcoin rompió resistencia histórica ¿qué viene ahora? Te explico en 60 segundos ⚡',
    song: 'Electronic Vibes — DJ Nova',
    likes: 31000,
    comments: 2100,
    shares: 4200,
    bgColors: ['#1a0533', '#4a0e8f'],
    avatarEmoji: '₿',
    following: false,
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: '4',
    username: '@inversiones.ok',
    handle: 'Inversiones OK',
    caption: 'El error que comete el 90% al invertir sus primeros pesos 📉 → 📈',
    song: 'Motivational Trap — BeatsForge',
    likes: 22400,
    comments: 1560,
    shares: 3100,
    bgColors: ['#0a1628', '#163356'],
    avatarEmoji: '💡',
    following: false,
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: '5',
    username: '@martin.ux',
    handle: 'Martín UX',
    caption: 'Diseñé esta app en 48 horas usando solo Figma y café ☕ — proceso completo',
    song: 'Indie Pop Mix — Sunwave',
    likes: 9800,
    comments: 445,
    shares: 720,
    bgColors: ['#0d1f0d', '#1a4a1a'],
    avatarEmoji: '🎨',
    following: true,
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
];

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab,   setActiveTab]   = useState<'para-ti' | 'siguiendo'>('para-ti');

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  // FIX: react-native-web requiere viewAreaCoveragePercentThreshold (0–1)
  // NO usar itemVisibilityPercentThreshold — falla en web
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  });

  const renderItem = useCallback(
    ({ item, index }: { item: ReelData; index: number }) => (
      <ReelItem item={item} isActive={index === activeIndex} />
    ),
    [activeIndex],
  );

  return (
    <View style={styles.root}>
      {/* Top tabs — Para ti / Siguiendo */}
      <View style={[styles.topTabs, { paddingTop: insets.top + 8 }]}>
        {(['para-ti', 'siguiendo'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            accessibilityLabel={tab === 'para-ti' ? 'Para ti' : 'Siguiendo'}
            style={styles.topTabBtn}>
            <Text style={[styles.topTabTxt, activeTab === tab && styles.topTabTxtActive]}>
              {tab === 'para-ti' ? 'Para ti' : 'Siguiendo'}
            </Text>
            {activeTab === tab && <View style={styles.topTabLine} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Label REELS top left */}
      <View style={[styles.reelsLabel, { top: insets.top + 10 }]}>
        <Text style={styles.reelsLabelTxt}>Reels</Text>
      </View>

      <FlatList
        data={REELS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={H}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({ length: H, offset: H * index, index })}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: NAV_SAFE_PAD }}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topTabs: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
    gap: 32, zIndex: 20, paddingBottom: 8,
  },
  topTabBtn:       { alignItems: 'center', paddingHorizontal: 4 },
  topTabTxt:       { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.45)' },
  topTabTxtActive: { color: '#fff', fontWeight: '700' },
  topTabLine:      { width: 20, height: 2, backgroundColor: '#fff', borderRadius: 1, marginTop: 4 },
  reelsLabel:      { position: 'absolute', left: 16, zIndex: 20 },
  reelsLabelTxt:   { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
});
