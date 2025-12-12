"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';

// Supported locales
export const locales = ['en', 'tr'] as const;
export type Locale = typeof locales[number];

// Default locale
export const defaultLocale: Locale = 'tr';

// Translations type
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

const translations: Record<Locale, Translations> = {
  en,
  tr,
};

// Get nested value from object using dot notation
function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: TranslationValue = obj;
  
  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = current[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

// Replace placeholders like {name} with actual values
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() ?? match;
  });
}

// Context type
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Provider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);
  
  // Load locale from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);
  
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);
  
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[locale], key);
    return interpolate(translation, params);
  }, [locale]);
  
  // Use default locale for SSR to avoid hydration mismatch
  const contextValue = {
    locale: mounted ? locale : defaultLocale,
    setLocale,
    t: mounted ? t : (key: string, params?: Record<string, string | number>) => {
      const translation = getNestedValue(translations[defaultLocale], key);
      return interpolate(translation, params);
    },
  };
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use translations
export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
}

// Hook to get just the t function (convenience)
export function useT() {
  const { t } = useTranslation();
  return t;
}

// Language names for display
export const languageNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
};

// Language flags for display
export const languageFlags: Record<Locale, string> = {
  en: '🇺🇸',
  tr: '🇹🇷',
};
