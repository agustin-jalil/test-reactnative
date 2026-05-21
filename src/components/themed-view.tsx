import { View, type ViewProps } from 'react-native';
import { useGlass } from '@/hooks/use-glass';
import { GlassTokens } from '@/constants/theme';

// type puede ser cualquier clave de GlassTokens que sea un string de color
export type ThemedViewProps = ViewProps & {
  type?: 'background' | 'backgroundElement' | 'backgroundSelected' | 'card' | 'cardElevated';
};

export function ThemedView({ style, type = 'background', ...props }: ThemedViewProps) {
  const G = useGlass();

  const bgMap: Record<string, string> = {
    background:          G.bgFrom,
    backgroundElement:   G.cardBg,
    backgroundSelected:  G.cardBgElevated,
    card:                G.cardBg,
    cardElevated:        G.cardBgElevated,
  };

  return (
    <View style={[{ backgroundColor: bgMap[type] ?? G.bgFrom }, style]} {...props} />
  );
}
