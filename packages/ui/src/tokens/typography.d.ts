/**
 * Typography Tokens
 *
 * Font family: Inter (banking-grade, highly legible)
 * Scale: Based on a 1.25 ratio (major third)
 */
export declare const typography: {
    readonly fontFamily: {
        readonly sans: readonly ["Inter", "system-ui", "-apple-system", "sans-serif"];
        readonly mono: readonly ["JetBrains Mono", "Fira Code", "monospace"];
    };
    readonly fontSize: {
        readonly xs: readonly ["0.75rem", {
            readonly lineHeight: "1rem";
        }];
        readonly sm: readonly ["0.875rem", {
            readonly lineHeight: "1.25rem";
        }];
        readonly base: readonly ["1rem", {
            readonly lineHeight: "1.5rem";
        }];
        readonly lg: readonly ["1.125rem", {
            readonly lineHeight: "1.75rem";
        }];
        readonly xl: readonly ["1.25rem", {
            readonly lineHeight: "1.75rem";
        }];
        readonly '2xl': readonly ["1.5rem", {
            readonly lineHeight: "2rem";
        }];
        readonly '3xl': readonly ["1.875rem", {
            readonly lineHeight: "2.25rem";
        }];
        readonly '4xl': readonly ["2.25rem", {
            readonly lineHeight: "2.5rem";
        }];
        readonly '5xl': readonly ["3rem", {
            readonly lineHeight: "1";
        }];
    };
    readonly fontWeight: {
        readonly normal: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
    };
    readonly letterSpacing: {
        readonly tighter: "-0.05em";
        readonly tight: "-0.025em";
        readonly normal: "0";
        readonly wide: "0.025em";
        readonly wider: "0.05em";
        readonly widest: "0.1em";
    };
    readonly lineHeight: {
        readonly none: "1";
        readonly tight: "1.25";
        readonly snug: "1.375";
        readonly normal: "1.5";
        readonly relaxed: "1.625";
        readonly loose: "2";
    };
};
export declare const textStyles: {
    readonly h1: {
        readonly fontSize: "2.25rem";
        readonly lineHeight: "2.5rem";
        readonly fontWeight: "700";
        readonly letterSpacing: "-0.025em";
    };
    readonly h2: {
        readonly fontSize: "1.875rem";
        readonly lineHeight: "2.25rem";
        readonly fontWeight: "600";
        readonly letterSpacing: "-0.025em";
    };
    readonly h3: {
        readonly fontSize: "1.5rem";
        readonly lineHeight: "2rem";
        readonly fontWeight: "600";
    };
    readonly h4: {
        readonly fontSize: "1.25rem";
        readonly lineHeight: "1.75rem";
        readonly fontWeight: "600";
    };
    readonly h5: {
        readonly fontSize: "1.125rem";
        readonly lineHeight: "1.75rem";
        readonly fontWeight: "500";
    };
    readonly h6: {
        readonly fontSize: "1rem";
        readonly lineHeight: "1.5rem";
        readonly fontWeight: "500";
    };
    readonly body: {
        readonly fontSize: "1rem";
        readonly lineHeight: "1.5rem";
        readonly fontWeight: "400";
    };
    readonly bodySmall: {
        readonly fontSize: "0.875rem";
        readonly lineHeight: "1.25rem";
        readonly fontWeight: "400";
    };
    readonly label: {
        readonly fontSize: "0.875rem";
        readonly lineHeight: "1.25rem";
        readonly fontWeight: "500";
    };
    readonly labelSmall: {
        readonly fontSize: "0.75rem";
        readonly lineHeight: "1rem";
        readonly fontWeight: "500";
        readonly letterSpacing: "0.025em";
        readonly textTransform: "uppercase";
    };
    readonly data: {
        readonly fontSize: "1.5rem";
        readonly lineHeight: "2rem";
        readonly fontWeight: "600";
        readonly fontFamily: string;
    };
    readonly dataSmall: {
        readonly fontSize: "1rem";
        readonly lineHeight: "1.5rem";
        readonly fontWeight: "500";
        readonly fontFamily: string;
    };
    readonly code: {
        readonly fontSize: "0.875rem";
        readonly lineHeight: "1.25rem";
        readonly fontFamily: string;
    };
};
export type TypographyToken = typeof typography;
export type TextStyle = keyof typeof textStyles;
//# sourceMappingURL=typography.d.ts.map