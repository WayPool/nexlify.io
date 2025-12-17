/**
 * Risk Badge Component
 *
 * Displays risk severity with appropriate styling.
 */
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const riskBadgeVariants: (props?: ({
    severity?: "low" | "medium" | "high" | "critical" | null | undefined;
    size?: "sm" | "lg" | "md" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof riskBadgeVariants> {
    showIcon?: boolean;
    label?: string;
}
declare const RiskBadge: React.ForwardRefExoticComponent<RiskBadgeProps & React.RefAttributes<HTMLSpanElement>>;
export { RiskBadge, riskBadgeVariants };
//# sourceMappingURL=risk-badge.d.ts.map