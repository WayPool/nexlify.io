/**
 * Spacing Tokens
 *
 * Based on a 4px base unit for consistency.
 * Follows 4-8-16-24-32-48-64 pattern.
 */
export declare const spacing: {
    readonly unit: 4;
    readonly scale: {
        readonly 0: "0";
        readonly px: "1px";
        readonly 0.5: "0.125rem";
        readonly 1: "0.25rem";
        readonly 1.5: "0.375rem";
        readonly 2: "0.5rem";
        readonly 2.5: "0.625rem";
        readonly 3: "0.75rem";
        readonly 3.5: "0.875rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 7: "1.75rem";
        readonly 8: "2rem";
        readonly 9: "2.25rem";
        readonly 10: "2.5rem";
        readonly 11: "2.75rem";
        readonly 12: "3rem";
        readonly 14: "3.5rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 28: "7rem";
        readonly 32: "8rem";
        readonly 36: "9rem";
        readonly 40: "10rem";
        readonly 44: "11rem";
        readonly 48: "12rem";
        readonly 52: "13rem";
        readonly 56: "14rem";
        readonly 60: "15rem";
        readonly 64: "16rem";
        readonly 72: "18rem";
        readonly 80: "20rem";
        readonly 96: "24rem";
    };
    readonly semantic: {
        readonly componentXS: "0.25rem";
        readonly componentSM: "0.5rem";
        readonly componentMD: "0.75rem";
        readonly componentLG: "1rem";
        readonly componentXL: "1.5rem";
        readonly sectionSM: "1rem";
        readonly sectionMD: "1.5rem";
        readonly sectionLG: "2rem";
        readonly sectionXL: "3rem";
        readonly pageSM: "1rem";
        readonly pageMD: "1.5rem";
        readonly pageLG: "2rem";
        readonly pageXL: "4rem";
        readonly gapXS: "0.25rem";
        readonly gapSM: "0.5rem";
        readonly gapMD: "1rem";
        readonly gapLG: "1.5rem";
        readonly gapXL: "2rem";
    };
};
export declare const borderRadius: {
    readonly none: "0";
    readonly sm: "0.125rem";
    readonly DEFAULT: "0.25rem";
    readonly md: "0.375rem";
    readonly lg: "0.5rem";
    readonly xl: "0.75rem";
    readonly '2xl': "1rem";
    readonly '3xl': "1.5rem";
    readonly full: "9999px";
};
export declare const borderWidth: {
    readonly 0: "0";
    readonly DEFAULT: "1px";
    readonly 2: "2px";
    readonly 4: "4px";
    readonly 8: "8px";
};
export declare const containers: {
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
    readonly full: "100%";
};
export declare const breakpoints: {
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
};
export type SpacingToken = typeof spacing;
export type BorderRadiusToken = typeof borderRadius;
//# sourceMappingURL=spacing.d.ts.map