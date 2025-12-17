/**
 * Risk Badge Component
 *
 * Displays risk severity with appropriate styling.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const riskBadgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'rounded-full',
    'font-medium',
    'transition-colors duration-150',
  ],
  {
    variants: {
      severity: {
        low: ['bg-green-50 text-green-700 border border-green-200'],
        medium: ['bg-yellow-50 text-yellow-700 border border-yellow-200'],
        high: ['bg-orange-50 text-orange-700 border border-orange-200'],
        critical: ['bg-red-50 text-red-700 border border-red-200'],
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      severity: 'medium',
      size: 'md',
    },
  }
);

const severityIcons = {
  low: (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
  ),
  medium: (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
  ),
  high: (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  critical: (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export interface RiskBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof riskBadgeVariants> {
  showIcon?: boolean;
  label?: string;
}

const RiskBadge = React.forwardRef<HTMLSpanElement, RiskBadgeProps>(
  ({ className, severity = 'medium', size, showIcon = true, label, children, ...props }, ref) => {
    const displayLabel = label ?? severity;

    return (
      <span
        className={cn(riskBadgeVariants({ severity, size, className }))}
        ref={ref}
        {...props}
      >
        {showIcon && severityIcons[severity ?? 'medium']}
        <span className="capitalize">{children ?? displayLabel}</span>
      </span>
    );
  }
);

RiskBadge.displayName = 'RiskBadge';

export { RiskBadge, riskBadgeVariants };
