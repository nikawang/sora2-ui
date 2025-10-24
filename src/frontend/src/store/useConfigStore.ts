import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AzureConfig } from '../types/config';

interface ConfigState {
  config: AzureConfig | null;
  setConfig: (config: AzureConfig) => void;
  clearConfig: () => void;
  updateConnectionStatus: (isConnected: boolean) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: null,
      
      setConfig: (config) => set({ config }),
      
      clearConfig: () => set({ config: null }),
      
      updateConnectionStatus: (isConnected) =>
        set((state) => ({
          config: state.config
            ? {
                ...state.config,
                isConnected,
                lastValidated: new Date().toISOString(),
              }
            : null,
        })),
    }),
    {
      name: 'azure-config-storage',
    }
  )
);
