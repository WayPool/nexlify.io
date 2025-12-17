"use strict";
/**
 * @platform/i18n
 *
 * Internationalization utilities with full type safety.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18n = exports.SUPPORTED_LOCALES = exports.FALLBACK_LOCALE = exports.DEFAULT_LOCALE = void 0;
exports.initI18n = initI18n;
exports.getI18n = getI18n;
exports.t = t;
exports.formatNumber = formatNumber;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.formatRelativeTime = formatRelativeTime;
exports.getBrowserLocale = getBrowserLocale;
const intl_messageformat_1 = require("intl-messageformat");
// =============================================================================
// Constants
// =============================================================================
exports.DEFAULT_LOCALE = 'en';
exports.FALLBACK_LOCALE = 'en';
exports.SUPPORTED_LOCALES = ['en', 'es'];
// =============================================================================
// I18n Class
// =============================================================================
class I18n {
    locale;
    fallbackLocale;
    messages;
    cache = new Map();
    constructor(config) {
        this.locale = config.defaultLocale;
        this.fallbackLocale = config.fallbackLocale;
        this.messages = config.messages;
    }
    /**
     * Get current locale
     */
    getLocale() {
        return this.locale;
    }
    /**
     * Set current locale
     */
    setLocale(locale) {
        if (!exports.SUPPORTED_LOCALES.includes(locale)) {
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
    loadMessages(locale, messages) {
        this.messages[locale] = {
            ...this.messages[locale],
            ...messages,
        };
        this.cache.clear();
    }
    /**
     * Translate a key
     */
    t(key, params) {
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
                formatter = new intl_messageformat_1.IntlMessageFormat(message, this.locale);
                this.cache.set(cacheKey, formatter);
            }
            catch (error) {
                console.error(`Invalid message format for key: ${key}`, error);
                return message;
            }
        }
        try {
            return formatter.format(params);
        }
        catch (error) {
            console.error(`Error formatting message for key: ${key}`, error);
            return message;
        }
    }
    /**
     * Get message from messages object
     */
    getMessage(key) {
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
    getNestedValue(obj, key) {
        if (!obj)
            return undefined;
        const keys = key.split('.');
        let value = obj;
        for (const k of keys) {
            if (typeof value !== 'object' || value === null) {
                return undefined;
            }
            value = value[k];
        }
        return typeof value === 'string' ? value : undefined;
    }
    /**
     * Check if a key exists
     */
    hasKey(key) {
        return this.getMessage(key) !== undefined;
    }
    /**
     * Get all keys (for validation)
     */
    getAllKeys(locale = this.locale) {
        const keys = [];
        const collectKeys = (obj, prefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'string') {
                    keys.push(fullKey);
                }
                else {
                    collectKeys(value, fullKey);
                }
            }
        };
        collectKeys(this.messages[locale] || {});
        return keys;
    }
}
exports.I18n = I18n;
// =============================================================================
// React Hook (for use in React apps)
// =============================================================================
let globalI18n = null;
function initI18n(config) {
    globalI18n = new I18n(config);
    return globalI18n;
}
function getI18n() {
    if (!globalI18n) {
        throw new Error('I18n not initialized. Call initI18n first.');
    }
    return globalI18n;
}
function t(key, params) {
    return getI18n().t(key, params);
}
// =============================================================================
// Utilities
// =============================================================================
/**
 * Format number for current locale
 */
function formatNumber(value, locale = exports.DEFAULT_LOCALE) {
    return new Intl.NumberFormat(locale).format(value);
}
/**
 * Format currency for current locale
 */
function formatCurrency(value, currency = 'EUR', locale = exports.DEFAULT_LOCALE) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(value);
}
/**
 * Format date for current locale
 */
function formatDate(date, locale = exports.DEFAULT_LOCALE, options) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(d);
}
/**
 * Format relative time
 */
function formatRelativeTime(date, locale = exports.DEFAULT_LOCALE) {
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
    }
    else if (Math.abs(diffMins) < 60) {
        return rtf.format(diffMins, 'minute');
    }
    else if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
    }
    else {
        return rtf.format(diffDays, 'day');
    }
}
/**
 * Get browser locale
 */
function getBrowserLocale() {
    if (typeof navigator === 'undefined') {
        return exports.DEFAULT_LOCALE;
    }
    const browserLocale = navigator.language.split('-')[0];
    return exports.SUPPORTED_LOCALES.includes(browserLocale)
        ? browserLocale
        : exports.DEFAULT_LOCALE;
}
//# sourceMappingURL=index.js.map