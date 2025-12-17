/**
 * Risk Engine
 *
 * Core risk processing, scoring, and aggregation logic.
 * Modules register risk detectors that emit normalized RiskFindings.
 */
import type { UUID, RiskFinding, RiskCategory, RiskSeverity, RiskStatus, TimeFrame, EntityRef, EvidenceRef, I18nKey } from '../types/index.js';
export interface RiskDetector {
    /** Unique identifier for this detector */
    id: string;
    /** i18n key for detector name */
    name_i18n_key: I18nKey;
    /** Categories this detector covers */
    categories: RiskCategory[];
    /** Run detection and return findings */
    detect(tenantId: UUID, timeframe: TimeFrame): Promise<RiskFinding[]>;
    /** Check if detector is healthy */
    healthCheck(): Promise<boolean>;
}
export interface RiskFindingInput {
    tenant_id: UUID;
    module_id: string;
    category: RiskCategory;
    severity: RiskSeverity;
    likelihood: number;
    impact_eur?: number;
    title_i18n_key: I18nKey;
    description_i18n_key: I18nKey;
    evidence_refs?: EvidenceRef[];
    entities?: EntityRef[];
    recommended_actions?: I18nKey[];
    policy_tags?: string[];
    metadata?: Record<string, unknown>;
}
export declare function createRiskFinding(input: RiskFindingInput): RiskFinding;
export interface RiskScore {
    /** Overall score (0-100) */
    score: number;
    /** Score by category */
    by_category: Record<RiskCategory, number>;
    /** Score by severity */
    by_severity: Record<RiskSeverity, number>;
    /** Total estimated exposure in EUR */
    total_exposure_eur: number;
    /** Count of active risks */
    active_count: number;
    /** Count by status */
    by_status: Record<RiskStatus, number>;
}
export declare function calculateRiskScore(findings: RiskFinding[]): RiskScore;
export interface RiskAggregation {
    /** Top risks by severity and likelihood */
    top_risks: RiskFinding[];
    /** Risks by entity */
    by_entity: Map<string, RiskFinding[]>;
    /** Trend data (if historical data provided) */
    trend?: {
        direction: 'improving' | 'worsening' | 'stable';
        change_percent: number;
    };
}
export declare function aggregateRisks(findings: RiskFinding[], options?: {
    limit?: number;
}): RiskAggregation;
export declare class RiskEngine {
    private detectors;
    /**
     * Register a risk detector
     */
    registerDetector(detector: RiskDetector): void;
    /**
     * Unregister a risk detector
     */
    unregisterDetector(detectorId: string): void;
    /**
     * Get all registered detectors
     */
    getDetectors(): RiskDetector[];
    /**
     * Run all detectors for a tenant
     */
    runDetection(tenantId: UUID, timeframe: TimeFrame): Promise<RiskFinding[]>;
    /**
     * Run detectors for specific categories
     */
    runDetectionByCategory(tenantId: UUID, timeframe: TimeFrame, categories: RiskCategory[]): Promise<RiskFinding[]>;
    /**
     * Health check all detectors
     */
    healthCheck(): Promise<Record<string, boolean>>;
    /**
     * Clear all detectors (useful for testing)
     */
    clear(): void;
}
export declare const riskEngine: RiskEngine;
export declare function canTransition(from: RiskStatus, to: RiskStatus): boolean;
export declare function getValidTransitions(status: RiskStatus): RiskStatus[];
//# sourceMappingURL=index.d.ts.map