/**
 * Salary Anomaly Detector
 *
 * Detects unusual salary patterns that may indicate compliance issues.
 */
import type { ModuleContext, RiskDetector } from '@platform/sdk';
import type { RiskFinding, TimeFrame } from '@platform/core';
export declare class SalaryAnomalyDetector implements RiskDetector {
    id: string;
    name_i18n_key: string;
    categories: string[];
    private context;
    private thresholdPercent;
    constructor(context: ModuleContext, thresholdPercent?: number);
    detect(tenantId: string, timeframe: TimeFrame): Promise<RiskFinding[]>;
    healthCheck(): Promise<boolean>;
    /**
     * Detect employees with salaries significantly below department average.
     */
    private detectBelowAverage;
    /**
     * Detect large salary changes that may indicate issues.
     */
    private detectLargeChanges;
    /**
     * Detect gender pay gaps.
     */
    private detectPayGap;
    private calculatePayEquityRisk;
    private calculatePayGapLiability;
}
//# sourceMappingURL=salary-anomaly.d.ts.map