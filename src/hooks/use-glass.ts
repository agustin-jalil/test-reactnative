import { useColorScheme } from 'react-native';
import { GlassDark, GlassLight, GlassTokens } from '@/constants/theme';
import { useUiStore } from '@/stores/ui.store';

export function useGlass(): GlassTokens {
  const { themeMode } = useUiStore();
  const system = useColorScheme();
  if (themeMode === 'light')  return GlassLight;
  if (themeMode === 'dark')   return GlassDark;
  return system === 'light' ? GlassLight : GlassDark;
}

export function useIsDark(): boolean {
  const { themeMode } = useUiStore();
  const system = useColorScheme();
  if (themeMode === 'light') return false;
  if (themeMode === 'dark')  return true;
  return system !== 'light';
}
