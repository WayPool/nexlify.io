/**
 * Event Bus Implementation
 *
 * Provides event emission and subscription for domain and audit events.
 * All events follow the pattern: <scope>.<domain>.<action>
 */
import type { UUID, AuditEvent, ActorType } from '../types/index.js';
export interface DomainEvent<T = unknown> {
    id: UUID;
    type: string;
    tenant_id?: UUID;
    payload: T;
    metadata: EventMetadata;
    timestamp: string;
}
export interface EventMetadata {
    correlation_id?: string;
    causation_id?: string;
    actor_id?: UUID;
    actor_type?: ActorType;
    source?: string;
}
export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;
export interface EventSubscription {
    unsubscribe: () => void;
}
export interface IEventBus {
    emit<T>(type: string, payload: T, metadata?: Partial<EventMetadata>): Promise<void>;
    subscribe<T>(type: string, handler: EventHandler<T>): EventSubscription;
    subscribePattern<T>(pattern: string, handler: EventHandler<T>): EventSubscription;
}
export declare class EventBus implements IEventBus {
    private subscriptions;
    private patternSubscriptions;
    private middlewares;
    /**
     * Add middleware that can transform or filter events
     */
    use(middleware: (event: DomainEvent) => Promise<DomainEvent | null>): void;
    /**
     * Emit an event to all subscribers
     */
    emit<T>(type: string, payload: T, metadata?: Partial<EventMetadata>): Promise<void>;
    /**
     * Subscribe to exact event type
     */
    subscribe<T>(type: string, handler: EventHandler<T>): EventSubscription;
    /**
     * Subscribe to events matching a pattern
     * Supports wildcards: 'core.*' matches 'core.user.created', 'core.risk.updated', etc.
     */
    subscribePattern<T>(pattern: string, handler: EventHandler<T>): EventSubscription;
    /**
     * Clear all subscriptions (useful for testing)
     */
    clear(): void;
}
export declare const TENANT_CREATED = "core.tenant.created";
export declare const TENANT_UPDATED = "core.tenant.updated";
export declare const TENANT_DELETED = "core.tenant.deleted";
export declare const TENANT_PLAN_CHANGED = "core.tenant.plan_changed";
export declare const USER_CREATED = "core.user.created";
export declare const USER_UPDATED = "core.user.updated";
export declare const USER_DELETED = "core.user.deleted";
export declare const USER_LOGGED_IN = "core.user.logged_in";
export declare const USER_LOGGED_OUT = "core.user.logged_out";
export declare const USER_PASSWORD_CHANGED = "core.user.password_changed";
export declare const USER_MFA_ENABLED = "core.user.mfa_enabled";
export declare const USER_MFA_DISABLED = "core.user.mfa_disabled";
export declare const ACCESS_ROLE_GRANTED = "core.access.role_granted";
export declare const ACCESS_ROLE_REVOKED = "core.access.role_revoked";
export declare const ACCESS_PERMISSION_DENIED = "core.access.permission_denied";
export declare const RISK_CREATED = "core.risk.created";
export declare const RISK_UPDATED = "core.risk.updated";
export declare const RISK_ACKNOWLEDGED = "core.risk.acknowledged";
export declare const RISK_MITIGATED = "core.risk.mitigated";
export declare const RISK_RESOLVED = "core.risk.resolved";
export declare const RISK_ESCALATED = "core.risk.escalated";
export declare const MODULE_ACTIVATED = "core.module.activated";
export declare const MODULE_DEACTIVATED = "core.module.deactivated";
export declare const MODULE_INSTALLED = "core.module.installed";
export declare const MODULE_UNINSTALLED = "core.module.uninstalled";
export declare const SUBSCRIPTION_CREATED = "core.subscription.created";
export declare const SUBSCRIPTION_UPDATED = "core.subscription.updated";
export declare const SUBSCRIPTION_CANCELED = "core.subscription.canceled";
export declare const AUDIT_BATCH_CREATED = "audit.batch.created";
export declare const AUDIT_BATCH_ANCHORED = "audit.batch.anchored";
export declare const AUDIT_BATCH_FAILED = "audit.batch.failed";
export interface TenantCreatedPayload {
    tenant_id: UUID;
    name: string;
    slug: string;
    plan_id: string;
}
export interface UserLoggedInPayload {
    user_id: UUID;
    tenant_id: UUID;
    ip_address?: string;
    user_agent?: string;
}
export interface RiskCreatedPayload {
    finding_id: UUID;
    tenant_id: UUID;
    module_id: string;
    category: string;
    severity: string;
    title_i18n_key: string;
}
export interface RiskStatusChangedPayload {
    finding_id: UUID;
    tenant_id: UUID;
    old_status: string;
    new_status: string;
    changed_by?: UUID;
}
export declare function createAuditEvent(params: {
    tenant_id?: UUID;
    actor_id?: UUID;
    actor_type: ActorType;
    action: string;
    target_type?: string;
    target_id?: UUID;
    changes?: Record<string, {
        from?: unknown;
        to?: unknown;
    }>;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
}): Omit<AuditEvent, 'id' | 'event_hash' | 'batch_id' | 'created_at'>;
export declare const eventBus: EventBus;
//# sourceMappingURL=index.d.ts.map