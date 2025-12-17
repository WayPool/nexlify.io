/**
 * Elevation Tokens
 *
 * Box shadows and z-index scale for depth hierarchy.
 * Banking-grade: subtle, professional shadows.
 */
export declare const elevation: {
    readonly shadow: {
        readonly none: "none";
        readonly xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
        readonly sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
        readonly DEFAULT: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
        readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
        readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
        readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
        readonly ring: "0 0 0 3px rgb(14 165 233 / 0.2)";
        readonly ringError: "0 0 0 3px rgb(239 68 68 / 0.2)";
        readonly ringSuccess: "0 0 0 3px rgb(34 197 94 / 0.2)";
    };
    readonly zIndex: {
        readonly behind: -1;
        readonly base: 0;
        readonly docked: 10;
        readonly dropdown: 100;
        readonly sticky: 200;
        readonly banner: 300;
        readonly overlay: 400;
        readonly modal: 500;
        readonly popover: 600;
        readonly toast: 700;
        readonly tooltip: 800;
        readonly max: 9999;
    };
};
export declare const semanticElevation: {
    readonly card: {
        readonly flat: "none";
        readonly raised: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
        readonly floating: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly overlay: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    };
    readonly interactive: {
        readonly default: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
        readonly hover: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly active: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
        readonly focus: "0 0 0 3px rgb(14 165 233 / 0.2)";
    };
    readonly modal: {
        readonly backdrop: "none";
        readonly content: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    };
    readonly dropdown: {
        readonly menu: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
        readonly nested: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    };
};
export declare const blur: {
    readonly none: "0";
    readonly sm: "4px";
    readonly DEFAULT: "8px";
    readonly md: "12px";
    readonly lg: "16px";
    readonly xl: "24px";
    readonly '2xl': "40px";
    readonly '3xl': "64px";
};
export declare const backdrop: {
    readonly blur: {
        readonly sm: "blur(4px)";
        readonly DEFAULT: "blur(8px)";
        readonly lg: "blur(16px)";
    };
    readonly overlay: {
        readonly light: "rgba(255, 255, 255, 0.8)";
        readonly dark: "rgba(15, 23, 42, 0.8)";
    };
};
export type ElevationToken = typeof elevation;
//# sourceMappingURL=elevation.d.ts.map