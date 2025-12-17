/**
 * Color Tokens
 *
 * Banking-grade color palette with semantic naming.
 * Based on a professional, institutional aesthetic.
 */
export declare const colors: {
    readonly brand: {
        readonly 50: "#f0f9ff";
        readonly 100: "#e0f2fe";
        readonly 200: "#bae6fd";
        readonly 300: "#7dd3fc";
        readonly 400: "#38bdf8";
        readonly 500: "#0ea5e9";
        readonly 600: "#0284c7";
        readonly 700: "#0369a1";
        readonly 800: "#075985";
        readonly 900: "#0c4a6e";
        readonly 950: "#082f49";
    };
    readonly neutral: {
        readonly 0: "#ffffff";
        readonly 50: "#f8fafc";
        readonly 100: "#f1f5f9";
        readonly 200: "#e2e8f0";
        readonly 300: "#cbd5e1";
        readonly 400: "#94a3b8";
        readonly 500: "#64748b";
        readonly 600: "#475569";
        readonly 700: "#334155";
        readonly 800: "#1e293b";
        readonly 900: "#0f172a";
        readonly 950: "#020617";
    };
    readonly semantic: {
        readonly success: {
            readonly 50: "#f0fdf4";
            readonly 100: "#dcfce7";
            readonly 200: "#bbf7d0";
            readonly 300: "#86efac";
            readonly 400: "#4ade80";
            readonly 500: "#22c55e";
            readonly 600: "#16a34a";
            readonly 700: "#15803d";
            readonly 800: "#166534";
            readonly 900: "#14532d";
        };
        readonly warning: {
            readonly 50: "#fefce8";
            readonly 100: "#fef9c3";
            readonly 200: "#fef08a";
            readonly 300: "#fde047";
            readonly 400: "#facc15";
            readonly 500: "#eab308";
            readonly 600: "#ca8a04";
            readonly 700: "#a16207";
            readonly 800: "#854d0e";
            readonly 900: "#713f12";
        };
        readonly error: {
            readonly 50: "#fef2f2";
            readonly 100: "#fee2e2";
            readonly 200: "#fecaca";
            readonly 300: "#fca5a5";
            readonly 400: "#f87171";
            readonly 500: "#ef4444";
            readonly 600: "#dc2626";
            readonly 700: "#b91c1c";
            readonly 800: "#991b1b";
            readonly 900: "#7f1d1d";
        };
        readonly info: {
            readonly 50: "#eff6ff";
            readonly 100: "#dbeafe";
            readonly 200: "#bfdbfe";
            readonly 300: "#93c5fd";
            readonly 400: "#60a5fa";
            readonly 500: "#3b82f6";
            readonly 600: "#2563eb";
            readonly 700: "#1d4ed8";
            readonly 800: "#1e40af";
            readonly 900: "#1e3a8a";
        };
    };
    readonly risk: {
        readonly low: {
            readonly bg: "#f0fdf4";
            readonly border: "#86efac";
            readonly text: "#166534";
            readonly icon: "#22c55e";
        };
        readonly medium: {
            readonly bg: "#fefce8";
            readonly border: "#fde047";
            readonly text: "#854d0e";
            readonly icon: "#eab308";
        };
        readonly high: {
            readonly bg: "#fff7ed";
            readonly border: "#fdba74";
            readonly text: "#9a3412";
            readonly icon: "#f97316";
        };
        readonly critical: {
            readonly bg: "#fef2f2";
            readonly border: "#fca5a5";
            readonly text: "#991b1b";
            readonly icon: "#ef4444";
        };
    };
    readonly chart: {
        readonly primary: "#0ea5e9";
        readonly secondary: "#8b5cf6";
        readonly tertiary: "#22c55e";
        readonly quaternary: "#f97316";
        readonly quinary: "#ec4899";
        readonly palette: readonly ["#0ea5e9", "#8b5cf6", "#22c55e", "#f97316", "#ec4899", "#06b6d4", "#eab308", "#6366f1"];
    };
};
/**
 * Get risk severity color set
 */
export declare function getRiskColors(severity: 'low' | 'medium' | 'high' | 'critical'): {
    readonly bg: "#f0fdf4";
    readonly border: "#86efac";
    readonly text: "#166534";
    readonly icon: "#22c55e";
} | {
    readonly bg: "#fefce8";
    readonly border: "#fde047";
    readonly text: "#854d0e";
    readonly icon: "#eab308";
} | {
    readonly bg: "#fff7ed";
    readonly border: "#fdba74";
    readonly text: "#9a3412";
    readonly icon: "#f97316";
} | {
    readonly bg: "#fef2f2";
    readonly border: "#fca5a5";
    readonly text: "#991b1b";
    readonly icon: "#ef4444";
};
/**
 * CSS variable mapping for Tailwind
 */
export declare const cssVariables: {
    readonly '--color-brand-500': "#0ea5e9";
    readonly '--color-brand-600': "#0284c7";
    readonly '--color-success-500': "#22c55e";
    readonly '--color-warning-500': "#eab308";
    readonly '--color-error-500': "#ef4444";
    readonly '--color-info-500': "#3b82f6";
};
export type ColorToken = typeof colors;
//# sourceMappingURL=colors.d.ts.map