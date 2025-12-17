"use strict";
/**
 * Core Constants
 *
 * All application constants are defined here.
 * See /docs/variables/registry.md for documentation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_AUTH_MAX_REQUESTS = exports.RATE_LIMIT_MAX_REQUESTS = exports.RATE_LIMIT_WINDOW_MS = exports.FALLBACK_LOCALE = exports.SUPPORTED_LOCALES = exports.DEFAULT_LOCALE = exports.HTTP_STATUS = exports.EVENT_PREFIX_AUDIT = exports.EVENT_PREFIX_MODULE = exports.EVENT_PREFIX_CORE = exports.SYSTEM_ROLES = exports.ANNUAL_DISCOUNT_MONTHS = exports.PLANS = exports.ANCHORING_INTERVAL_MS = exports.ANCHORING_BATCH_SIZE = exports.MERKLE_TREE_MAX_LEAVES = exports.AUDIT_HASH_ALGORITHM = exports.AUDIT_RETENTION_DAYS = exports.DEFAULT_SORT_ORDER = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.JWT_ALGORITHM = exports.SESSION_MAX_AGE_MS = exports.SESSION_IDLE_TIMEOUT_MS = exports.LOCKOUT_DURATION_MS = exports.MAX_LOGIN_ATTEMPTS = exports.PASSWORD_REQUIRE_SPECIAL = exports.PASSWORD_REQUIRE_NUMBER = exports.PASSWORD_REQUIRE_LOWERCASE = exports.PASSWORD_REQUIRE_UPPERCASE = exports.PASSWORD_MIN_LENGTH = exports.SEVERITY_COLORS = exports.SEVERITY_WEIGHTS = exports.RISK_STATUSES = exports.RISK_SEVERITIES = exports.RISK_CATEGORIES = void 0;
// =============================================================================
// Risk Constants
// =============================================================================
exports.RISK_CATEGORIES = [
    'legal',
    'payroll',
    'security',
    'ops',
    'finance',
    'compliance',
];
exports.RISK_SEVERITIES = ['low', 'medium', 'high', 'critical'];
exports.RISK_STATUSES = [
    'new',
    'acknowledged',
    'mitigated',
    'resolved',
    'false_positive',
];
exports.SEVERITY_WEIGHTS = {
    low: 1,
    medium: 3,
    high: 7,
    critical: 10,
};
exports.SEVERITY_COLORS = {
    low: '#22c55e', // green-500
    medium: '#eab308', // yellow-500
    high: '#f97316', // orange-500
    critical: '#ef4444', // red-500
};
// =============================================================================
// Authentication Constants
// =============================================================================
exports.PASSWORD_MIN_LENGTH = 12;
exports.PASSWORD_REQUIRE_UPPERCASE = true;
exports.PASSWORD_REQUIRE_LOWERCASE = true;
exports.PASSWORD_REQUIRE_NUMBER = true;
exports.PASSWORD_REQUIRE_SPECIAL = true;
exports.MAX_LOGIN_ATTEMPTS = 5;
exports.LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
exports.SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
exports.SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
exports.JWT_ALGORITHM = 'HS256';
// =============================================================================
// Pagination Constants
// =============================================================================
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_SORT_ORDER = 'desc';
// =============================================================================
// Audit Constants
// =============================================================================
exports.AUDIT_RETENTION_DAYS = 2555; // 7 years
exports.AUDIT_HASH_ALGORITHM = 'sha256';
exports.MERKLE_TREE_MAX_LEAVES = 1024;
exports.ANCHORING_BATCH_SIZE = 100;
exports.ANCHORING_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
// =============================================================================
// Plan Constants
// =============================================================================
exports.PLANS = {
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
};
exports.ANNUAL_DISCOUNT_MONTHS = 2;
// =============================================================================
// System Roles
// =============================================================================
exports.SYSTEM_ROLES = {
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
};
// =============================================================================
// Event Prefixes
// =============================================================================
exports.EVENT_PREFIX_CORE = 'core';
exports.EVENT_PREFIX_MODULE = 'module';
exports.EVENT_PREFIX_AUDIT = 'audit';
// =============================================================================
// HTTP Status Codes
// =============================================================================
exports.HTTP_STATUS = {
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
};
// =============================================================================
// Supported Locales
// =============================================================================
exports.DEFAULT_LOCALE = 'en';
exports.SUPPORTED_LOCALES = ['en', 'es'];
exports.FALLBACK_LOCALE = 'en';
// =============================================================================
// Rate Limiting
// =============================================================================
exports.RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
exports.RATE_LIMIT_MAX_REQUESTS = 100;
exports.RATE_LIMIT_AUTH_MAX_REQUESTS = 10;
//# sourceMappingURL=index.js.map