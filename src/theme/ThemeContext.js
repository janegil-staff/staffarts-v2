import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors } from './colors';
import { spacing, radius, fontSize } from './spacing';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'themeMode';

export function ThemeProvider({ children }) {
  // 'light' | 'dark'
  const [mode, setMode] = useState('light');
  const [hydrated, setHydrated] = useState(false);

  // Restore saved mode on mount
  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      })
      .catch((e) => {
        if (__DEV__) console.log('Theme hydration failed:', e);
      })
      .finally(() => setHydrated(true));
  }, []);

  const colors = mode === 'dark' ? darkColors : lightColors;

  const setThemeMode = async (newMode) => {
    setMode(newMode);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, newMode);
    } catch (e) {
      if (__DEV__) console.log('Theme save failed:', e);
    }
  };

  const toggleTheme = () => {
    setThemeMode(mode === 'dark' ? 'light' : 'dark');
  };

  const value = {
    colors,
    spacing,
    radius,
    fontSize,
    mode,
    isDark: mode === 'dark',
    setThemeMode,
    toggleTheme,
    hydrated,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}