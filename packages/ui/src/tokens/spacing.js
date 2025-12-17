"use strict";
/**
 * Spacing Tokens
 *
 * Based on a 4px base unit for consistency.
 * Follows 4-8-16-24-32-48-64 pattern.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.breakpoints = exports.containers = exports.borderWidth = exports.borderRadius = exports.spacing = void 0;
exports.spacing = {
    // ==========================================================================
    // Base Unit
    // ==========================================================================
    unit: 4,
    // ==========================================================================
    // Scale (in pixels, converted to rem in Tailwind)
    // ==========================================================================
    scale: {
        0: '0',
        px: '1px',
        0.5: '0.125rem', // 2px
        1: '0.25rem', // 4px
        1.5: '0.375rem', // 6px
        2: '0.5rem', // 8px
        2.5: '0.625rem', // 10px
        3: '0.75rem', // 12px
        3.5: '0.875rem', // 14px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        7: '1.75rem', // 28px
        8: '2rem', // 32px
        9: '2.25rem', // 36px
        10: '2.5rem', // 40px
        11: '2.75rem', // 44px
        12: '3rem', // 48px
        14: '3.5rem', // 56px
        16: '4rem', // 64px
        20: '5rem', // 80px
        24: '6rem', // 96px
        28: '7rem', // 112px
        32: '8rem', // 128px
        36: '9rem', // 144px
        40: '10rem', // 160px
        44: '11rem', // 176px
        48: '12rem', // 192px
        52: '13rem', // 208px
        56: '14rem', // 224px
        60: '15rem', // 240px
        64: '16rem', // 256px
        72: '18rem', // 288px
        80: '20rem', // 320px
        96: '24rem', // 384px
    },
    // ==========================================================================
    // Semantic Spacing
    // ==========================================================================
    semantic: {
        // Component internal padding
        componentXS: '0.25rem', // 4px
        componentSM: '0.5rem', // 8px
        componentMD: '0.75rem', // 12px
        componentLG: '1rem', // 16px
        componentXL: '1.5rem', // 24px
        // Section padding
        sectionSM: '1rem', // 16px
        sectionMD: '1.5rem', // 24px
        sectionLG: '2rem', // 32px
        sectionXL: '3rem', // 48px
        // Page margins
        pageSM: '1rem', // 16px
        pageMD: '1.5rem', // 24px
        pageLG: '2rem', // 32px
        pageXL: '4rem', // 64px
        // Gaps
        gapXS: '0.25rem', // 4px
        gapSM: '0.5rem', // 8px
        gapMD: '1rem', // 16px
        gapLG: '1.5rem', // 24px
        gapXL: '2rem', // 32px
    },
};
// =============================================================================
// Border Radius
// =============================================================================
exports.borderRadius = {
    none: '0',
    sm: '0.125rem', // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
};
// =============================================================================
// Border Width
// =============================================================================
exports.borderWidth = {
    0: '0',
    DEFAULT: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
};
// =============================================================================
// Container Sizes
// =============================================================================
exports.containers = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
};
// =============================================================================
// Breakpoints
// =============================================================================
exports.breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};
//# sourceMappingURL=spacing.js.map