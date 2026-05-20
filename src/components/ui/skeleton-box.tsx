import { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

type SkeletonBoxProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonBoxProps) {
  const theme = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.backgroundElement,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  style?: ViewStyle;
};

export function SkeletonText({ lines = 3, style }: SkeletonTextProps) {
  return (
    <Animated.View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          style={styles.textLine}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {},
  textContainer: { gap: 8 },
  textLine: {},
});
