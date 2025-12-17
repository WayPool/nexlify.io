"use strict";
/**
 * Event Bus Implementation
 *
 * Provides event emission and subscription for domain and audit events.
 * All events follow the pattern: <scope>.<domain>.<action>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.AUDIT_BATCH_FAILED = exports.AUDIT_BATCH_ANCHORED = exports.AUDIT_BATCH_CREATED = exports.SUBSCRIPTION_CANCELED = exports.SUBSCRIPTION_UPDATED = exports.SUBSCRIPTION_CREATED = exports.MODULE_UNINSTALLED = exports.MODULE_INSTALLED = exports.MODULE_DEACTIVATED = exports.MODULE_ACTIVATED = exports.RISK_ESCALATED = exports.RISK_RESOLVED = exports.RISK_MITIGATED = exports.RISK_ACKNOWLEDGED = exports.RISK_UPDATED = exports.RISK_CREATED = exports.ACCESS_PERMISSION_DENIED = exports.ACCESS_ROLE_REVOKED = exports.ACCESS_ROLE_GRANTED = exports.USER_MFA_DISABLED = exports.USER_MFA_ENABLED = exports.USER_PASSWORD_CHANGED = exports.USER_LOGGED_OUT = exports.USER_LOGGED_IN = exports.USER_DELETED = exports.USER_UPDATED = exports.USER_CREATED = exports.TENANT_PLAN_CHANGED = exports.TENANT_DELETED = exports.TENANT_UPDATED = exports.TENANT_CREATED = exports.EventBus = void 0;
exports.createAuditEvent = createAuditEvent;
const uuid_1 = require("uuid");
class EventBus {
    subscriptions = new Map();
    patternSubscriptions = new Set();
    middlewares = [];
    /**
     * Add middleware that can transform or filter events
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }
    /**
     * Emit an event to all subscribers
     */
    async emit(type, payload, metadata = {}) {
        let event = {
            id: (0, uuid_1.v4)(),
            type,
            payload,
            metadata: {
                correlation_id: metadata.correlation_id ?? (0, uuid_1.v4)(),
                ...metadata,
            },
            timestamp: new Date().toISOString(),
        };
        // Run through middlewares
        for (const middleware of this.middlewares) {
            event = (await middleware(event));
            if (!event)
                return; // Event filtered out
        }
        // Exact match subscriptions
        const handlers = this.subscriptions.get(type);
        if (handlers) {
            await Promise.all(Array.from(handlers).map((handler) => handler(event).catch((err) => {
                console.error(`Event handler error for ${type}:`, err);
            })));
        }
        // Pattern subscriptions
        for (const { pattern, handler } of this.patternSubscriptions) {
            if (pattern.test(type)) {
                await handler(event).catch((err) => {
                    console.error(`Pattern handler error for ${type}:`, err);
                });
            }
        }
    }
    /**
     * Subscribe to exact event type
     */
    subscribe(type, handler) {
        if (!this.subscriptions.has(type)) {
            this.subscriptions.set(type, new Set());
        }
        const handlers = this.subscriptions.get(type);
        handlers.add(handler);
        return {
            unsubscribe: () => {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this.subscriptions.delete(type);
                }
            },
        };
    }
    /**
     * Subscribe to events matching a pattern
     * Supports wildcards: 'core.*' matches 'core.user.created', 'core.risk.updated', etc.
     */
    subscribePattern(pattern, handler) {
        const regexPattern = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$');
        const entry = {
            pattern: regexPattern,
            handler: handler,
        };
        this.patternSubscriptions.add(entry);
        return {
            unsubscribe: () => {
                this.patternSubscriptions.delete(entry);
            },
        };
    }
    /**
     * Clear all subscriptions (useful for testing)
     */
    clear() {
        this.subscriptions.clear();
        this.patternSubscriptions.clear();
        this.middlewares = [];
    }
}
exports.EventBus = EventBus;
// =============================================================================
// Core Event Types
// =============================================================================
// Tenant Events
exports.TENANT_CREATED = 'core.tenant.created';
exports.TENANT_UPDATED = 'core.tenant.updated';
exports.TENANT_DELETED = 'core.tenant.deleted';
exports.TENANT_PLAN_CHANGED = 'core.tenant.plan_changed';
// User Events
exports.USER_CREATED = 'core.user.created';
exports.USER_UPDATED = 'core.user.updated';
exports.USER_DELETED = 'core.user.deleted';
exports.USER_LOGGED_IN = 'core.user.logged_in';
exports.USER_LOGGED_OUT = 'core.user.logged_out';
exports.USER_PASSWORD_CHANGED = 'core.user.password_changed';
exports.USER_MFA_ENABLED = 'core.user.mfa_enabled';
exports.USER_MFA_DISABLED = 'core.user.mfa_disabled';
// Access Events
exports.ACCESS_ROLE_GRANTED = 'core.access.role_granted';
exports.ACCESS_ROLE_REVOKED = 'core.access.role_revoked';
exports.ACCESS_PERMISSION_DENIED = 'core.access.permission_denied';
// Risk Events
exports.RISK_CREATED = 'core.risk.created';
exports.RISK_UPDATED = 'core.risk.updated';
exports.RISK_ACKNOWLEDGED = 'core.risk.acknowledged';
exports.RISK_MITIGATED = 'core.risk.mitigated';
exports.RISK_RESOLVED = 'core.risk.resolved';
exports.RISK_ESCALATED = 'core.risk.escalated';
// Module Events
exports.MODULE_ACTIVATED = 'core.module.activated';
exports.MODULE_DEACTIVATED = 'core.module.deactivated';
exports.MODULE_INSTALLED = 'core.module.installed';
exports.MODULE_UNINSTALLED = 'core.module.uninstalled';
// Subscription Events
exports.SUBSCRIPTION_CREATED = 'core.subscription.created';
exports.SUBSCRIPTION_UPDATED = 'core.subscription.updated';
exports.SUBSCRIPTION_CANCELED = 'core.subscription.canceled';
// Audit Events
exports.AUDIT_BATCH_CREATED = 'audit.batch.created';
exports.AUDIT_BATCH_ANCHORED = 'audit.batch.anchored';
exports.AUDIT_BATCH_FAILED = 'audit.batch.failed';
// =============================================================================
// Audit Event Builder
// =============================================================================
function createAuditEvent(params) {
    return {
        tenant_id: params.tenant_id,
        actor_id: params.actor_id,
        actor_type: params.actor_type,
        action: params.action,
        target_type: params.target_type,
        target_id: params.target_id,
        changes: params.changes ?? {},
        metadata: params.metadata ?? {},
        ip_address: params.ip_address,
        user_agent: params.user_agent,
    };
}
// =============================================================================
// Singleton Instance
// =============================================================================
exports.eventBus = new EventBus();
//# sourceMappingURL=index.js.map