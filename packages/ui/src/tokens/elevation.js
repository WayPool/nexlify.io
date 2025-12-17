"use strict";
/**
 * Elevation Tokens
 *
 * Box shadows and z-index scale for depth hierarchy.
 * Banking-grade: subtle, professional shadows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.backdrop = exports.blur = exports.semanticElevation = exports.elevation = void 0;
exports.elevation = {
    // ==========================================================================
    // Box Shadows
    // ==========================================================================
    shadow: {
        none: 'none',
        // Subtle shadows for cards and containers
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        // Inner shadow for inputs
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        // Ring shadows for focus states
        ring: '0 0 0 3px rgb(14 165 233 / 0.2)', // brand color with transparency
        ringError: '0 0 0 3px rgb(239 68 68 / 0.2)',
        ringSuccess: '0 0 0 3px rgb(34 197 94 / 0.2)',
    },
    // ==========================================================================
    // Z-Index Scale
    // ==========================================================================
    zIndex: {
        // Base layers
        behind: -1,
        base: 0,
        docked: 10,
        // UI layers
        dropdown: 100,
        sticky: 200,
        banner: 300,
        overlay: 400,
        modal: 500,
        popover: 600,
        toast: 700,
        tooltip: 800,
        // Special
        max: 9999,
    },
};
// =============================================================================
// Semantic Elevation
// =============================================================================
exports.semanticElevation = {
    // Card elevation levels
    card: {
        flat: exports.elevation.shadow.none,
        raised: exports.elevation.shadow.sm,
        floating: exports.elevation.shadow.md,
        overlay: exports.elevation.shadow.lg,
    },
    // Interactive states
    interactive: {
        default: exports.elevation.shadow.sm,
        hover: exports.elevation.shadow.md,
        active: exports.elevation.shadow.xs,
        focus: exports.elevation.shadow.ring,
    },
    // Modal/Dialog levels
    modal: {
        backdrop: exports.elevation.shadow.none,
        content: exports.elevation.shadow.xl,
    },
    // Dropdown levels
    dropdown: {
        menu: exports.elevation.shadow.lg,
        nested: exports.elevation.shadow.md,
    },
};
// =============================================================================
// Blur Effects
// =============================================================================
exports.blur = {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
};
// =============================================================================
// Backdrop
// =============================================================================
exports.backdrop = {
    blur: {
        sm: 'blur(4px)',
        DEFAULT: 'blur(8px)',
        lg: 'blur(16px)',
    },
    overlay: {
        light: 'rgba(255, 255, 255, 0.8)',
        dark: 'rgba(15, 23, 42, 0.8)',
    },
};
//# sourceMappingURL=elevation.js.map