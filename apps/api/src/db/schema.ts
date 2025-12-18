/**
 * Database schema using Drizzle ORM.
 * Matches the schema defined in docs/database/schema.md
 */

import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  decimal,
  json,
  mysqlEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

// =============================================================================
// Tenants
// =============================================================================

export const tenants = mysqlTable(
  'tenants',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    plan: mysqlEnum('plan', ['essential', 'professional', 'enterprise'])
      .default('essential')
      .notNull(),
    settings: json('settings').$type<Record<string, unknown>>(),
    stripe_customer_id: varchar('stripe_customer_id', { length: 100 }),
    stripe_subscription_id: varchar('stripe_subscription_id', { length: 100 }),
    status: mysqlEnum('status', ['active', 'suspended', 'cancelled'])
      .default('active')
      .notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    slugIdx: uniqueIndex('tenants_slug_idx').on(table.slug),
    stripeCustomerIdx: index('tenants_stripe_customer_idx').on(table.stripe_customer_id),
  })
);

// =============================================================================
// Users
// =============================================================================

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenant_id: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id),
    email: varchar('email', { length: 255 }).notNull(),
    password_hash: varchar('password_hash', { length: 255 }),
    name: varchar('name', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['admin', 'auditor', 'manager', 'viewer', 'module_operator'])
      .default('viewer')
      .notNull(),
    status: mysqlEnum('status', ['pending', 'active', 'inactive'])
      .default('pending')
      .notNull(),
    mfa_enabled: boolean('mfa_enabled').default(false).notNull(),
    mfa_secret: varchar('mfa_secret', { length: 255 }),
    google_id: varchar('google_id', { length: 255 }),
    last_login: timestamp('last_login'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    emailTenantIdx: uniqueIndex('users_email_tenant_idx').on(table.email, table.tenant_id),
    tenantIdx: index('users_tenant_idx').on(table.tenant_id),
    googleIdx: index('users_google_idx').on(table.google_id),
  })
);

// =============================================================================
// User Permissions
// =============================================================================

export const userPermissions = mysqlTable(
  'user_permissions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    user_id: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    permission: varchar('permission', { length: 100 }).notNull(),
    granted_at: timestamp('granted_at').defaultNow().notNull(),
    granted_by: varchar('granted_by', { length: 36 }).references(() => users.id),
  },
  (table) => ({
    userPermIdx: uniqueIndex('user_permissions_user_perm_idx').on(table.user_id, table.permission),
  })
);

// =============================================================================
// Modules
// =============================================================================

export const modules = mysqlTable(
  'modules',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    name_i18n_key: varchar('name_i18n_key', { length: 100 }).notNull(),
    description_i18n_key: varchar('description_i18n_key', { length: 100 }),
    version: varchar('version', { length: 20 }).notNull(),
    author: varchar('author', { length: 255 }),
    manifest: json('manifest').$type<Record<string, unknown>>().notNull(),
    status: mysqlEnum('status', ['available', 'deprecated', 'removed'])
      .default('available')
      .notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  }
);

// =============================================================================
// Tenant Modules
// =============================================================================

export const tenantModules = mysqlTable(
  'tenant_modules',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenant_id: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id),
    module_id: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => modules.id),
    status: mysqlEnum('status', ['active', 'inactive', 'error'])
      .default('active')
      .notNull(),
    config: json('config').$type<Record<string, unknown>>(),
    installed_at: timestamp('installed_at').defaultNow().notNull(),
    activated_at: timestamp('activated_at'),
    deactivated_at: timestamp('deactivated_at'),
  },
  (table) => ({
    tenantModuleIdx: uniqueIndex('tenant_modules_tenant_module_idx').on(
      table.tenant_id,
      table.module_id
    ),
  })
);

// =============================================================================
// Risks
// =============================================================================

export const risks = mysqlTable(
  'risks',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenant_id: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id),
    module_id: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => modules.id),
    detector_id: varchar('detector_id', { length: 100 }).notNull(),
    title_i18n_key: varchar('title_i18n_key', { length: 100 }).notNull(),
    description_i18n_key: varchar('description_i18n_key', { length: 100 }),
    severity: mysqlEnum('severity', ['low', 'medium', 'high', 'critical']).notNull(),
    status: mysqlEnum('status', [
      'new',
      'acknowledged',
      'mitigated',
      'resolved',
      'false_positive',
    ])
      .default('new')
      .notNull(),
    category: mysqlEnum('category', [
      'legal',
      'payroll',
      'security',
      'ops',
      'finance',
      'compliance',
    ]).notNull(),
    likelihood: decimal('likelihood', { precision: 3, scale: 2 }).notNull(),
    impact_eur: int('impact_eur').notNull(),
    entities: json('entities').$type<Array<{ type: string; id: string; name?: string }>>(),
    evidence: json('evidence').$type<Array<{ type: string; ref: string; label?: string }>>(),
    recommended_actions_i18n_key: varchar('recommended_actions_i18n_key', { length: 100 }),
    assigned_to: varchar('assigned_to', { length: 36 }).references(() => users.id),
    detected_at: timestamp('detected_at').defaultNow().notNull(),
    acknowledged_at: timestamp('acknowledged_at'),
    acknowledged_by: varchar('acknowledged_by', { length: 36 }).references(() => users.id),
    resolved_at: timestamp('resolved_at'),
    resolved_by: varchar('resolved_by', { length: 36 }).references(() => users.id),
    resolution_notes: text('resolution_notes'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    tenantIdx: index('risks_tenant_idx').on(table.tenant_id),
    tenantStatusIdx: index('risks_tenant_status_idx').on(table.tenant_id, table.status),
    tenantSeverityIdx: index('risks_tenant_severity_idx').on(table.tenant_id, table.severity),
    moduleIdx: index('risks_module_idx').on(table.module_id),
    detectedAtIdx: index('risks_detected_at_idx').on(table.detected_at),
  })
);

