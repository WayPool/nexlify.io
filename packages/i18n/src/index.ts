/**
 * @platform/i18n
 *
 * Internationalization utilities with full type safety.
 */

import { IntlMessageFormat } from 'intl-messageformat';

// =============================================================================
// Types
// =============================================================================

export type Locale = 'en' | 'es';

export type TranslationValue = string | Record<string, TranslationValue>;

export interface TranslationMessages {
  [key: string]: TranslationValue;
}

export interface I18nConfig {
  defaultLocale: Locale;
  fallbackLocale: Locale;
  messages: Record<Locale, TranslationMessages>;
}

// =============================================================================
// Constants
// =============================================================================

export const DEFAULT_LOCALE: Locale = 'en';
export const FALLBACK_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];

// =============================================================================
// I18n Class
// =============================================================================

export class I18n {
  private locale: Locale;
  private fallbackLocale: Locale;
  private messages: Record<Locale, TranslationMessages>;
  private cache: Map<string, IntlMessageFormat> = new Map();

  constructor(config: I18nConfig) {
    this.locale = config.defaultLocale;
    this.fallbackLocale = config.fallbackLocale;
    this.messages = config.messages;
  }

  /**
   * Get current locale
   */
  getLocale(): Locale {
    return this.locale;
  }

  /**
   * Set current locale
   */
  setLocale(locale: Locale): void {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      console.warn(`Unsupported locale: ${locale}, falling back to ${this.fallbackLocale}`);
      this.locale = this.fallbackLocale;
      return;
    }
    this.locale = locale;
    this.cache.clear(); // Clear cache on locale change
  }

  /**
   * Load messages for a locale
   */
  loadMessages(locale: Locale, messages: TranslationMessages): void {
    this.messages[locale] = {
      ...this.messages[locale],
      ...messages,
    };
    this.cache.clear();
  }

  /**
   * Translate a key
   */
  t(key: string, params?: Record<string, string | number | boolean | Date>): string {
    const message = this.getMessage(key);

    if (!message) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }

    if (!params) {
      return message;
    }

    // Use IntlMessageFormat for parameterized messages
    const cacheKey = `${this.locale}:${key}`;
    let formatter = this.cache.get(cacheKey);

    if (!formatter) {
      try {
        formatter = new IntlMessageFormat(message, this.locale);
        this.cache.set(cacheKey, formatter);
      } catch (error) {
        console.error(`Invalid message format for key: ${key}`, error);
        return message;
      }
    }

    try {
      return formatter.format(params) as string;
    } catch (error) {
      console.error(`Error formatting message for key: ${key}`, error);
      return message;
    }
  }

  /**
   * Get message from messages object
   */
  private getMessage(key: string): string | undefined {
    // Try current locale
    let message = this.getNestedValue(this.messages[this.locale], key);

    // Fallback to fallback locale
    if (!message && this.locale !== this.fallbackLocale) {
      message = this.getNestedValue(this.messages[this.fallbackLocale], key);
    }

    return message;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: TranslationMessages | undefined, key: string): string | undefined {
    if (!obj) return undefined;

    const keys = key.split('.');
    let value: TranslationValue | undefined = obj;

    for (const k of keys) {
      if (typeof value !== 'object' || value === null) {
        return undefined;
      }
      value = (value as Record<string, TranslationValue>)[k];
    }

    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Check if a key exists
   */
  hasKey(key: string): boolean {
    return this.getMessage(key) !== undefined;
  }

  /**
   * Get all keys (for validation)
   */
  getAllKeys(locale: Locale = this.locale): string[] {
    const keys: string[] = [];
    const collectKeys = (obj: TranslationMessages, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') {
          keys.push(fullKey);
        } else {
          collectKeys(value, fullKey);
        }
      }
    };
    collectKeys(this.messages[locale] || {});
    return keys;
  }
}

// =============================================================================
// React Hook (for use in React apps)
// =============================================================================

let globalI18n: I18n | null = null;

export function initI18n(config: I18nConfig): I18n {
  globalI18n = new I18n(config);
  return globalI18n;
}

export function getI18n(): I18n {
  if (!globalI18n) {
    throw new Error('I18n not initialized. Call initI18n first.');
  }
  return globalI18n;
}

export function t(key: string, params?: Record<string, string | number | boolean | Date>): string {
  return getI18n().t(key, params);
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Format number for current locale
 */
export function formatNumber(value: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format currency for current locale
 */
export function formatCurrency(
  value: number,
  currency: string = 'EUR',
  locale: Locale = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date for current locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale = DEFAULT_LOCALE,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format relative time
 */
export function formatRelativeTime(
  date: Date | string,
  locale: Locale = DEFAULT_LOCALE
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSecs) < 60) {
    return rtf.format(diffSecs, 'second');
  } else if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else {
    return rtf.format(diffDays, 'day');
  }
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const browserLocale = navigator.language.split('-')[0];
  return SUPPORTED_LOCALES.includes(browserLocale as Locale)
    ? (browserLocale as Locale)
    : DEFAULT_LOCALE;
}
