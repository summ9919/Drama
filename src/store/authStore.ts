import { create } from 'zustand';

type AuthState = { isSignedIn: boolean; setSignedIn: (value: boolean) => void };

export const useAuthStore = create<AuthState>((set) => ({ isSignedIn: false, setSignedIn: (isSignedIn) => set({ isSignedIn }) }));