// =============================================================================
// Risk History
// =============================================================================

export const riskHistory = mysqlTable(
  'risk_history',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    risk_id: varchar('risk_id', { length: 36 })
      .notNull()
      .references(() => risks.id),
    action: varchar('action', { length: 50 }).notNull(),
    actor_id: varchar('actor_id', { length: 36 }).references(() => users.id),
    changes: json('changes').$type<Record<string, { from?: unknown; to?: unknown }>>(),
    notes: text('notes'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => ({
    riskIdx: index('risk_history_risk_idx').on(table.risk_id),
    timestampIdx: index('risk_history_timestamp_idx').on(table.timestamp),
  })
);

// =============================================================================
// Audit Logs
// =============================================================================

export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenant_id: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id),
    actor_id: varchar('actor_id', { length: 36 }).references(() => users.id),
    actor_email: varchar('actor_email', { length: 255 }),
    action: varchar('action', { length: 100 }).notNull(),
    resource_type: varchar('resource_type', { length: 50 }).notNull(),
    resource_id: varchar('resource_id', { length: 36 }),
    method: varchar('method', { length: 10 }),
    path: varchar('path', { length: 500 }),
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
    request_body: json('request_body'),
    response_status: int('response_status'),
    changes: json('changes').$type<Record<string, { from?: unknown; to?: unknown }>>(),
    event_hash: varchar('event_hash', { length: 64 }),
    anchor_id: varchar('anchor_id', { length: 36 }).references(() => blockchainAnchors.id),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('audit_logs_tenant_idx').on(table.tenant_id),
    tenantTimestampIdx: index('audit_logs_tenant_timestamp_idx').on(
      table.tenant_id,
      table.timestamp
    ),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    actorIdx: index('audit_logs_actor_idx').on(table.actor_id),
    eventHashIdx: index('audit_logs_event_hash_idx').on(table.event_hash),
  })
);

// =============================================================================
// Blockchain Anchors
// =============================================================================

export const blockchainAnchors = mysqlTable(
  'blockchain_anchors',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    merkle_root: varchar('merkle_root', { length: 64 }).notNull(),
    tx_hash: varchar('tx_hash', { length: 66 }),
    block_number: int('block_number'),
    chain_id: int('chain_id'),
    event_count: int('event_count').notNull(),
    status: mysqlEnum('status', ['pending', 'confirmed', 'failed'])
      .default('pending')
      .notNull(),
    anchored_at: timestamp('anchored_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    merkleRootIdx: uniqueIndex('blockchain_anchors_merkle_root_idx').on(table.merkle_root),
    txHashIdx: index('blockchain_anchors_tx_hash_idx').on(table.tx_hash),
    statusIdx: index('blockchain_anchors_status_idx').on(table.status),
  })
);

// =============================================================================
// Audit Log Proofs
// =============================================================================

export const auditLogProofs = mysqlTable(
  'audit_log_proofs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    audit_log_id: varchar('audit_log_id', { length: 36 })
      .notNull()
      .references(() => auditLogs.id),
    anchor_id: varchar('anchor_id', { length: 36 })
      .notNull()
      .references(() => blockchainAnchors.id),
    leaf_hash: varchar('leaf_hash', { length: 64 }).notNull(),
    proof: json('proof').$type<string[]>().notNull(),
    positions: json('positions').$type<('left' | 'right')[]>().notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    auditLogIdx: uniqueIndex('audit_log_proofs_audit_log_idx').on(table.audit_log_id),
    anchorIdx: index('audit_log_proofs_anchor_idx').on(table.anchor_id),
  })
);

// =============================================================================
// Sessions
// =============================================================================

export const sessions = mysqlTable(
  'sessions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    user_id: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    token_hash: varchar('token_hash', { length: 64 }).notNull(),
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    revoked_at: timestamp('revoked_at'),
  },
  (table) => ({
    userIdx: index('sessions_user_idx').on(table.user_id),
    tokenHashIdx: uniqueIndex('sessions_token_hash_idx').on(table.token_hash),
    expiresAtIdx: index('sessions_expires_at_idx').on(table.expires_at),
  })
);

// =============================================================================
// API Keys
// =============================================================================

