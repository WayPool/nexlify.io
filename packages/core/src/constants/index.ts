/**
 * Core Constants
 *
 * All application constants are defined here.
 * See /docs/variables/registry.md for documentation.
 */

// =============================================================================
// Risk Constants
// =============================================================================

export const RISK_CATEGORIES = [
  'legal',
  'payroll',
  'security',
  'ops',
  'finance',
  'compliance',
] as const;

export const RISK_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export const RISK_STATUSES = [
  'new',
  'acknowledged',
  'mitigated',
  'resolved',
  'false_positive',
] as const;

export const SEVERITY_WEIGHTS: Record<(typeof RISK_SEVERITIES)[number], number> = {
  low: 1,
  medium: 3,
  high: 7,
  critical: 10,
};

export const SEVERITY_COLORS: Record<(typeof RISK_SEVERITIES)[number], string> = {
  low: '#22c55e', // green-500
  medium: '#eab308', // yellow-500
  high: '#f97316', // orange-500
  critical: '#ef4444', // red-500
};

// =============================================================================
// Authentication Constants
// =============================================================================

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_REQUIRE_UPPERCASE = true;
export const PASSWORD_REQUIRE_LOWERCASE = true;
export const PASSWORD_REQUIRE_NUMBER = true;
export const PASSWORD_REQUIRE_SPECIAL = true;

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const JWT_ALGORITHM = 'HS256' as const;

// =============================================================================
// Pagination Constants
// =============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SORT_ORDER = 'desc' as const;

// =============================================================================
// Audit Constants
// =============================================================================

export const AUDIT_RETENTION_DAYS = 2555; // 7 years
export const AUDIT_HASH_ALGORITHM = 'sha256' as const;
export const MERKLE_TREE_MAX_LEAVES = 1024;
export const ANCHORING_BATCH_SIZE = 100;
export const ANCHORING_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// =============================================================================
// Plan Constants
// =============================================================================

export const PLANS = {
  essential: {
    id: 'essential',
    name_i18n_key: 'core.plans.essential.name',
    price_monthly_cents: 37500, // 375€
    price_yearly_cents: 375000, // 3750€ (10 months)
    max_users: 10,
    max_modules: 3,
    features: {
      risk_engine: true,
      dashboard: true,
      blockchain_anchoring: 'standard',
      ai_assistant: false,
      custom_integrations: false,
      sla: false,
    },
  },
  professional: {
    id: 'professional',
    name_i18n_key: 'core.plans.professional.name',
    price_monthly_cents: 235000, // 2350€
    price_yearly_cents: 2350000, // 23500€ (10 months)
    max_users: 50,
    max_modules: 10,
    features: {
      risk_engine: true,
      dashboard: true,
      blockchain_anchoring: 'advanced',
      ai_assistant: true,
      custom_integrations: false,
      sla: false,
    },
  },
  enterprise: {
    id: 'enterprise',
    name_i18n_key: 'core.plans.enterprise.name',
    price_monthly_cents: 750000, // 7500€
    price_yearly_cents: 7500000, // 75000€ (10 months)
    max_users: -1, // unlimited
    max_modules: -1, // unlimited
    features: {
      risk_engine: true,
      dashboard: true,
      blockchain_anchoring: 'advanced',
      ai_assistant: true,
      custom_integrations: true,
      sla: true,
    },
  },
} as const;

export const ANNUAL_DISCOUNT_MONTHS = 2;

// =============================================================================
// System Roles
// =============================================================================

export const SYSTEM_ROLES = {
  admin: {
    name: 'admin',
    name_i18n_key: 'core.roles.admin.name',
    description_i18n_key: 'core.roles.admin.description',
  },
  auditor: {
    name: 'auditor',
    name_i18n_key: 'core.roles.auditor.name',
    description_i18n_key: 'core.roles.auditor.description',
  },
  manager: {
    name: 'manager',
    name_i18n_key: 'core.roles.manager.name',
    description_i18n_key: 'core.roles.manager.description',
  },
  viewer: {
    name: 'viewer',
    name_i18n_key: 'core.roles.viewer.name',
    description_i18n_key: 'core.roles.viewer.description',
  },
  module_operator: {
    name: 'module_operator',
    name_i18n_key: 'core.roles.module_operator.name',
    description_i18n_key: 'core.roles.module_operator.description',
  },
} as const;

// =============================================================================
// Event Prefixes
// =============================================================================

export const EVENT_PREFIX_CORE = 'core';
export const EVENT_PREFIX_MODULE = 'module';
export const EVENT_PREFIX_AUDIT = 'audit';

// =============================================================================
// HTTP Status Codes
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// =============================================================================
// Supported Locales
// =============================================================================

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export const FALLBACK_LOCALE = 'en';

// =============================================================================
// Rate Limiting
// =============================================================================

export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const RATE_LIMIT_AUTH_MAX_REQUESTS = 10;
