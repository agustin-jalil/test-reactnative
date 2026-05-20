import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type UiState = {
  isLoading: boolean;
  toasts: Toast[];
  setLoading: (loading: boolean) => void;
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isLoading: false,
  toasts: [],
  setLoading: (isLoading) => set({ isLoading }),
  addToast: (type, message) =>
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-2),
        { id: Date.now().toString(), type, message },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) =>
    useUiStore.getState().addToast('success', message),
  error: (message: string) =>
    useUiStore.getState().addToast('error', message),
  info: (message: string) =>
    useUiStore.getState().addToast('info', message),
};
