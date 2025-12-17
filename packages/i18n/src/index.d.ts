/**
 * @platform/i18n
 *
 * Internationalization utilities with full type safety.
 */
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
export declare const DEFAULT_LOCALE: Locale;
export declare const FALLBACK_LOCALE: Locale;
export declare const SUPPORTED_LOCALES: Locale[];
export declare class I18n {
    private locale;
    private fallbackLocale;
    private messages;
    private cache;
    constructor(config: I18nConfig);
    /**
     * Get current locale
     */
    getLocale(): Locale;
    /**
     * Set current locale
     */
    setLocale(locale: Locale): void;
    /**
     * Load messages for a locale
     */
    loadMessages(locale: Locale, messages: TranslationMessages): void;
    /**
     * Translate a key
     */
    t(key: string, params?: Record<string, string | number | boolean | Date>): string;
    /**
     * Get message from messages object
     */
    private getMessage;
    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue;
    /**
     * Check if a key exists
     */
    hasKey(key: string): boolean;
    /**
     * Get all keys (for validation)
     */
    getAllKeys(locale?: Locale): string[];
}
export declare function initI18n(config: I18nConfig): I18n;
export declare function getI18n(): I18n;
export declare function t(key: string, params?: Record<string, string | number | boolean | Date>): string;
/**
 * Format number for current locale
 */
export declare function formatNumber(value: number, locale?: Locale): string;
/**
 * Format currency for current locale
 */
export declare function formatCurrency(value: number, currency?: string, locale?: Locale): string;
/**
 * Format date for current locale
 */
export declare function formatDate(date: Date | string, locale?: Locale, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format relative time
 */
export declare function formatRelativeTime(date: Date | string, locale?: Locale): string;
/**
 * Get browser locale
 */
export declare function getBrowserLocale(): Locale;
//# sourceMappingURL=index.d.ts.map