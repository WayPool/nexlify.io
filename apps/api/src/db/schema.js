"use strict";
/**
 * Database schema using Drizzle ORM.
 * Matches the schema defined in docs/database/schema.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifications = exports.apiKeys = exports.sessions = exports.auditLogProofs = exports.blockchainAnchors = exports.auditLogs = exports.riskHistory = exports.risks = exports.tenantModules = exports.modules = exports.userPermissions = exports.users = exports.tenants = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// =============================================================================
// Tenants
// =============================================================================
exports.tenants = (0, mysql_core_1.mysqlTable)('tenants', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, mysql_core_1.varchar)('slug', { length: 100 }).notNull(),
    plan: (0, mysql_core_1.mysqlEnum)('plan', ['essential', 'professional', 'enterprise'])
        .default('essential')
        .notNull(),
    settings: (0, mysql_core_1.json)('settings').$type(),
    stripe_customer_id: (0, mysql_core_1.varchar)('stripe_customer_id', { length: 100 }),
    stripe_subscription_id: (0, mysql_core_1.varchar)('stripe_subscription_id', { length: 100 }),
    status: (0, mysql_core_1.mysqlEnum)('status', ['active', 'suspended', 'cancelled'])
        .default('active')
        .notNull(),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
    deleted_at: (0, mysql_core_1.timestamp)('deleted_at'),
}, (table) => ({
    slugIdx: (0, mysql_core_1.uniqueIndex)('tenants_slug_idx').on(table.slug),
    stripeCustomerIdx: (0, mysql_core_1.index)('tenants_stripe_customer_idx').on(table.stripe_customer_id),
}));
// =============================================================================
// Users
// =============================================================================
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    tenant_id: (0, mysql_core_1.varchar)('tenant_id', { length: 36 })
        .notNull()
        .references(() => exports.tenants.id),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }).notNull(),
    password_hash: (0, mysql_core_1.varchar)('password_hash', { length: 255 }),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    role: (0, mysql_core_1.mysqlEnum)('role', ['admin', 'auditor', 'manager', 'viewer', 'module_operator'])
        .default('viewer')
        .notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', ['pending', 'active', 'inactive'])
        .default('pending')
        .notNull(),
    mfa_enabled: (0, mysql_core_1.boolean)('mfa_enabled').default(false).notNull(),
    mfa_secret: (0, mysql_core_1.varchar)('mfa_secret', { length: 255 }),
    google_id: (0, mysql_core_1.varchar)('google_id', { length: 255 }),
    last_login: (0, mysql_core_1.timestamp)('last_login'),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
    deleted_at: (0, mysql_core_1.timestamp)('deleted_at'),
}, (table) => ({
    emailTenantIdx: (0, mysql_core_1.uniqueIndex)('users_email_tenant_idx').on(table.email, table.tenant_id),
    tenantIdx: (0, mysql_core_1.index)('users_tenant_idx').on(table.tenant_id),
    googleIdx: (0, mysql_core_1.index)('users_google_idx').on(table.google_id),
}));
// =============================================================================
// User Permissions
// =============================================================================
exports.userPermissions = (0, mysql_core_1.mysqlTable)('user_permissions', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    user_id: (0, mysql_core_1.varchar)('user_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    permission: (0, mysql_core_1.varchar)('permission', { length: 100 }).notNull(),
    granted_at: (0, mysql_core_1.timestamp)('granted_at').defaultNow().notNull(),
    granted_by: (0, mysql_core_1.varchar)('granted_by', { length: 36 }).references(() => exports.users.id),
}, (table) => ({
    userPermIdx: (0, mysql_core_1.uniqueIndex)('user_permissions_user_perm_idx').on(table.user_id, table.permission),
}));
// =============================================================================
// Modules
// =============================================================================
exports.modules = (0, mysql_core_1.mysqlTable)('modules', {
    id: (0, mysql_core_1.varchar)('id', { length: 50 }).primaryKey(),
    name_i18n_key: (0, mysql_core_1.varchar)('name_i18n_key', { length: 100 }).notNull(),
    description_i18n_key: (0, mysql_core_1.varchar)('description_i18n_key', { length: 100 }),
    version: (0, mysql_core_1.varchar)('version', { length: 20 }).notNull(),
    author: (0, mysql_core_1.varchar)('author', { length: 255 }),
    manifest: (0, mysql_core_1.json)('manifest').$type().notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', ['available', 'deprecated', 'removed'])
        .default('available')
        .notNull(),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// =============================================================================
// Tenant Modules
// =============================================================================
exports.tenantModules = (0, mysql_core_1.mysqlTable)('tenant_modules', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    tenant_id: (0, mysql_core_1.varchar)('tenant_id', { length: 36 })
        .notNull()
        .references(() => exports.tenants.id),
    module_id: (0, mysql_core_1.varchar)('module_id', { length: 50 })
        .notNull()
        .references(() => exports.modules.id),
    status: (0, mysql_core_1.mysqlEnum)('status', ['active', 'inactive', 'error'])
        .default('active')
        .notNull(),
    config: (0, mysql_core_1.json)('config').$type(),
    installed_at: (0, mysql_core_1.timestamp)('installed_at').defaultNow().notNull(),
    activated_at: (0, mysql_core_1.timestamp)('activated_at'),
    deactivated_at: (0, mysql_core_1.timestamp)('deactivated_at'),
}, (table) => ({
    tenantModuleIdx: (0, mysql_core_1.uniqueIndex)('tenant_modules_tenant_module_idx').on(table.tenant_id, table.module_id),
}));
// =============================================================================
// Risks
// =============================================================================
exports.risks = (0, mysql_core_1.mysqlTable)('risks', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    tenant_id: (0, mysql_core_1.varchar)('tenant_id', { length: 36 })
        .notNull()
        .references(() => exports.tenants.id),
    module_id: (0, mysql_core_1.varchar)('module_id', { length: 50 })
        .notNull()
        .references(() => exports.modules.id),
    detector_id: (0, mysql_core_1.varchar)('detector_id', { length: 100 }).notNull(),
    title_i18n_key: (0, mysql_core_1.varchar)('title_i18n_key', { length: 100 }).notNull(),
    description_i18n_key: (0, mysql_core_1.varchar)('description_i18n_key', { length: 100 }),
    severity: (0, mysql_core_1.mysqlEnum)('severity', ['low', 'medium', 'high', 'critical']).notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', [
        'new',
        'acknowledged',
        'mitigated',
        'resolved',
        'false_positive',
    ])
        .default('new')
        .notNull(),
    category: (0, mysql_core_1.mysqlEnum)('category', [
        'legal',
        'payroll',
        'security',
        'ops',
        'finance',
        'compliance',
    ]).notNull(),
    likelihood: (0, mysql_core_1.decimal)('likelihood', { precision: 3, scale: 2 }).notNull(),
    impact_eur: (0, mysql_core_1.int)('impact_eur').notNull(),
    entities: (0, mysql_core_1.json)('entities').$type(),
    evidence: (0, mysql_core_1.json)('evidence').$type(),
    recommended_actions_i18n_key: (0, mysql_core_1.varchar)('recommended_actions_i18n_key', { length: 100 }),
    assigned_to: (0, mysql_core_1.varchar)('assigned_to', { length: 36 }).references(() => exports.users.id),
    detected_at: (0, mysql_core_1.timestamp)('detected_at').defaultNow().notNull(),
    acknowledged_at: (0, mysql_core_1.timestamp)('acknowledged_at'),
    acknowledged_by: (0, mysql_core_1.varchar)('acknowledged_by', { length: 36 }).references(() => exports.users.id),
    resolved_at: (0, mysql_core_1.timestamp)('resolved_at'),
    resolved_by: (0, mysql_core_1.varchar)('resolved_by', { length: 36 }).references(() => exports.users.id),
    resolution_notes: (0, mysql_core_1.text)('resolution_notes'),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
    deleted_at: (0, mysql_core_1.timestamp)('deleted_at'),
}, (table) => ({
    tenantIdx: (0, mysql_core_1.index)('risks_tenant_idx').on(table.tenant_id),
    tenantStatusIdx: (0, mysql_core_1.index)('risks_tenant_status_idx').on(table.tenant_id, table.status),
    tenantSeverityIdx: (0, mysql_core_1.index)('risks_tenant_severity_idx').on(table.tenant_id, table.severity),
    moduleIdx: (0, mysql_core_1.index)('risks_module_idx').on(table.module_id),
    detectedAtIdx: (0, mysql_core_1.index)('risks_detected_at_idx').on(table.detected_at),
}));
// =============================================================================
// Risk History
// =============================================================================
exports.riskHistory = (0, mysql_core_1.mysqlTable)('risk_history', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    risk_id: (0, mysql_core_1.varchar)('risk_id', { length: 36 })
        .notNull()
        .references(() => exports.risks.id),
    action: (0, mysql_core_1.varchar)('action', { length: 50 }).notNull(),
    actor_id: (0, mysql_core_1.varchar)('actor_id', { length: 36 }).references(() => exports.users.id),
    changes: (0, mysql_core_1.json)('changes').$type(),
    notes: (0, mysql_core_1.text)('notes'),
    timestamp: (0, mysql_core_1.timestamp)('timestamp').defaultNow().notNull(),
}, (table) => ({
    riskIdx: (0, mysql_core_1.index)('risk_history_risk_idx').on(table.risk_id),
    timestampIdx: (0, mysql_core_1.index)('risk_history_timestamp_idx').on(table.timestamp),
}));
// =============================================================================
// Audit Logs
// =============================================================================
exports.auditLogs = (0, mysql_core_1.mysqlTable)('audit_logs', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    tenant_id: (0, mysql_core_1.varchar)('tenant_id', { length: 36 })
        .notNull()
        .references(() => exports.tenants.id),
    actor_id: (0, mysql_core_1.varchar)('actor_id', { length: 36 }).references(() => exports.users.id),
    actor_email: (0, mysql_core_1.varchar)('actor_email', { length: 255 }),
    action: (0, mysql_core_1.varchar)('action', { length: 100 }).notNull(),
    resource_type: (0, mysql_core_1.varchar)('resource_type', { length: 50 }).notNull(),
    resource_id: (0, mysql_core_1.varchar)('resource_id', { length: 36 }),
    method: (0, mysql_core_1.varchar)('method', { length: 10 }),
    path: (0, mysql_core_1.varchar)('path', { length: 500 }),
    ip_address: (0, mysql_core_1.varchar)('ip_address', { length: 45 }),
    user_agent: (0, mysql_core_1.text)('user_agent'),
    request_body: (0, mysql_core_1.json)('request_body'),
    response_status: (0, mysql_core_1.int)('response_status'),
    changes: (0, mysql_core_1.json)('changes').$type(),
    event_hash: (0, mysql_core_1.varchar)('event_hash', { length: 64 }),
    anchor_id: (0, mysql_core_1.varchar)('anchor_id', { length: 36 }).references(() => exports.blockchainAnchors.id),
    timestamp: (0, mysql_core_1.timestamp)('timestamp').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, mysql_core_1.index)('audit_logs_tenant_idx').on(table.tenant_id),
    tenantTimestampIdx: (0, mysql_core_1.index)('audit_logs_tenant_timestamp_idx').on(table.tenant_id, table.timestamp),
    actionIdx: (0, mysql_core_1.index)('audit_logs_action_idx').on(table.action),
    actorIdx: (0, mysql_core_1.index)('audit_logs_actor_idx').on(table.actor_id),
    eventHashIdx: (0, mysql_core_1.index)('audit_logs_event_hash_idx').on(table.event_hash),
}));
// =============================================================================
// Blockchain Anchors
// =============================================================================
exports.blockchainAnchors = (0, mysql_core_1.mysqlTable)('blockchain_anchors', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    merkle_root: (0, mysql_core_1.varchar)('merkle_root', { length: 64 }).notNull(),
    tx_hash: (0, mysql_core_1.varchar)('tx_hash', { length: 66 }),
    block_number: (0, mysql_core_1.int)('block_number'),
    chain_id: (0, mysql_core_1.int)('chain_id'),
    event_count: (0, mysql_core_1.int)('event_count').notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', ['pending', 'confirmed', 'failed'])
        .default('pending')
        .notNull(),
    anchored_at: (0, mysql_core_1.timestamp)('anchored_at'),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    merkleRootIdx: (0, mysql_core_1.uniqueIndex)('blockchain_anchors_merkle_root_idx').on(table.merkle_root),
    txHashIdx: (0, mysql_core_1.index)('blockchain_anchors_tx_hash_idx').on(table.tx_hash),
    statusIdx: (0, mysql_core_1.index)('blockchain_anchors_status_idx').on(table.status),
}));
// =============================================================================
// Audit Log Proofs
// =============================================================================
exports.auditLogProofs = (0, mysql_core_1.mysqlTable)('audit_log_proofs', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    audit_log_id: (0, mysql_core_1.varchar)('audit_log_id', { length: 36 })
        .notNull()
        .references(() => exports.auditLogs.id),
    anchor_id: (0, mysql_core_1.varchar)('anchor_id', { length: 36 })
        .notNull()
        .references(() => exports.blockchainAnchors.id),
    leaf_hash: (0, mysql_core_1.varchar)('leaf_hash', { length: 64 }).notNull(),
    proof: (0, mysql_core_1.json)('proof').$type().notNull(),
    positions: (0, mysql_core_1.json)('positions').$type().notNull(),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    auditLogIdx: (0, mysql_core_1.uniqueIndex)('audit_log_proofs_audit_log_idx').on(table.audit_log_id),
    anchorIdx: (0, mysql_core_1.index)('audit_log_proofs_anchor_idx').on(table.anchor_id),
}));
// =============================================================================
// Sessions
// =============================================================================
exports.sessions = (0, mysql_core_1.mysqlTable)('sessions', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    user_id: (0, mysql_core_1.varchar)('user_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    token_hash: (0, mysql_core_1.varchar)('token_hash', { length: 64 }).notNull(),
    ip_address: (0, mysql_core_1.varchar)('ip_address', { length: 45 }),
    user_agent: (0, mysql_core_1.text)('user_agent'),
    expires_at: (0, mysql_core_1.timestamp)('expires_at').notNull(),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    revoked_at: (0, mysql_core_1.timestamp)('revoked_at'),
}, (table) => ({
    userIdx: (0, mysql_core_1.index)('sessions_user_idx').on(table.user_id),
    tokenHashIdx: (0, mysql_core_1.uniqueIndex)('sessions_token_hash_idx').on(table.token_hash),
    expiresAtIdx: (0, mysql_core_1.index)('sessions_expires_at_idx').on(table.expires_at),
}));
// =============================================================================
// API Keys
// =============================================================================
exports.apiKeys = (0, mysql_core_1.mysqlTable)('api_keys', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    tenant_id: (0, mysql_core_1.varchar)('tenant_id', { length: 36 })
        .notNull()
        .references(() => exports.tenants.id),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    key_hash: (0, mysql_core_1.varchar)('key_hash', { length: 64 }).notNull(),
    key_prefix: (0, mysql_core_1.varchar)('key_prefix', { length: 10 }).notNull(),
    permissions: (0, mysql_core_1.json)('permissions').$type(),
    last_used: (0, mysql_core_1.timestamp)('last_used'),
    expires_at: (0, mysql_core_1.timestamp)('expires_at'),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    revoked_at: (0, mysql_core_1.timestamp)('revoked_at'),
}, (table) => ({
    tenantIdx: (0, mysql_core_1.index)('api_keys_tenant_idx').on(table.tenant_id),
    keyHashIdx: (0, mysql_core_1.uniqueIndex)('api_keys_key_hash_idx').on(table.key_hash),
}));
// =============================================================================
// Notifications
// =============================================================================
exports.notifications = (0, mysql_core_1.mysqlTable)('notifications', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    user_id: (0, mysql_core_1.varchar)('user_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    type: (0, mysql_core_1.varchar)('type', { length: 50 }).notNull(),
    title_i18n_key: (0, mysql_core_1.varchar)('title_i18n_key', { length: 100 }).notNull(),
    body_i18n_key: (0, mysql_core_1.varchar)('body_i18n_key', { length: 100 }),
    data: (0, mysql_core_1.json)('data').$type(),
    read_at: (0, mysql_core_1.timestamp)('read_at'),
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdx: (0, mysql_core_1.index)('notifications_user_idx').on(table.user_id),
    userReadIdx: (0, mysql_core_1.index)('notifications_user_read_idx').on(table.user_id, table.read_at),
}));
//# sourceMappingURL=schema.js.map