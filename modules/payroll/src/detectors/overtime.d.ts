/**
 * Overtime Violation Detector
 *
 * Detects employees who have exceeded overtime thresholds.
 */
import type { ModuleContext, RiskDetector } from '@platform/sdk';
import type { RiskFinding, TimeFrame } from '@platform/core';
export declare class OvertimeDetector implements RiskDetector {
    id: string;
    name_i18n_key: string;
    categories: string[];
    private context;
    private thresholdHours;
    constructor(context: ModuleContext, thresholdHours?: number);
    detect(tenantId: string, timeframe: TimeFrame): Promise<RiskFinding[]>;
    healthCheck(): Promise<boolean>;
    /**
     * Calculate potential fine based on Spanish labor law.
     * Fines range from 626€ to 6,250€ per violation.
     */
    private calculatePotentialFine;
}
//# sourceMappingURL=overtime.d.ts.map