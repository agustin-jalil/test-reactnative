import * as Haptics from 'expo-haptics';
import { Pressable, type PressableProps, StyleSheet } from 'react-native';

type PressableWithHapticsProps = PressableProps & {
  accessibilityLabel: string;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
};

export function PressableWithHaptics({
  onPress,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  style,
  ...props
}: PressableWithHapticsProps) {
  async function handlePress(e: Parameters<NonNullable<PressableProps['onPress']>>[0]) {
    await Haptics.impactAsync(hapticStyle);
    onPress?.(e);
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
  pressed: { opacity: 0.7 },
});
