/**
 * Core Constants
 *
 * All application constants are defined here.
 * See /docs/variables/registry.md for documentation.
 */
export declare const RISK_CATEGORIES: readonly ["legal", "payroll", "security", "ops", "finance", "compliance"];
export declare const RISK_SEVERITIES: readonly ["low", "medium", "high", "critical"];
export declare const RISK_STATUSES: readonly ["new", "acknowledged", "mitigated", "resolved", "false_positive"];
export declare const SEVERITY_WEIGHTS: Record<(typeof RISK_SEVERITIES)[number], number>;
export declare const SEVERITY_COLORS: Record<(typeof RISK_SEVERITIES)[number], string>;
export declare const PASSWORD_MIN_LENGTH = 12;
export declare const PASSWORD_REQUIRE_UPPERCASE = true;
export declare const PASSWORD_REQUIRE_LOWERCASE = true;
export declare const PASSWORD_REQUIRE_NUMBER = true;
export declare const PASSWORD_REQUIRE_SPECIAL = true;
export declare const MAX_LOGIN_ATTEMPTS = 5;
export declare const LOCKOUT_DURATION_MS: number;
export declare const SESSION_IDLE_TIMEOUT_MS: number;
export declare const SESSION_MAX_AGE_MS: number;
export declare const JWT_ALGORITHM: "HS256";
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const DEFAULT_SORT_ORDER: "desc";
export declare const AUDIT_RETENTION_DAYS = 2555;
export declare const AUDIT_HASH_ALGORITHM: "sha256";
export declare const MERKLE_TREE_MAX_LEAVES = 1024;
export declare const ANCHORING_BATCH_SIZE = 100;
export declare const ANCHORING_INTERVAL_MS: number;
export declare const PLANS: {
    readonly essential: {
        readonly id: "essential";
        readonly name_i18n_key: "core.plans.essential.name";
        readonly price_monthly_cents: 37500;
        readonly price_yearly_cents: 375000;
        readonly max_users: 10;
        readonly max_modules: 3;
        readonly features: {
            readonly risk_engine: true;
            readonly dashboard: true;
            readonly blockchain_anchoring: "standard";
            readonly ai_assistant: false;
            readonly custom_integrations: false;
            readonly sla: false;
        };
    };
    readonly professional: {
        readonly id: "professional";
        readonly name_i18n_key: "core.plans.professional.name";
        readonly price_monthly_cents: 235000;
        readonly price_yearly_cents: 2350000;
        readonly max_users: 50;
        readonly max_modules: 10;
        readonly features: {
            readonly risk_engine: true;
            readonly dashboard: true;
            readonly blockchain_anchoring: "advanced";
            readonly ai_assistant: true;
            readonly custom_integrations: false;
            readonly sla: false;
        };
    };
    readonly enterprise: {
        readonly id: "enterprise";
        readonly name_i18n_key: "core.plans.enterprise.name";
        readonly price_monthly_cents: 750000;
        readonly price_yearly_cents: 7500000;
        readonly max_users: -1;
        readonly max_modules: -1;
        readonly features: {
            readonly risk_engine: true;
            readonly dashboard: true;
            readonly blockchain_anchoring: "advanced";
            readonly ai_assistant: true;
            readonly custom_integrations: true;
            readonly sla: true;
        };
    };
};
export declare const ANNUAL_DISCOUNT_MONTHS = 2;
export declare const SYSTEM_ROLES: {
    readonly admin: {
        readonly name: "admin";
        readonly name_i18n_key: "core.roles.admin.name";
        readonly description_i18n_key: "core.roles.admin.description";
    };
    readonly auditor: {
        readonly name: "auditor";
        readonly name_i18n_key: "core.roles.auditor.name";
        readonly description_i18n_key: "core.roles.auditor.description";
    };
    readonly manager: {
        readonly name: "manager";
        readonly name_i18n_key: "core.roles.manager.name";
        readonly description_i18n_key: "core.roles.manager.description";
    };
    readonly viewer: {
        readonly name: "viewer";
        readonly name_i18n_key: "core.roles.viewer.name";
        readonly description_i18n_key: "core.roles.viewer.description";
    };
    readonly module_operator: {
        readonly name: "module_operator";
        readonly name_i18n_key: "core.roles.module_operator.name";
        readonly description_i18n_key: "core.roles.module_operator.description";
    };
};
export declare const EVENT_PREFIX_CORE = "core";
export declare const EVENT_PREFIX_MODULE = "module";
export declare const EVENT_PREFIX_AUDIT = "audit";
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const DEFAULT_LOCALE = "en";
export declare const SUPPORTED_LOCALES: readonly ["en", "es"];
export declare const FALLBACK_LOCALE = "en";
export declare const RATE_LIMIT_WINDOW_MS: number;
export declare const RATE_LIMIT_MAX_REQUESTS = 100;
export declare const RATE_LIMIT_AUTH_MAX_REQUESTS = 10;
//# sourceMappingURL=index.d.ts.map