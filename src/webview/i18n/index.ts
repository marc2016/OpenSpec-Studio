import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { en, TranslationSchema } from './en';
import { de } from './de';

export type SupportedLocale = 'en' | 'de';

const catalogs: Record<SupportedLocale, TranslationSchema> = {
  en,
  de
};

/**
 * Resolves a nested key in an object (e.g. 'header.title').
 */
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Replaces `{paramName}` placeholders with corresponding values.
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

/**
 * Looks up and formats a translated string for a given locale.
 */
export function getTranslation(
  locale: SupportedLocale = 'en',
  key: string,
  params?: Record<string, string | number>
): string {
  const activeCatalog = catalogs[locale] || catalogs.en;
  let text: string | undefined;

  // Check for pluralization support if params contains 'count'
  if (params && typeof params.count === 'number') {
    const pluralSuffix = params.count === 1 ? '_one' : '_other';
    text = getNestedValue(activeCatalog, `${key}${pluralSuffix}`);
    if (!text && locale !== 'en') {
      text = getNestedValue(catalogs.en, `${key}${pluralSuffix}`);
    }
  }

  // Fallback to exact key
  if (!text) {
    text = getNestedValue(activeCatalog, key);
  }

  // Fallback to English catalog if not found in active catalog
  if (!text && locale !== 'en') {
    text = getNestedValue(catalogs.en, key);
  }

  // Fallback to raw key if not found anywhere
  if (!text) {
    return key;
  }

  return interpolate(text, params);
}

interface I18nContextType {
  locale: SupportedLocale;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: (key, params) => getTranslation('en', key, params)
});

export interface I18nProviderProps {
  locale?: string;
  children: ReactNode;
}

export function I18nProvider({ locale = 'en', children }: I18nProviderProps) {
  const normalizedLocale: SupportedLocale = locale.toLowerCase().startsWith('de') ? 'de' : 'en';

  const value = useMemo<I18nContextType>(() => {
    return {
      locale: normalizedLocale,
      t: (key: string, params?: Record<string, string | number>) =>
        getTranslation(normalizedLocale, key, params)
    };
  }, [normalizedLocale]);

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation() {
  return useContext(I18nContext);
}
