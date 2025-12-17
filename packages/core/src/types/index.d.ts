/**
 * Core Type Definitions
 *
 * This file contains all shared types used across the platform.
 * All modules should import types from @platform/core/types
 */
export type UUID = string;
export type ISODateString = string;
export type I18nKey = string;
export interface Tenant {
    id: UUID;
    name: string;
    slug: string;
    settings: TenantSettings;
    plan_id: PlanId;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    billing_email?: string;
    is_active: boolean;
    created_at: ISODateString;
    updated_at: ISODateString;
    deleted_at?: ISODateString;
}
export interface TenantSettings {
    locale?: string;
    timezone?: string;
    currency?: string;
    features?: Record<string, boolean>;
    branding?: {
        logo_url?: string;
        primary_color?: string;
    };
}
export type PlanId = 'essential' | 'professional' | 'enterprise';
export interface User {
    id: UUID;
    tenant_id: UUID;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    locale: string;
    timezone: string;
    mfa_enabled: boolean;
    email_verified_at?: ISODateString;
    last_login_at?: ISODateString;
    is_active: boolean;
    created_at: ISODateString;
    updated_at: ISODateString;
    deleted_at?: ISODateString;
}
export interface UserWithRoles extends User {
    roles: Role[];
    permissions: Permission[];
    attributes: UserAttribute[];
}
export interface Role {
    id: UUID;
    tenant_id?: UUID;
    name: string;
    name_i18n_key?: I18nKey;
    description_i18n_key?: I18nKey;
    is_system: boolean;
    created_at: ISODateString;
    updated_at: ISODateString;
}
export interface Permission {
    id: UUID;
    code: string;
    name_i18n_key?: I18nKey;
    description_i18n_key?: I18nKey;
    module_id?: string;
    resource: string;
    action: string;
    created_at: ISODateString;
}
export interface UserAttribute {
    id: UUID;
    user_id: UUID;
    attribute_key: string;
    attribute_value: string;
    created_at: ISODateString;
}
export type RiskCategory = 'legal' | 'payroll' | 'security' | 'ops' | 'finance' | 'compliance';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'new' | 'acknowledged' | 'mitigated' | 'resolved' | 'false_positive';
export interface RiskFinding {
    id: UUID;
    tenant_id: UUID;
    module_id: string;
    category: RiskCategory;
    severity: RiskSeverity;
    likelihood: number;
    impact_eur?: number;
    title_i18n_key: I18nKey;
    description_i18n_key: I18nKey;
    evidence_refs: EvidenceRef[];
    entities: EntityRef[];
    status: RiskStatus;
    recommended_actions: I18nKey[];
    policy_tags: string[];
    metadata?: Record<string, unknown>;
    detected_at: ISODateString;
    acknowledged_at?: ISODateString;
    acknowledged_by?: UUID;
    resolved_at?: ISODateString;
    resolved_by?: UUID;
    created_at: ISODateString;
    updated_at: ISODateString;
}
export interface EvidenceRef {
    type: 'document' | 'record' | 'log' | 'screenshot';
    ref_id: string;
    label_i18n_key: I18nKey;
}
export type EntityType = 'employee' | 'contract' | 'company' | 'client' | 'asset' | 'document';
export interface EntityRef {
    type: EntityType;
    ref_id: string;
    label: string;
}
export type ActorType = 'user' | 'system' | 'module';
export interface AuditEvent {
    id: UUID;
    tenant_id?: UUID;
    actor_id?: UUID;
    actor_type: ActorType;
    action: string;
    target_type?: string;
    target_id?: UUID;
    changes: Record<string, {
        from?: unknown;
        to?: unknown;
    }>;
    metadata: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    event_hash: string;
    batch_id?: UUID;
    created_at: ISODateString;
}
export type AuditBatchStatus = 'pending' | 'anchoring' | 'anchored' | 'failed';
export interface AuditBatch {
    id: UUID;
    merkle_root: string;
    event_count: number;
    first_event_at: ISODateString;
    last_event_at: ISODateString;
    blockchain_network?: string;
    blockchain_tx_hash?: string;
    blockchain_block?: number;
    anchored_at?: ISODateString;
    status: AuditBatchStatus;
    created_at: ISODateString;
}
export interface ModuleManifest {
    id: string;
    version: string;
    name_i18n_key: I18nKey;
    description_i18n_key?: I18nKey;
    author?: string;
    license?: string;
    permissions: string[];
    policies: ModulePolicy[];
    db_migrations_path: string;
    risk_providers: string[];
    ui_extensions: ModuleUIExtensions;
    dependencies?: Record<string, string>;
    config_schema?: Record<string, unknown>;
}
export interface ModulePolicy {
    name: string;
    type: 'rbac' | 'abac';
    rules: Record<string, unknown>;
}
export interface ModuleUIExtensions {
    routes?: ModuleRoute[];
    widgets?: ModuleWidget[];
    menu_items?: ModuleMenuItem[];
}
export interface ModuleRoute {
    path: string;
    component: string;
    permission?: string;
}
export interface ModuleWidget {
    id: string;
    component: string;
    slots: string[];
}
export interface ModuleMenuItem {
    label_i18n_key: I18nKey;
    icon: string;
    path: string;
    permission?: string;
}
export type ModuleHealthStatus = 'ok' | 'warn' | 'fail';
export interface ModuleHealth {
    status: ModuleHealthStatus;
    details: Record<string, boolean>;
}
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
export interface Subscription {
    id: UUID;
    tenant_id: UUID;
    plan_id: PlanId;
    billing_cycle: BillingCycle;
    status: SubscriptionStatus;
    stripe_subscription_id?: string;
    current_period_start?: ISODateString;
    current_period_end?: ISODateString;
    cancel_at_period_end: boolean;
    created_at: ISODateString;
    updated_at: ISODateString;
}
export type ModuleLicenseType = 'included' | 'addon';
export interface ModuleLicense {
    id: UUID;
    tenant_id: UUID;
    module_id: string;
    license_type: ModuleLicenseType;
    is_active: boolean;
    limits?: Record<string, number>;
    stripe_item_id?: string;
    valid_from: ISODateString;
    valid_until?: ISODateString;
    created_at: ISODateString;
    updated_at: ISODateString;
}
export interface Session {
    id: UUID;
    user_id: UUID;
    token_hash: string;
    refresh_token_hash?: string;
    ip_address?: string;
    user_agent?: string;
    device_id?: string;
    last_activity_at: ISODateString;
    expires_at: ISODateString;
    created_at: ISODateString;
    revoked_at?: ISODateString;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export interface TimeFrame {
    start: ISODateString;
    end: ISODateString;
}
//# sourceMappingURL=index.d.ts.map