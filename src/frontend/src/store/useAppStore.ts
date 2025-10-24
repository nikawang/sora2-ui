import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useConfigStore } from './useConfigStore';
import { useTaskStore } from './useTaskStore';
import type { UserPreferences } from '../types/config';

interface AppState {
  preferences: UserPreferences;
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  resetApp: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  defaultResolution: '1280x720',
  defaultDuration: 8,
  autoPreview: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      
      setPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),
      
      resetApp: () => {
        set({ preferences: defaultPreferences });
        useConfigStore.getState().clearConfig();
        useTaskStore.getState().clearHistory();
      },
    }),
    {
      name: 'app-storage',
    }
  )
);
