import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type CaptureState = {
  capturedUri: string | null;
  savedUris: string[];
  favoriteUris: string[];
  setCapturedUri: (uri: string | null) => void;
  addSavedUri: (uri: string) => void;
  clearCapturedUri: () => void;
  toggleFavorite: (uri: string) => void;
  isFavorite: (uri: string) => boolean;
};

export const useCaptureStore = create<CaptureState>()(
  persist(
    (set, get) => ({
      capturedUri: null,
      savedUris: [],
      favoriteUris: [],
      setCapturedUri: (capturedUri) => set({ capturedUri }),
      addSavedUri: (uri) => set((state) => ({ savedUris: [uri, ...state.savedUris.filter((item) => item !== uri)] })),
      clearCapturedUri: () => set({ capturedUri: null }),
      toggleFavorite: (uri) => set((state) => {
        const list = state.favoriteUris || [];
        const exists = list.includes(uri);
        return {
          favoriteUris: exists ? list.filter((item) => item !== uri) : [uri, ...list],
        };
      }),
      isFavorite: (uri) => (get().favoriteUris || []).includes(uri),
    }),
    {
      name: 'warm-lens-captures',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ savedUris: state.savedUris, favoriteUris: state.favoriteUris || [] }),
    },
  ),
);
