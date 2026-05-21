import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ToastType  = 'success' | 'error' | 'info';
export type Toast      = { id: string; type: ToastType; message: string };
export type ThemeMode  = 'dark' | 'light' | 'system';
export type AppCategory = 'Pagos' | 'Inversiones' | 'Social' | 'Gestión' | 'Utilidades';

export type CenterApp = {
  id: string; label: string; icon: string; href: string;
  color: string; colorTo: string; category: AppCategory; description: string;
};

export const AVAILABLE_APPS: CenterApp[] = [
  { id: 'transfer', label: 'Transferir',   icon: '↑',  href: '/(app)/wallet',  color: '#0f2554', colorTo: '#1a3a7a', category: 'Pagos',       description: 'Enviá dinero a cualquier contacto' },
  { id: 'pay',      label: 'Pagar',        icon: '$',  href: '/(app)/wallet',  color: '#00b5db', colorTo: '#007fa0', category: 'Pagos',       description: 'Pagá servicios, facturas y comercios' },
  { id: 'qr',       label: 'QR Cobrar',    icon: '▦',  href: '/(app)/wallet',  color: '#059669', colorTo: '#047857', category: 'Pagos',       description: 'Generá un QR para cobrar' },
  { id: 'request',  label: 'Solicitar',    icon: '↓',  href: '/(app)/wallet',  color: '#f2931b', colorTo: '#c46e0a', category: 'Pagos',       description: 'Pedile dinero a un contacto' },
  { id: 'invest',   label: 'Invertir',     icon: '📈', href: '/(app)/wallet',  color: '#1d4ed8', colorTo: '#1e3a8a', category: 'Inversiones', description: 'Plazos fijos, FCI y más desde $100' },
  { id: 'crypto',   label: 'Cripto',       icon: '₿',  href: '/(app)/wallet',  color: '#d97706', colorTo: '#92400e', category: 'Inversiones', description: 'Comprá y vendé criptomonedas' },
  { id: 'savings',  label: 'Ahorro',       icon: '🏦', href: '/(app)/wallet',  color: '#0369a1', colorTo: '#075985', category: 'Inversiones', description: 'Cajas de ahorro con rendimiento diario' },
  { id: 'reels',    label: 'Reels',        icon: '▶',  href: '/(app)/explore', color: '#db2777', colorTo: '#9d174d', category: 'Social',      description: 'Explorá contenido financiero en video' },
  { id: 'contacts', label: 'Contactos',    icon: '👥', href: '/(app)/profile', color: '#7c3aed', colorTo: '#6d28d9', category: 'Social',      description: 'Tus contactos frecuentes' },
  { id: 'refer',    label: 'Referidos',    icon: '🎁', href: '/(app)/profile', color: '#be185d', colorTo: '#9d174d', category: 'Social',      description: 'Invitá amigos y ganás beneficios' },
  { id: 'ia',       label: 'Asistente IA', icon: '◈',  href: '/(app)/wallet',  color: '#00b5db', colorTo: '#007fa0', category: 'Gestión',     description: 'Consultá tus finanzas con IA' },
  { id: 'history',  label: 'Historial',    icon: '☰',  href: '/(app)',         color: '#374151', colorTo: '#1f2937', category: 'Gestión',     description: 'Todos tus movimientos' },
  { id: 'cards',    label: 'Tarjetas',     icon: '▬',  href: '/(app)/wallet',  color: '#0f2554', colorTo: '#080f2a', category: 'Gestión',     description: 'Administrá tus tarjetas de débito' },
  { id: 'limits',   label: 'Límites',      icon: '⊘',  href: '/(app)/wallet',  color: '#991b1b', colorTo: '#7f1d1d', category: 'Gestión',     description: 'Configurá límites de transferencia' },
  { id: 'profile',  label: 'Perfil',       icon: '◉',  href: '/(app)/profile', color: '#0f2554', colorTo: '#1a3a7a', category: 'Utilidades',  description: 'Tu cuenta y configuración' },
  { id: 'security', label: 'Seguridad',    icon: '🛡',  href: '/(app)/profile', color: '#1e3a8a', colorTo: '#172554', category: 'Utilidades',  description: 'PIN, biometría y dispositivos' },
  { id: 'notif',    label: 'Alertas',      icon: '🔔', href: '/(app)/profile', color: '#f2931b', colorTo: '#c46e0a', category: 'Utilidades',  description: 'Configurá tus notificaciones' },
];

export const ALL_CATEGORIES: AppCategory[] = ['Pagos', 'Inversiones', 'Social', 'Gestión', 'Utilidades'];

const KEY_CENTER = 'center_app_v2';
const KEY_THEME  = 'theme_mode';

type UiState = {
  isLoading:   boolean;
  toasts:      Toast[];
  centerApp:   CenterApp | null;
  themeMode:   ThemeMode;
  setLoading:     (v: boolean) => void;
  addToast:       (type: ToastType, message: string) => void;
  removeToast:    (id: string) => void;
  setCenterApp:   (app: CenterApp | null) => Promise<void>;
  loadCenterApp:  () => Promise<void>;
  setThemeMode:   (mode: ThemeMode) => Promise<void>;
  loadThemeMode:  () => Promise<void>;
};

export const useUiStore = create<UiState>((set) => ({
  isLoading: false,
  toasts:    [],
  centerApp: null,
  themeMode: 'dark',

  setLoading: (isLoading) => set({ isLoading }),

  addToast: (type, message) =>
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id: Date.now().toString(), type, message }] })),

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  setCenterApp: async (app) => {
    set({ centerApp: app });
    try { app ? await AsyncStorage.setItem(KEY_CENTER, JSON.stringify(app)) : await AsyncStorage.removeItem(KEY_CENTER); } catch {}
  },

  loadCenterApp: async () => {
    try { const r = await AsyncStorage.getItem(KEY_CENTER); if (r) set({ centerApp: JSON.parse(r) }); } catch {}
  },

  setThemeMode: async (themeMode) => {
    set({ themeMode });
    try { await AsyncStorage.setItem(KEY_THEME, themeMode); } catch {}
  },

  loadThemeMode: async () => {
    try { const r = await AsyncStorage.getItem(KEY_THEME); if (r) set({ themeMode: r as ThemeMode }); } catch {}
  },
}));

export const toast = {
  success: (m: string) => useUiStore.getState().addToast('success', m),
  error:   (m: string) => useUiStore.getState().addToast('error', m),
  info:    (m: string) => useUiStore.getState().addToast('info', m),
};