export const apiKeys = mysqlTable(
  'api_keys',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenant_id: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 100 }).notNull(),
    key_hash: varchar('key_hash', { length: 64 }).notNull(),
    key_prefix: varchar('key_prefix', { length: 10 }).notNull(),
    permissions: json('permissions').$type<string[]>(),
    last_used: timestamp('last_used'),
    expires_at: timestamp('expires_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    revoked_at: timestamp('revoked_at'),
  },
  (table) => ({
    tenantIdx: index('api_keys_tenant_idx').on(table.tenant_id),
    keyHashIdx: uniqueIndex('api_keys_key_hash_idx').on(table.key_hash),
  })
);

// =============================================================================
// Notifications
// =============================================================================

export const notifications = mysqlTable(
  'notifications',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    user_id: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 50 }).notNull(),
    title_i18n_key: varchar('title_i18n_key', { length: 100 }).notNull(),
    body_i18n_key: varchar('body_i18n_key', { length: 100 }),
    data: json('data').$type<Record<string, unknown>>(),
    read_at: timestamp('read_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('notifications_user_idx').on(table.user_id),
    userReadIdx: index('notifications_user_read_idx').on(table.user_id, table.read_at),
  })
);

// =============================================================================
// Investor Inquiries
// =============================================================================

export const investorInquiries = mysqlTable(
  'investor_inquiries',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    first_name: varchar('first_name', { length: 100 }).notNull(),
    last_name: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    company: varchar('company', { length: 255 }),
    country: varchar('country', { length: 10 }).notNull(),
    investor_type: mysqlEnum('investor_type', [
      'institutional',
      'professional',
      'experienced',
      'high_net_worth',
      'family_office',
      'other',
    ]).notNull(),
    investment_range: mysqlEnum('investment_range', [
      '100k-250k',
      '250k-500k',
      '500k-1m',
      '1m+',
    ]),
    message: text('message'),
    is_qualified: boolean('is_qualified').default(false).notNull(),
    understands_risks: boolean('understands_risks').default(false).notNull(),
    understands_structure: boolean('understands_structure').default(false).notNull(),
    accepts_privacy: boolean('accepts_privacy').default(false).notNull(),
    accepts_contact: boolean('accepts_contact').default(false).notNull(),
    status: mysqlEnum('status', ['new', 'contacted', 'qualified', 'rejected', 'converted'])
      .default('new')
      .notNull(),
    notes: text('notes'),
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index('investor_inquiries_email_idx').on(table.email),
    statusIdx: index('investor_inquiries_status_idx').on(table.status),
    createdAtIdx: index('investor_inquiries_created_at_idx').on(table.created_at),
  })
);

// =============================================================================
// Data Room Access
// =============================================================================

export const dataRoomAccess = mysqlTable(
  'data_room_access',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    company: varchar('company', { length: 255 }),
    investor_inquiry_id: varchar('investor_inquiry_id', { length: 36 }).references(
      () => investorInquiries.id
    ),
    access_level: mysqlEnum('access_level', ['view', 'download', 'full'])
      .default('view')
      .notNull(),
    status: mysqlEnum('status', ['pending', 'active', 'revoked', 'expired'])
      .default('pending')
      .notNull(),
    invited_by: varchar('invited_by', { length: 255 }).notNull(),
    last_access: timestamp('last_access'),
    expires_at: timestamp('expires_at'),
    notes: text('notes'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('data_room_access_email_idx').on(table.email),
    statusIdx: index('data_room_access_status_idx').on(table.status),
    inquiryIdx: index('data_room_access_inquiry_idx').on(table.investor_inquiry_id),
  })
);

// =============================================================================
// Data Room Documents
// =============================================================================

export const dataRoomDocuments = mysqlTable(
  'data_room_documents',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    category: mysqlEnum('category', [
      'financials',
      'legal',
      'corporate',
      'technical',
      'market',
      'team',
      'other',
    ]).notNull(),
    file_path: varchar('file_path', { length: 500 }).notNull(),
    file_size: int('file_size'),
    mime_type: varchar('mime_type', { length: 100 }),
    version: varchar('version', { length: 20 }).default('1.0'),
    is_public: boolean('is_public').default(false).notNull(),
    sort_order: int('sort_order').default(0),
    uploaded_by: varchar('uploaded_by', { length: 255 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index('data_room_documents_category_idx').on(table.category),
    sortIdx: index('data_room_documents_sort_idx').on(table.sort_order),
  })
);

// =============================================================================
// Data Room Access Log
// =============================================================================

export const dataRoomAccessLog = mysqlTable(
  'data_room_access_log',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    access_id: varchar('access_id', { length: 36 })
      .notNull()
      .references(() => dataRoomAccess.id),
    document_id: varchar('document_id', { length: 36 }).references(() => dataRoomDocuments.id),
    action: mysqlEnum('action', ['login', 'view', 'download', 'logout']).notNull(),
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    accessIdx: index('data_room_access_log_access_idx').on(table.access_id),
    documentIdx: index('data_room_access_log_document_idx').on(table.document_id),
    createdAtIdx: index('data_room_access_log_created_at_idx').on(table.created_at),
  })
);
