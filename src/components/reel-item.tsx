import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from '@/constants/theme';

const { width: W, height: H } = Dimensions.get('window');

export type ReelData = {
  id: string;
  username: string;
  handle: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
  bgColors: [string, string];
  avatarEmoji: string;
  following: boolean;
  videoUri?: string;
};

type Props = { item: ReelData; isActive: boolean };

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// Componente de video lazy: solo renderiza cuando es el reel activo
function ReelVideo({ uri, isActive }: { uri: string; isActive: boolean }) {
  if (Platform.OS === 'web') {
    // En web usamos <video> nativo directamente — no hay expo-video en web
    return (
      <video
        src={uri}
        autoPlay={isActive}
        loop
        muted
        playsInline
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
        } as any}
      />
    );
  }

  // En nativo: expo-video (instalar: npx expo install expo-video)
  // Descomenta cuando lo instales:
  // const player = useVideoPlayer(uri, (p) => { p.loop = true; if (isActive) p.play(); else p.pause(); });
  // return <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />;

  // Fallback placeholder hasta tener expo-video instalado
  return null;
}

export function ReelItem({ item, isActive }: Props) {
  const [liked,     setLiked]     = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [following, setFollowing] = useState(item.following);
  const [muted,     setMuted]     = useState(false);

  const heartScale   = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const heartAnim    = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity:   heartOpacity.value,
  }));

  const likeScale = useSharedValue(1);
  const likeAnim  = useAnimatedStyle(() => ({ transform: [{ scale: likeScale.value }] }));

  const lastTap = useRef(0);

  function triggerHeartBurst() {
    heartScale.value   = 0;
    heartOpacity.value = 1;
    heartScale.value   = withSpring(1.25, { damping: 8, stiffness: 180 }, () => {
      heartScale.value   = withTiming(0,   { duration: 280 });
      heartOpacity.value = withTiming(0,   { duration: 280 });
    });
  }

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
        likeScale.value = withSequence(
          withSpring(1.4, { damping: 6 }),
          withSpring(1,   { damping: 10 }),
        );
      }
      triggerHeartBurst();
    }
    lastTap.current = now;
  }, [liked]);

  function handleLikeBtn() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLiked((v) => !v);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    likeScale.value = withSequence(
      withSpring(1.35, { damping: 6, stiffness: 300 }),
      withSpring(1,    { damping: 10 }),
    );
  }

  function handleFollow() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFollowing((v) => !v);
  }

  return (
    <View style={[styles.container, { width: W, height: H }]}>
      {/* Fondo: gradiente siempre presente, video encima si hay uri */}
      <LinearGradient
        colors={item.bgColors}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Círculos decorativos (visibles cuando no hay video) */}
      {!item.videoUri && (
        <>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
        </>
      )}

      {/* Video real */}
      {item.videoUri && (
        <ReelVideo uri={item.videoUri} isActive={isActive} />
      )}

      {/* Tap area para doble tap */}
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Heart burst */}
      <Animated.Text style={[styles.heartBurst, heartAnim]}>❤️</Animated.Text>

      {/* Mute */}
      <TouchableOpacity
        onPress={() => setMuted((v) => !v)}
        style={styles.muteBtn}
        accessibilityLabel={muted ? 'Activar sonido' : 'Silenciar'}>
        <Text style={styles.muteIcon}>{muted ? '🔇' : '🔊'}</Text>
      </TouchableOpacity>

      {/* Gradiente inferior */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Progress bar */}
      {isActive && (
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      )}

      {/* Side actions */}
      <View style={styles.sideActions}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
          </View>
          <TouchableOpacity
            onPress={handleFollow}
            style={[styles.followBtn, following && styles.followBtnActive]}
            accessibilityLabel={following ? 'Dejar de seguir' : 'Seguir'}>
            <Text style={[styles.followIcon, following && { color: '#7c3aed' }]}>
              {following ? '✓' : '+'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLikeBtn} style={styles.actionBtn} accessibilityLabel="Me gusta">
          <Animated.Text style={[styles.actionIcon, likeAnim, { color: liked ? '#fb7185' : '#fff' }]}>
            {liked ? '❤️' : '🤍'}
          </Animated.Text>
          <Text style={styles.actionLabel}>{formatCount(likeCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} accessibilityLabel="Comentarios">
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>{formatCount(item.comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} accessibilityLabel="Compartir">
          <Text style={styles.actionIcon}>➤</Text>
          <Text style={styles.actionLabel}>{formatCount(item.shares)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} accessibilityLabel="Más opciones">
          <Text style={[styles.actionIcon, { fontSize: 20, letterSpacing: 2 }]}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
        <View style={styles.songRow}>
          <Text style={styles.songIcon}>♫</Text>
          <Text style={styles.songName} numberOfLines={1}>{item.song}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden', backgroundColor: '#000' },

  patternCircle1: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -60, right: -80,
  },
  patternCircle2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: 200, left: -60,
  },

  heartBurst: {
    position: 'absolute', alignSelf: 'center', top: '38%',
    fontSize: 90, zIndex: 20,
  },

  muteBtn: {
    position: 'absolute', top: 52, right: 16,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  muteIcon: { fontSize: 16 },

  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 340,
  },

  progressBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(255,255,255,0.20)', zIndex: 20,
  },
  progressFill: {
    width: '60%', height: '100%',
    backgroundColor: '#fff', borderRadius: 1,
  },

  sideActions: {
    position: 'absolute', right: 12, bottom: 120,
    alignItems: 'center', gap: 20, zIndex: 10,
  },
  avatarWrap: { alignItems: 'center' },
  avatarRing: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 26 },
  followBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fb7185',
    alignItems: 'center', justifyContent: 'center',
    marginTop: -10, borderWidth: 1.5, borderColor: '#000',
  },
  followBtnActive: { backgroundColor: '#fff' },
  followIcon: { fontSize: 11, color: '#fff', fontWeight: '800', lineHeight: 14 },

  actionBtn:   { alignItems: 'center', gap: 4 },
  actionIcon:  { fontSize: 28, lineHeight: 32, color: '#fff' },
  actionLabel: {
    fontSize: 12, color: '#fff', fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  bottomInfo: {
    position: 'absolute', bottom: 110, left: 14, right: 76,
    gap: 6, zIndex: 10,
  },
  username: { fontSize: 15, fontWeight: '700', color: '#fff' },
  caption:  { fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 18 },
  songRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  songIcon: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  songName: { fontSize: 12, color: 'rgba(255,255,255,0.75)', flex: 1 },
});
