"use strict";
/**
 * Risk Engine
 *
 * Core risk processing, scoring, and aggregation logic.
 * Modules register risk detectors that emit normalized RiskFindings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskEngine = exports.RiskEngine = void 0;
exports.createRiskFinding = createRiskFinding;
exports.calculateRiskScore = calculateRiskScore;
exports.aggregateRisks = aggregateRisks;
exports.canTransition = canTransition;
exports.getValidTransitions = getValidTransitions;
const uuid_1 = require("uuid");
const index_js_1 = require("../constants/index.js");
function createRiskFinding(input) {
    const now = new Date().toISOString();
    return {
        id: (0, uuid_1.v4)(),
        tenant_id: input.tenant_id,
        module_id: input.module_id,
        category: input.category,
        severity: input.severity,
        likelihood: Math.max(0, Math.min(1, input.likelihood)),
        impact_eur: input.impact_eur,
        title_i18n_key: input.title_i18n_key,
        description_i18n_key: input.description_i18n_key,
        evidence_refs: input.evidence_refs ?? [],
        entities: input.entities ?? [],
        status: 'new',
        recommended_actions: input.recommended_actions ?? [],
        policy_tags: input.policy_tags ?? [],
        metadata: input.metadata,
        detected_at: now,
        created_at: now,
        updated_at: now,
    };
}
function calculateRiskScore(findings) {
    const activeFindings = findings.filter((f) => f.status === 'new' || f.status === 'acknowledged');
    const byCategory = {};
    const bySeverity = {};
    const byStatus = {};
    // Initialize
    for (const cat of index_js_1.RISK_CATEGORIES) {
        byCategory[cat] = 0;
    }
    for (const sev of index_js_1.RISK_SEVERITIES) {
        bySeverity[sev] = 0;
    }
    byStatus.new = 0;
    byStatus.acknowledged = 0;
    byStatus.mitigated = 0;
    byStatus.resolved = 0;
    byStatus.false_positive = 0;
    let totalWeightedScore = 0;
    let totalExposure = 0;
    for (const finding of findings) {
        byStatus[finding.status]++;
        if (finding.status === 'new' || finding.status === 'acknowledged') {
            const weight = index_js_1.SEVERITY_WEIGHTS[finding.severity];
            const score = weight * finding.likelihood;
            byCategory[finding.category] += score;
            bySeverity[finding.severity] += score;
            totalWeightedScore += score;
            if (finding.impact_eur) {
                totalExposure += finding.impact_eur * finding.likelihood;
            }
        }
    }
    // Normalize overall score to 0-100
    const maxPossibleScore = activeFindings.length * 10; // critical = 10
    const normalizedScore = maxPossibleScore > 0
        ? Math.round((totalWeightedScore / maxPossibleScore) * 100)
        : 0;
    return {
        score: Math.min(100, normalizedScore),
        by_category: byCategory,
        by_severity: bySeverity,
        total_exposure_eur: Math.round(totalExposure * 100) / 100,
        active_count: activeFindings.length,
        by_status: byStatus,
    };
}
function aggregateRisks(findings, options = {}) {
    const limit = options.limit ?? 10;
    // Sort by severity weight * likelihood descending
    const sorted = [...findings]
        .filter((f) => f.status === 'new' || f.status === 'acknowledged')
        .sort((a, b) => {
        const scoreA = index_js_1.SEVERITY_WEIGHTS[a.severity] * a.likelihood;
        const scoreB = index_js_1.SEVERITY_WEIGHTS[b.severity] * b.likelihood;
        return scoreB - scoreA;
    });
    // Group by entity
    const byEntity = new Map();
    for (const finding of findings) {
        for (const entity of finding.entities) {
            const key = `${entity.type}:${entity.ref_id}`;
            if (!byEntity.has(key)) {
                byEntity.set(key, []);
            }
            byEntity.get(key).push(finding);
        }
    }
    return {
        top_risks: sorted.slice(0, limit),
        by_entity: byEntity,
    };
}
// =============================================================================
// Risk Engine Class
// =============================================================================
class RiskEngine {
    detectors = new Map();
    /**
     * Register a risk detector
     */
    registerDetector(detector) {
        if (this.detectors.has(detector.id)) {
            throw new Error(`Detector ${detector.id} already registered`);
        }
        this.detectors.set(detector.id, detector);
    }
    /**
     * Unregister a risk detector
     */
    unregisterDetector(detectorId) {
        this.detectors.delete(detectorId);
    }
    /**
     * Get all registered detectors
     */
    getDetectors() {
        return Array.from(this.detectors.values());
    }
    /**
     * Run all detectors for a tenant
     */
    async runDetection(tenantId, timeframe) {
        const allFindings = [];
        for (const detector of this.detectors.values()) {
            try {
                const findings = await detector.detect(tenantId, timeframe);
                allFindings.push(...findings);
            }
            catch (error) {
                console.error(`Detector ${detector.id} failed:`, error);
                // Continue with other detectors
            }
        }
        return allFindings;
    }
    /**
     * Run detectors for specific categories
     */
    async runDetectionByCategory(tenantId, timeframe, categories) {
        const allFindings = [];
        const categorySet = new Set(categories);
        for (const detector of this.detectors.values()) {
            const hasMatchingCategory = detector.categories.some((c) => categorySet.has(c));
            if (hasMatchingCategory) {
                try {
                    const findings = await detector.detect(tenantId, timeframe);
                    allFindings.push(...findings.filter((f) => categorySet.has(f.category)));
                }
                catch (error) {
                    console.error(`Detector ${detector.id} failed:`, error);
                }
            }
        }
        return allFindings;
    }
    /**
     * Health check all detectors
     */
    async healthCheck() {
        const results = {};
        for (const detector of this.detectors.values()) {
            try {
                results[detector.id] = await detector.healthCheck();
            }
            catch {
                results[detector.id] = false;
            }
        }
        return results;
    }
    /**
     * Clear all detectors (useful for testing)
     */
    clear() {
        this.detectors.clear();
    }
}
exports.RiskEngine = RiskEngine;
// =============================================================================
// Singleton Instance
// =============================================================================
exports.riskEngine = new RiskEngine();
// =============================================================================
// Risk Status Transitions
// =============================================================================
const VALID_TRANSITIONS = {
    new: ['acknowledged', 'false_positive'],
    acknowledged: ['mitigated', 'resolved', 'false_positive'],
    mitigated: ['resolved', 'new'], // Can revert if mitigation fails
    resolved: [], // Terminal state
    false_positive: [], // Terminal state
};
function canTransition(from, to) {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
function getValidTransitions(status) {
    return VALID_TRANSITIONS[status] ?? [];
}
//# sourceMappingURL=index.js.map