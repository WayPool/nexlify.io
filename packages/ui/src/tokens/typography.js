"use strict";
/**
 * Typography Tokens
 *
 * Font family: Inter (banking-grade, highly legible)
 * Scale: Based on a 1.25 ratio (major third)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.textStyles = exports.typography = void 0;
exports.typography = {
    // ==========================================================================
    // Font Families
    // ==========================================================================
    fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    // ==========================================================================
    // Font Sizes (rem-based for accessibility)
    // ==========================================================================
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        '5xl': ['3rem', { lineHeight: '1' }], // 48px
    },
    // ==========================================================================
    // Font Weights
    // ==========================================================================
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    // ==========================================================================
    // Letter Spacing
    // ==========================================================================
    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    },
    // ==========================================================================
    // Line Heights
    // ==========================================================================
    lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },
};
// =============================================================================
// Text Styles (Preset combinations)
// =============================================================================
exports.textStyles = {
    // Headings
    h1: {
        fontSize: exports.typography.fontSize['4xl'][0],
        lineHeight: exports.typography.fontSize['4xl'][1].lineHeight,
        fontWeight: exports.typography.fontWeight.bold,
        letterSpacing: exports.typography.letterSpacing.tight,
    },
    h2: {
        fontSize: exports.typography.fontSize['3xl'][0],
        lineHeight: exports.typography.fontSize['3xl'][1].lineHeight,
        fontWeight: exports.typography.fontWeight.semibold,
        letterSpacing: exports.typography.letterSpacing.tight,
    },
    h3: {
        fontSize: exports.typography.fontSize['2xl'][0],
        lineHeight: exports.typography.fontSize['2xl'][1].lineHeight,
        fontWeight: exports.typography.fontWeight.semibold,
    },
    h4: {
        fontSize: exports.typography.fontSize.xl[0],
        lineHeight: exports.typography.fontSize.xl[1].lineHeight,
        fontWeight: exports.typography.fontWeight.semibold,
    },
    h5: {
        fontSize: exports.typography.fontSize.lg[0],
        lineHeight: exports.typography.fontSize.lg[1].lineHeight,
        fontWeight: exports.typography.fontWeight.medium,
    },
    h6: {
        fontSize: exports.typography.fontSize.base[0],
        lineHeight: exports.typography.fontSize.base[1].lineHeight,
        fontWeight: exports.typography.fontWeight.medium,
    },
    // Body
    body: {
        fontSize: exports.typography.fontSize.base[0],
        lineHeight: exports.typography.fontSize.base[1].lineHeight,
        fontWeight: exports.typography.fontWeight.normal,
    },
    bodySmall: {
        fontSize: exports.typography.fontSize.sm[0],
        lineHeight: exports.typography.fontSize.sm[1].lineHeight,
        fontWeight: exports.typography.fontWeight.normal,
    },
    // Labels
    label: {
        fontSize: exports.typography.fontSize.sm[0],
        lineHeight: exports.typography.fontSize.sm[1].lineHeight,
        fontWeight: exports.typography.fontWeight.medium,
    },
    labelSmall: {
        fontSize: exports.typography.fontSize.xs[0],
        lineHeight: exports.typography.fontSize.xs[1].lineHeight,
        fontWeight: exports.typography.fontWeight.medium,
        letterSpacing: exports.typography.letterSpacing.wide,
        textTransform: 'uppercase',
    },
    // Data/Numbers
    data: {
        fontSize: exports.typography.fontSize['2xl'][0],
        lineHeight: exports.typography.fontSize['2xl'][1].lineHeight,
        fontWeight: exports.typography.fontWeight.semibold,
        fontFamily: exports.typography.fontFamily.mono.join(', '),
    },
    dataSmall: {
        fontSize: exports.typography.fontSize.base[0],
        lineHeight: exports.typography.fontSize.base[1].lineHeight,
        fontWeight: exports.typography.fontWeight.medium,
        fontFamily: exports.typography.fontFamily.mono.join(', '),
    },
    // Code
    code: {
        fontSize: exports.typography.fontSize.sm[0],
        lineHeight: exports.typography.fontSize.sm[1].lineHeight,
        fontFamily: exports.typography.fontFamily.mono.join(', '),
    },
};
//# sourceMappingURL=typography.js.map