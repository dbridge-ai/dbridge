import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Mode } from './presets';
import { editions, currentEdition } from './edition';

interface ThemeState {
  mode: Mode;
  preset: string;
}

interface ThemeContextValue extends ThemeState {
  setMode: (mode: Mode) => void;
  setPreset: (preset: string) => void;
  allowedPresets: string[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'dbridge_theme';

function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.mode === 'light' || parsed.mode === 'dark') {
        const allowed = editions[currentEdition].allowed;
        const preset = allowed.includes(parsed.preset) ? parsed.preset : editions[currentEdition].defaultPreset;
        return { mode: parsed.mode, preset };
      }
    }
  } catch {}
  return { mode: 'light', preset: editions[currentEdition].defaultPreset };
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ThemeState>(loadTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.setAttribute('data-mode', state.mode);
    document.documentElement.setAttribute('data-preset', state.preset);
    document.documentElement.classList.toggle('dark', state.mode === 'dark');
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', state.mode);
    document.documentElement.setAttribute('data-preset', state.preset);
    document.documentElement.classList.toggle('dark', state.mode === 'dark');
  }, []);

  const setMode = useCallback((mode: Mode) => setState(prev => ({ ...prev, mode })), []);
  const setPreset = useCallback((preset: string) => setState(prev => ({ ...prev, preset })), []);

  const value = useMemo<ThemeContextValue>(() => ({
    ...state,
    setMode,
    setPreset,
    allowedPresets: editions[currentEdition].allowed,
  }), [state, setMode, setPreset]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
