/**
 * Input Component
 *
 * Form input with consistent styling.
 */
import * as React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export { Input };
//# sourceMappingURL=input.d.ts.map