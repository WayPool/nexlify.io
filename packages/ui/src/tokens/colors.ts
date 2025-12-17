/**
 * Color Tokens
 *
 * Banking-grade color palette with semantic naming.
 * Based on a professional, institutional aesthetic.
 */

export const colors = {
  // ==========================================================================
  // Brand Colors
  // ==========================================================================
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // ==========================================================================
  // Neutral Colors (Slate)
  // ==========================================================================
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // ==========================================================================
  // Semantic Colors
  // ==========================================================================
  semantic: {
    // Success
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Primary success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    // Warning
    warning: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // Primary warning
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },

    // Error / Danger
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Primary error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Info
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Primary info
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },

  // ==========================================================================
  // Risk Severity Colors
  // ==========================================================================
  risk: {
    low: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#166534',
      icon: '#22c55e',
    },
    medium: {
      bg: '#fefce8',
      border: '#fde047',
      text: '#854d0e',
      icon: '#eab308',
    },
    high: {
      bg: '#fff7ed',
      border: '#fdba74',
      text: '#9a3412',
      icon: '#f97316',
    },
    critical: {
      bg: '#fef2f2',
      border: '#fca5a5',
      text: '#991b1b',
      icon: '#ef4444',
    },
  },

  // ==========================================================================
  // Chart Colors
  // ==========================================================================
  chart: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    tertiary: '#22c55e',
    quaternary: '#f97316',
    quinary: '#ec4899',
    // For data visualization
    palette: [
      '#0ea5e9',
      '#8b5cf6',
      '#22c55e',
      '#f97316',
      '#ec4899',
      '#06b6d4',
      '#eab308',
      '#6366f1',
    ],
  },
} as const;

// =============================================================================
// Color Utilities
// =============================================================================

/**
 * Get risk severity color set
 */
export function getRiskColors(severity: 'low' | 'medium' | 'high' | 'critical') {
  return colors.risk[severity];
}

/**
 * CSS variable mapping for Tailwind
 */
export const cssVariables = {
  '--color-brand-500': colors.brand[500],
  '--color-brand-600': colors.brand[600],
  '--color-success-500': colors.semantic.success[500],
  '--color-warning-500': colors.semantic.warning[500],
  '--color-error-500': colors.semantic.error[500],
  '--color-info-500': colors.semantic.info[500],
} as const;

export type ColorToken = typeof colors;
