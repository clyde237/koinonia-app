import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type ThemeColors } from './theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = 'koinonia_theme_mode';

let secureStoreModule: typeof import('expo-secure-store') | null | undefined;
async function getSecureStore() {
  if (secureStoreModule === undefined) {
    try {
      secureStoreModule = await import('expo-secure-store');
    } catch {
      secureStoreModule = null;
    }
  }
  return secureStoreModule;
}

const memoryStore = new Map<string, string>();

async function getSavedTheme(): Promise<ThemeMode | null> {
  try {
    const ss = await getSecureStore();
    if (ss) {
      const val = await ss.getItemAsync(THEME_STORAGE_KEY);
      if (val === 'light' || val === 'dark' || val === 'system') return val;
    }
  } catch {
    // ignore
  }
  const mem = memoryStore.get(THEME_STORAGE_KEY);
  if (mem === 'light' || mem === 'dark' || mem === 'system') return mem;
  return null;
}

async function saveTheme(mode: ThemeMode): Promise<void> {
  memoryStore.set(THEME_STORAGE_KEY, mode);
  try {
    const ss = await getSecureStore();
    if (ss) {
      await ss.setItemAsync(THEME_STORAGE_KEY, mode);
    }
  } catch {
    // ignore
  }
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: false,
  colors: lightTheme,
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    getSavedTheme().then(saved => {
      if (saved) {
        setModeState(saved);
      }
    });
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return systemScheme === 'dark';
  }, [mode, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    saveTheme(newMode);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setMode(nextMode);
  };

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      setMode,
      toggleTheme,
    }),
    [mode, isDark, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      mode: 'light',
      isDark: false,
      colors: lightTheme,
      setMode: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
