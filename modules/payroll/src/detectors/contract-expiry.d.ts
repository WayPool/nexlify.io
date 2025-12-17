/**
 * Contract Expiry Detector
 *
 * Detects contracts that are about to expire without renewal.
 */
import type { ModuleContext, RiskDetector } from '@platform/sdk';
import type { RiskFinding, TimeFrame } from '@platform/core';
export declare class ContractExpiryDetector implements RiskDetector {
    id: string;
    name_i18n_key: string;
    categories: string[];
    private context;
    private warningDays;
    constructor(context: ModuleContext, warningDays?: number);
    detect(tenantId: string, _timeframe: TimeFrame): Promise<RiskFinding[]>;
    healthCheck(): Promise<boolean>;
    /**
     * Calculate potential impact of contract expiry.
     * Includes potential severance, hiring costs, productivity loss.
     */
    private calculateImpact;
}
//# sourceMappingURL=contract-expiry.d.ts.map