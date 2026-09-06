'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, VALID_LANGUAGE_CODES } from '@/lib/languages';

// Language union type is derived from the config array — adding a language
// to SUPPORTED_LANGUAGES automatically extends this type.
export type Language = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  isGuidanceOpen: boolean;
  guidanceInitialTab: 'guide' | 'accessibility' | 'recorder';
  openGuidance: (tab?: 'guide' | 'accessibility' | 'recorder') => void;
  closeGuidance: () => void;
  stagedAudioBlob: Blob | null;
  stageAudioForDiagnosis: (blob: Blob | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('hi');
  const [isGuidanceOpen, setIsGuidanceOpen] = useState<boolean>(false);
  const [guidanceInitialTab, setGuidanceInitialTab] = useState<'guide' | 'accessibility' | 'recorder'>('guide');
  const [stagedAudioBlob, setStagedAudioBlob] = useState<Blob | null>(null);

  // Initialize theme and language on mount
  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('fasalsetu_theme') as Theme | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setThemeState(initial);
      applyTheme(initial);
    }

    // Language initialization — validated against config set, not hardcoded codes
    const savedLang = localStorage.getItem('fasalsetu_lang');
    if (savedLang && VALID_LANGUAGE_CODES.has(savedLang)) {
      setLanguageState(savedLang as Language);
    }

    // Check if first-time visitor to show guidance
    const hasSeenGuide = localStorage.getItem('fasalsetu_has_seen_guide');
    if (!hasSeenGuide) {
      setIsGuidanceOpen(true);
      localStorage.setItem('fasalsetu_has_seen_guide', 'true');
    }

    // Sync state if changed in another tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'fasalsetu_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
      if (e.key === 'fasalsetu_lang' && e.newValue && VALID_LANGUAGE_CODES.has(e.newValue)) {
        setLanguageState(e.newValue as Language);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (t === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    localStorage.setItem('fasalsetu_theme', nextTheme);
    applyTheme(nextTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fasalsetu_lang', lang);
  };

  const openGuidance = (tab: 'guide' | 'accessibility' | 'recorder' = 'guide') => {
    setGuidanceInitialTab(tab);
    setIsGuidanceOpen(true);
  };

  const closeGuidance = () => {
    setIsGuidanceOpen(false);
  };

  const stageAudioForDiagnosis = (blob: Blob | null) => {
    setStagedAudioBlob(blob);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        language,
        toggleTheme,
        setLanguage,
        isGuidanceOpen,
        guidanceInitialTab,
        openGuidance,
        closeGuidance,
        stagedAudioBlob,
        stageAudioForDiagnosis,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
