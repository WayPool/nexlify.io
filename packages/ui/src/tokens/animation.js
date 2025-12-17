"use strict";
/**
 * Animation Tokens
 *
 * Banking-grade animations: subtle, professional, no bounces.
 * Duration: 150-250ms with ease-in-out timing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reducedMotionQuery = exports.semanticAnimation = exports.animation = void 0;
exports.getAccessibleAnimation = getAccessibleAnimation;
exports.animation = {
    // ==========================================================================
    // Durations
    // ==========================================================================
    duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '200ms',
        slow: '250ms',
        slower: '300ms',
        slowest: '500ms',
    },
    // ==========================================================================
    // Timing Functions (Easing)
    // ==========================================================================
    easing: {
        // Standard easings - use ease-in-out as default
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // DEFAULT
        // Custom easings for specific use cases
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
        decelerate: 'cubic-bezier(0, 0, 0, 1)',
        accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    },
    // ==========================================================================
    // Transition Presets
    // ==========================================================================
    transition: {
        none: 'none',
        all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    // ==========================================================================
    // Keyframe Animations
    // ==========================================================================
    keyframes: {
        // Fade animations
        fadeIn: {
            from: { opacity: '0' },
            to: { opacity: '1' },
        },
        fadeOut: {
            from: { opacity: '1' },
            to: { opacity: '0' },
        },
        // Slide animations
        slideInFromTop: {
            from: { transform: 'translateY(-10px)', opacity: '0' },
            to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromBottom: {
            from: { transform: 'translateY(10px)', opacity: '0' },
            to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromLeft: {
            from: { transform: 'translateX(-10px)', opacity: '0' },
            to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
            from: { transform: 'translateX(10px)', opacity: '0' },
            to: { transform: 'translateX(0)', opacity: '1' },
        },
        // Scale animations
        scaleIn: {
            from: { transform: 'scale(0.95)', opacity: '0' },
            to: { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
            from: { transform: 'scale(1)', opacity: '1' },
            to: { transform: 'scale(0.95)', opacity: '0' },
        },
        // Spinner animation
        spin: {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
        },
        // Pulse animation (for loading states)
        pulse: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
        },
        // Shimmer animation (for skeleton loading)
        shimmer: {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
        },
    },
    // ==========================================================================
    // Animation Presets
    // ==========================================================================
    presets: {
        fadeIn: 'fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        fadeOut: 'fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slideInFromTop: 'slideInFromTop 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slideInFromBottom: 'slideInFromBottom 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slideInFromLeft: 'slideInFromLeft 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slideInFromRight: 'slideInFromRight 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        scaleIn: 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        scaleOut: 'scaleOut 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
    },
};
// =============================================================================
// Semantic Animation
// =============================================================================
exports.semanticAnimation = {
    // Micro-interactions
    interaction: {
        hover: {
            duration: exports.animation.duration.fast,
            easing: exports.animation.easing.easeInOut,
        },
        press: {
            duration: exports.animation.duration.fast,
            easing: exports.animation.easing.easeOut,
        },
        focus: {
            duration: exports.animation.duration.fast,
            easing: exports.animation.easing.easeInOut,
        },
    },
    // Component animations
    component: {
        modal: {
            enter: exports.animation.presets.scaleIn,
            exit: exports.animation.presets.scaleOut,
        },
        dropdown: {
            enter: exports.animation.presets.slideInFromTop,
            exit: exports.animation.presets.fadeOut,
        },
        toast: {
            enter: exports.animation.presets.slideInFromRight,
            exit: exports.animation.presets.fadeOut,
        },
        tooltip: {
            enter: exports.animation.presets.fadeIn,
            exit: exports.animation.presets.fadeOut,
        },
    },
    // Page transitions
    page: {
        enter: exports.animation.presets.fadeIn,
        exit: exports.animation.presets.fadeOut,
    },
};
// =============================================================================
// Reduced Motion
// =============================================================================
/**
 * CSS media query for reduced motion preference
 * Use this to disable animations for users who prefer reduced motion
 */
exports.reducedMotionQuery = '@media (prefers-reduced-motion: reduce)';
/**
 * Get animation value respecting reduced motion
 */
function getAccessibleAnimation(animationValue, reducedValue = 'none') {
    return `var(--motion-preference, ${animationValue})`;
}
//# sourceMappingURL=animation.js.map