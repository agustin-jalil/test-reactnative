import { Slot } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { CustomTabBar } from '@/components/custom-tab-bar';

export default function AppLayout() {
  return (
    <View style={styles.root}>
      <Slot />
      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100dvh' as any,
      width: '100%',
    }),
  },
});
