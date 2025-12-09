import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
  };
  isBiometricsEnabled: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleNotifications: (type: 'push' | 'email') => void;
  toggleBiometrics: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      notifications: {
        push: true,
        email: true,
      },
      isBiometricsEnabled: false,
      setTheme: (theme) => {
        set({ theme });
        // In a real app with NativeWind v4+, we might need to manually toggle classes
        // or rely on the system appearance if using 'system'.
        // For now, we'll just store the preference.
      },
      toggleNotifications: (type) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [type]: !state.notifications[type],
          },
        })),
      toggleBiometrics: () =>
        set((state) => ({
          isBiometricsEnabled: !state.isBiometricsEnabled,
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
