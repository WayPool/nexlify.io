/**
 * Risk Engine
 *
 * Core risk processing, scoring, and aggregation logic.
 * Modules register risk detectors that emit normalized RiskFindings.
 */

import { v4 as uuid } from 'uuid';
import type {
  UUID,
  RiskFinding,
  RiskCategory,
  RiskSeverity,
  RiskStatus,
  TimeFrame,
  EntityRef,
  EvidenceRef,
  I18nKey,
} from '../types/index.js';
import { SEVERITY_WEIGHTS, RISK_CATEGORIES, RISK_SEVERITIES } from '../constants/index.js';

// =============================================================================
// Risk Detector Interface
// =============================================================================

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

// =============================================================================
// Risk Finding Builder
// =============================================================================

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

export function createRiskFinding(input: RiskFindingInput): RiskFinding {
  const now = new Date().toISOString();

  return {
    id: uuid(),
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

// =============================================================================
// Risk Scoring
// =============================================================================

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

export function calculateRiskScore(findings: RiskFinding[]): RiskScore {
  const activeFindings = findings.filter(
    (f) => f.status === 'new' || f.status === 'acknowledged'
  );

  const byCategory = {} as Record<RiskCategory, number>;
  const bySeverity = {} as Record<RiskSeverity, number>;
  const byStatus = {} as Record<RiskStatus, number>;

  // Initialize
  for (const cat of RISK_CATEGORIES) {
    byCategory[cat] = 0;
  }
  for (const sev of RISK_SEVERITIES) {
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
      const weight = SEVERITY_WEIGHTS[finding.severity];
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
  const normalizedScore =
    maxPossibleScore > 0
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

// =============================================================================
// Risk Aggregation
// =============================================================================

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

export function aggregateRisks(
  findings: RiskFinding[],
  options: { limit?: number } = {}
): RiskAggregation {
  const limit = options.limit ?? 10;

  // Sort by severity weight * likelihood descending
  const sorted = [...findings]
    .filter((f) => f.status === 'new' || f.status === 'acknowledged')
    .sort((a, b) => {
      const scoreA = SEVERITY_WEIGHTS[a.severity] * a.likelihood;
      const scoreB = SEVERITY_WEIGHTS[b.severity] * b.likelihood;
      return scoreB - scoreA;
    });

  // Group by entity
  const byEntity = new Map<string, RiskFinding[]>();
  for (const finding of findings) {
    for (const entity of finding.entities) {
      const key = `${entity.type}:${entity.ref_id}`;
      if (!byEntity.has(key)) {
        byEntity.set(key, []);
      }
      byEntity.get(key)!.push(finding);
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

export class RiskEngine {
  private detectors: Map<string, RiskDetector> = new Map();

  /**
   * Register a risk detector
   */
  registerDetector(detector: RiskDetector): void {
    if (this.detectors.has(detector.id)) {
      throw new Error(`Detector ${detector.id} already registered`);
    }
    this.detectors.set(detector.id, detector);
  }

  /**
   * Unregister a risk detector
   */
  unregisterDetector(detectorId: string): void {
    this.detectors.delete(detectorId);
  }

  /**
   * Get all registered detectors
   */
  getDetectors(): RiskDetector[] {
    return Array.from(this.detectors.values());
  }

  /**
   * Run all detectors for a tenant
   */
  async runDetection(tenantId: UUID, timeframe: TimeFrame): Promise<RiskFinding[]> {
    const allFindings: RiskFinding[] = [];

    for (const detector of this.detectors.values()) {
      try {
        const findings = await detector.detect(tenantId, timeframe);
        allFindings.push(...findings);
      } catch (error) {
        console.error(`Detector ${detector.id} failed:`, error);
        // Continue with other detectors
      }
    }

    return allFindings;
  }

  /**
   * Run detectors for specific categories
   */
  async runDetectionByCategory(
    tenantId: UUID,
    timeframe: TimeFrame,
    categories: RiskCategory[]
  ): Promise<RiskFinding[]> {
    const allFindings: RiskFinding[] = [];
    const categorySet = new Set(categories);

    for (const detector of this.detectors.values()) {
      const hasMatchingCategory = detector.categories.some((c) => categorySet.has(c));

      if (hasMatchingCategory) {
        try {
          const findings = await detector.detect(tenantId, timeframe);
          allFindings.push(...findings.filter((f) => categorySet.has(f.category)));
        } catch (error) {
          console.error(`Detector ${detector.id} failed:`, error);
        }
      }
    }

    return allFindings;
  }

  /**
   * Health check all detectors
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const detector of this.detectors.values()) {
      try {
        results[detector.id] = await detector.healthCheck();
      } catch {
        results[detector.id] = false;
      }
    }

    return results;
  }

  /**
   * Clear all detectors (useful for testing)
   */
  clear(): void {
    this.detectors.clear();
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const riskEngine = new RiskEngine();

// =============================================================================
// Risk Status Transitions
// =============================================================================

const VALID_TRANSITIONS: Record<RiskStatus, RiskStatus[]> = {
  new: ['acknowledged', 'false_positive'],
  acknowledged: ['mitigated', 'resolved', 'false_positive'],
  mitigated: ['resolved', 'new'], // Can revert if mitigation fails
  resolved: [], // Terminal state
  false_positive: [], // Terminal state
};

export function canTransition(from: RiskStatus, to: RiskStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidTransitions(status: RiskStatus): RiskStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}
