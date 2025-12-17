/**
 * Event Bus Implementation
 *
 * Provides event emission and subscription for domain and audit events.
 * All events follow the pattern: <scope>.<domain>.<action>
 */

import { v4 as uuid } from 'uuid';
import type { UUID, AuditEvent, ActorType } from '../types/index.js';

// =============================================================================
// Event Types
// =============================================================================

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

// =============================================================================
// Event Bus Interface
// =============================================================================

export interface IEventBus {
  emit<T>(type: string, payload: T, metadata?: Partial<EventMetadata>): Promise<void>;
  subscribe<T>(type: string, handler: EventHandler<T>): EventSubscription;
  subscribePattern<T>(pattern: string, handler: EventHandler<T>): EventSubscription;
}

// =============================================================================
// In-Memory Event Bus Implementation
// =============================================================================

type SubscriptionEntry = {
  pattern: RegExp;
  handler: EventHandler;
};

export class EventBus implements IEventBus {
  private subscriptions: Map<string, Set<EventHandler>> = new Map();
  private patternSubscriptions: Set<SubscriptionEntry> = new Set();
  private middlewares: Array<(event: DomainEvent) => Promise<DomainEvent | null>> = [];

  /**
   * Add middleware that can transform or filter events
   */
  use(middleware: (event: DomainEvent) => Promise<DomainEvent | null>): void {
    this.middlewares.push(middleware);
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<T>(
    type: string,
    payload: T,
    metadata: Partial<EventMetadata> = {}
  ): Promise<void> {
    let event: DomainEvent<T> | null = {
      id: uuid(),
      type,
      payload,
      metadata: {
        correlation_id: metadata.correlation_id ?? uuid(),
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    };

    // Run through middlewares
    for (const middleware of this.middlewares) {
      event = (await middleware(event as DomainEvent)) as DomainEvent<T> | null;
      if (!event) return; // Event filtered out
    }

    // Exact match subscriptions
    const handlers = this.subscriptions.get(type);
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map((handler) =>
          handler(event as DomainEvent).catch((err) => {
            console.error(`Event handler error for ${type}:`, err);
          })
        )
      );
    }

    // Pattern subscriptions
    for (const { pattern, handler } of this.patternSubscriptions) {
      if (pattern.test(type)) {
        await handler(event as DomainEvent).catch((err) => {
          console.error(`Pattern handler error for ${type}:`, err);
        });
      }
    }
  }

  /**
   * Subscribe to exact event type
   */
  subscribe<T>(type: string, handler: EventHandler<T>): EventSubscription {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set());
    }

    const handlers = this.subscriptions.get(type)!;
    handlers.add(handler as EventHandler);

    return {
      unsubscribe: () => {
        handlers.delete(handler as EventHandler);
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
  subscribePattern<T>(pattern: string, handler: EventHandler<T>): EventSubscription {
    const regexPattern = new RegExp(
      '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$'
    );

    const entry: SubscriptionEntry = {
      pattern: regexPattern,
      handler: handler as EventHandler,
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
  clear(): void {
    this.subscriptions.clear();
    this.patternSubscriptions.clear();
    this.middlewares = [];
  }
}

// =============================================================================
// Core Event Types
// =============================================================================

// Tenant Events
export const TENANT_CREATED = 'core.tenant.created';
export const TENANT_UPDATED = 'core.tenant.updated';
export const TENANT_DELETED = 'core.tenant.deleted';
export const TENANT_PLAN_CHANGED = 'core.tenant.plan_changed';

// User Events
export const USER_CREATED = 'core.user.created';
export const USER_UPDATED = 'core.user.updated';
export const USER_DELETED = 'core.user.deleted';
export const USER_LOGGED_IN = 'core.user.logged_in';
export const USER_LOGGED_OUT = 'core.user.logged_out';
export const USER_PASSWORD_CHANGED = 'core.user.password_changed';
export const USER_MFA_ENABLED = 'core.user.mfa_enabled';
export const USER_MFA_DISABLED = 'core.user.mfa_disabled';

// Access Events
export const ACCESS_ROLE_GRANTED = 'core.access.role_granted';
export const ACCESS_ROLE_REVOKED = 'core.access.role_revoked';
export const ACCESS_PERMISSION_DENIED = 'core.access.permission_denied';

// Risk Events
export const RISK_CREATED = 'core.risk.created';
export const RISK_UPDATED = 'core.risk.updated';
export const RISK_ACKNOWLEDGED = 'core.risk.acknowledged';
export const RISK_MITIGATED = 'core.risk.mitigated';
export const RISK_RESOLVED = 'core.risk.resolved';
export const RISK_ESCALATED = 'core.risk.escalated';

// Module Events
export const MODULE_ACTIVATED = 'core.module.activated';
export const MODULE_DEACTIVATED = 'core.module.deactivated';
export const MODULE_INSTALLED = 'core.module.installed';
export const MODULE_UNINSTALLED = 'core.module.uninstalled';

// Subscription Events
export const SUBSCRIPTION_CREATED = 'core.subscription.created';
export const SUBSCRIPTION_UPDATED = 'core.subscription.updated';
export const SUBSCRIPTION_CANCELED = 'core.subscription.canceled';

// Audit Events
export const AUDIT_BATCH_CREATED = 'audit.batch.created';
export const AUDIT_BATCH_ANCHORED = 'audit.batch.anchored';
export const AUDIT_BATCH_FAILED = 'audit.batch.failed';

// =============================================================================
// Event Payload Types
// =============================================================================

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

// =============================================================================
// Audit Event Builder
// =============================================================================

export function createAuditEvent(params: {
  tenant_id?: UUID;
  actor_id?: UUID;
  actor_type: ActorType;
  action: string;
  target_type?: string;
  target_id?: UUID;
  changes?: Record<string, { from?: unknown; to?: unknown }>;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}): Omit<AuditEvent, 'id' | 'event_hash' | 'batch_id' | 'created_at'> {
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

export const eventBus = new EventBus();
