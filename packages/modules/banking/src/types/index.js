/**
 * Banking Module Types
 *
 * Type definitions for bank connections, transactions, and anomaly detection.
 */
import { z } from 'zod';
// =============================================================================
// Validation Schemas
// =============================================================================
export const CreateConnectionSchema = z.object({
    institutionId: z.string().min(1),
    redirectUrl: z.string().url(),
});
export const UpdateAlertSchema = z.object({
    status: z.enum(['open', 'investigating', 'resolved', 'dismissed']).optional(),
    assignedTo: z.string().uuid().nullable().optional(),
    resolution: z.string().max(1000).optional(),
});
export const CreateRuleSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000),
    type: z.enum([
        'unusual_amount',
        'unusual_time',
        'unusual_frequency',
        'unknown_counterparty',
        'high_risk_country',
        'round_amount',
        'structuring',
        'velocity',
        'dormant_activation',
        'category_mismatch',
        'duplicate',
        'manual_flag',
    ]),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    enabled: z.boolean().default(true),
    conditions: z.array(z.object({
        field: z.string(),
        operator: z.enum([
            'eq',
            'neq',
            'gt',
            'gte',
            'lt',
            'lte',
            'contains',
            'not_contains',
            'in',
            'not_in',
            'regex',
            'between',
        ]),
        value: z.unknown(),
        unit: z.string().optional(),
    })),
    actions: z.array(z.object({
        type: z.enum(['flag', 'alert', 'block', 'notify']),
        config: z.record(z.unknown()),
    })),
});
//# sourceMappingURL=index.js.map