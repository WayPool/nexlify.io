# Naming Conventions

This document defines all naming conventions for the project. **Read before creating any file.**

## File & Folder Naming

| Type | Convention | Example |
|------|------------|---------|
| Folders | `kebab-case` | `risk-engine`, `audit-log` |
| TypeScript/JavaScript files | `kebab-case` | `risk-finding.ts`, `event-bus.ts` |
| React components | `PascalCase.tsx` | `RiskCard.tsx`, `DataTable.tsx` |
| Test files | `*.test.ts` / `*.spec.ts` | `risk-engine.test.ts` |
| Config files | `kebab-case` | `tsconfig.json`, `tailwind.config.ts` |

## Code Naming

| Type | Convention | Example |
|------|------------|---------|
| Classes | `PascalCase` | `RiskEngine`, `EventBus` |
| Interfaces | `PascalCase` (no `I` prefix) | `RiskFinding`, `Module` |
| Types | `PascalCase` | `RiskSeverity`, `TenantId` |
| Functions | `camelCase` | `calculateRiskScore`, `emitEvent` |
| Variables | `camelCase` | `riskScore`, `tenantId` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_LOCALE` |
| Enums | `PascalCase` | `RiskSeverity`, `RiskCategory` |
| Enum values | `snake_case` | `RiskSeverity.critical`, `RiskCategory.legal` |

## Database Naming

| Type | Convention | Example |
|------|------------|---------|
| Core tables | `core_*` | `core_tenants`, `core_users`, `core_risk_findings` |
| Module tables | `module_<id>_*` | `module_payroll_employees`, `module_legal_cases` |
| Columns | `snake_case` | `tenant_id`, `created_at`, `risk_score` |
| Primary keys | `id` (UUID) | `id` |
| Foreign keys | `<entity>_id` | `tenant_id`, `user_id` |
| Timestamps | `*_at` | `created_at`, `updated_at`, `deleted_at` |
| Boolean columns | `is_*` / `has_*` | `is_active`, `has_access` |

## Events Naming

| Scope | Pattern | Example |
|-------|---------|---------|
| Core events | `core.<domain>.<action>` | `core.risk.created`, `core.user.logged_in` |
| Module events | `module.<id>.<action>` | `module.payroll.employee_added` |
| Audit events | `audit.<domain>.<action>` | `audit.access.granted`, `audit.export.completed` |

### Event Actions (verbs)

- `created`, `updated`, `deleted`
- `started`, `completed`, `failed`
- `logged_in`, `logged_out`
- `granted`, `revoked`
- `detected`, `resolved`, `escalated`

## i18n Keys Naming

| Scope | Pattern | Example |
|-------|---------|---------|
| Core UI | `core.<section>.<feature>.<label>` | `core.dashboard.risks.title` |
| Module UI | `modules.<id>.<feature>.<label>` | `modules.payroll.employees.add_button` |
| Errors | `errors.<scope>.<code>` | `errors.auth.invalid_credentials` |
| Common | `common.<label>` | `common.save`, `common.cancel` |
| Validation | `validation.<field>.<rule>` | `validation.email.required` |

## API Endpoints Naming

| Type | Pattern | Example |
|------|---------|---------|
| REST resources | `/api/<version>/<resource>` | `/api/v1/risks`, `/api/v1/tenants` |
| Module endpoints | `/api/<version>/modules/<id>/<resource>` | `/api/v1/modules/payroll/employees` |
| Actions | `POST /api/v1/<resource>/<id>/<action>` | `POST /api/v1/risks/123/acknowledge` |

## Permissions Naming

| Type | Pattern | Example |
|------|---------|---------|
| Core permissions | `core:<resource>:<action>` | `core:risks:read`, `core:users:create` |
| Module permissions | `module:<id>:<resource>:<action>` | `module:payroll:employees:delete` |

## Roles Naming

Standard roles (non-exhaustive):

- `admin` - Full system access
- `auditor` - Read-only access to all data including audit logs
- `manager` - Manage resources within assigned scope
- `viewer` - Read-only access to assigned resources
- `module_operator` - Operate specific module functions

## Git Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Branches | `<type>/<short-description>` | `feat/risk-engine`, `fix/auth-flow` |
| Commits | `<type>(<scope>): <description>` | `feat(core): add risk engine`, `fix(auth): resolve token refresh` |

### Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructure
- `test` - Adding tests
- `chore` - Maintenance

---

*Last updated: 2024-12-15*
