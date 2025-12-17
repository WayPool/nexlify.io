/**
 * Animation Tokens
 *
 * Banking-grade animations: subtle, professional, no bounces.
 * Duration: 150-250ms with ease-in-out timing.
 */
export declare const animation: {
    readonly duration: {
        readonly instant: "0ms";
        readonly fast: "150ms";
        readonly normal: "200ms";
        readonly slow: "250ms";
        readonly slower: "300ms";
        readonly slowest: "500ms";
    };
    readonly easing: {
        readonly linear: "linear";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        readonly emphasized: "cubic-bezier(0.2, 0, 0, 1)";
        readonly decelerate: "cubic-bezier(0, 0, 0, 1)";
        readonly accelerate: "cubic-bezier(0.3, 0, 1, 1)";
    };
    readonly transition: {
        readonly none: "none";
        readonly all: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly colors: "color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly opacity: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly shadow: "box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly transform: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)";
    };
    readonly keyframes: {
        readonly fadeIn: {
            readonly from: {
                readonly opacity: "0";
            };
            readonly to: {
                readonly opacity: "1";
            };
        };
        readonly fadeOut: {
            readonly from: {
                readonly opacity: "1";
            };
            readonly to: {
                readonly opacity: "0";
            };
        };
        readonly slideInFromTop: {
            readonly from: {
                readonly transform: "translateY(-10px)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly slideInFromBottom: {
            readonly from: {
                readonly transform: "translateY(10px)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly slideInFromLeft: {
            readonly from: {
                readonly transform: "translateX(-10px)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "translateX(0)";
                readonly opacity: "1";
            };
        };
        readonly slideInFromRight: {
            readonly from: {
                readonly transform: "translateX(10px)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "translateX(0)";
                readonly opacity: "1";
            };
        };
        readonly scaleIn: {
            readonly from: {
                readonly transform: "scale(0.95)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
        };
        readonly scaleOut: {
            readonly from: {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
            readonly to: {
                readonly transform: "scale(0.95)";
                readonly opacity: "0";
            };
        };
        readonly spin: {
            readonly from: {
                readonly transform: "rotate(0deg)";
            };
            readonly to: {
                readonly transform: "rotate(360deg)";
            };
        };
        readonly pulse: {
            readonly '0%, 100%': {
                readonly opacity: "1";
            };
            readonly '50%': {
                readonly opacity: "0.5";
            };
        };
        readonly shimmer: {
            readonly '0%': {
                readonly backgroundPosition: "-200% 0";
            };
            readonly '100%': {
                readonly backgroundPosition: "200% 0";
            };
        };
    };
    readonly presets: {
        readonly fadeIn: "fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly fadeOut: "fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly slideInFromTop: "slideInFromTop 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly slideInFromBottom: "slideInFromBottom 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly slideInFromLeft: "slideInFromLeft 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly slideInFromRight: "slideInFromRight 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly scaleIn: "scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly scaleOut: "scaleOut 150ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly spin: "spin 1s linear infinite";
        readonly pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";
        readonly shimmer: "shimmer 2s linear infinite";
    };
};
export declare const semanticAnimation: {
    readonly interaction: {
        readonly hover: {
            readonly duration: "150ms";
            readonly easing: "cubic-bezier(0.4, 0, 0.2, 1)";
        };
        readonly press: {
            readonly duration: "150ms";
            readonly easing: "cubic-bezier(0, 0, 0.2, 1)";
        };
        readonly focus: {
            readonly duration: "150ms";
            readonly easing: "cubic-bezier(0.4, 0, 0.2, 1)";
        };
    };
    readonly component: {
        readonly modal: {
            readonly enter: "scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)";
            readonly exit: "scaleOut 150ms cubic-bezier(0.4, 0, 0.2, 1)";
        };
        readonly dropdown: {
            readonly enter: "slideInFromTop 200ms cubic-bezier(0.4, 0, 0.2, 1)";
            readonly exit: "fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        };
        readonly toast: {
            readonly enter: "slideInFromRight 200ms cubic-bezier(0.4, 0, 0.2, 1)";
            readonly exit: "fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        };
        readonly tooltip: {
            readonly enter: "fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)";
            readonly exit: "fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        };
    };
    readonly page: {
        readonly enter: "fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)";
        readonly exit: "fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
/**
 * CSS media query for reduced motion preference
 * Use this to disable animations for users who prefer reduced motion
 */
export declare const reducedMotionQuery = "@media (prefers-reduced-motion: reduce)";
/**
 * Get animation value respecting reduced motion
 */
export declare function getAccessibleAnimation(animationValue: string, reducedValue?: string): string;
export type AnimationToken = typeof animation;
//# sourceMappingURL=animation.d.ts.map