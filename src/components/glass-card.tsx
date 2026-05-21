import { StyleSheet, View, type ViewProps } from 'react-native';
import { useGlass } from '@/hooks/use-glass';

type GlassCardProps = ViewProps & { active?: boolean };

export function GlassCard({ style, active = false, children, ...props }: GlassCardProps) {
  const G = useGlass();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: G.cardBg,
          borderColor: active ? G.cardBorderActive : G.cardBorder,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 0.5, borderRadius: 20, overflow: 'hidden' },
});
