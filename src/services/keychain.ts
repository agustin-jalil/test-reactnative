import * as SecureStore from 'expo-secure-store';

type TokenKey = 'access_token' | 'refresh_token';

export async function saveToken(key: TokenKey, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`[keychain] Error saving ${key}:`, error);
  }
}

export async function getToken(key: TokenKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`[keychain] Error getting ${key}:`, error);
    return null;
  }
}

export async function removeToken(key: TokenKey): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`[keychain] Error removing ${key}:`, error);
  }
}

export async function clearAllTokens(): Promise<void> {
  await removeToken('access_token');
  await removeToken('refresh_token');
}
