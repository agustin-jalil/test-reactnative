import { StyleSheet, View, type ViewProps } from 'react-native';
import { Glass } from '@/constants/theme';

type GlassCardProps = ViewProps & { active?: boolean };

export function GlassCard({ style, active = false, children, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        { borderColor: active ? Glass.cardBorderActive : Glass.cardBorder },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Glass.cardBg,
    borderWidth: 0.5,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
