/**
 * Button Component
 *
 * Banking-grade button with multiple variants and sizes.
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium',
    'rounded-md',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-600 text-white',
          'hover:bg-brand-700',
          'active:bg-brand-800',
          'focus-visible:ring-brand-500',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900',
          'hover:bg-neutral-200',
          'active:bg-neutral-300',
          'focus-visible:ring-neutral-500',
        ],
        outline: [
          'border border-neutral-300 bg-transparent text-neutral-700',
          'hover:bg-neutral-50 hover:border-neutral-400',
          'active:bg-neutral-100',
          'focus-visible:ring-brand-500',
        ],
        ghost: [
          'bg-transparent text-neutral-700',
          'hover:bg-neutral-100',
          'active:bg-neutral-200',
          'focus-visible:ring-brand-500',
        ],
        danger: [
          'bg-error-600 text-white',
          'hover:bg-error-700',
          'active:bg-error-800',
          'focus-visible:ring-error-500',
        ],
        success: [
          'bg-success-600 text-white',
          'hover:bg-success-700',
          'active:bg-success-800',
          'focus-visible:ring-success-500',
        ],
        link: [
          'text-brand-600 underline-offset-4',
          'hover:underline',
          'focus-visible:ring-brand-500',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </>
        ) : null}
        {!loading && children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
