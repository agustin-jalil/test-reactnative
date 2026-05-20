import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { clearAllTokens } from '@/services/keychain';
import { toast } from '@/stores/ui.store';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

  async function logout() {
    try {
      await clearAllTokens();
      storeLogout();
      router.replace('/(auth)/login');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  }

  return { user, isAuthenticated, logout };
}
