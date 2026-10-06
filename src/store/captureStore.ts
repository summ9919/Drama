import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type CaptureState = {
  capturedUri: string | null;
  savedUris: string[];
  setCapturedUri: (uri: string | null) => void;
  addSavedUri: (uri: string) => void;
  clearCapturedUri: () => void;
};

export const useCaptureStore = create<CaptureState>()(
  persist(
    (set) => ({
      capturedUri: null,
      savedUris: [],
      setCapturedUri: (capturedUri) => set({ capturedUri }),
      addSavedUri: (uri) => set((state) => ({ savedUris: [uri, ...state.savedUris.filter((item) => item !== uri)] })),
      clearCapturedUri: () => set({ capturedUri: null }),
    }),
    {
      name: 'warm-lens-captures',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ savedUris: state.savedUris }),
    },
  ),
);
