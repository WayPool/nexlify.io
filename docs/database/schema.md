# Database Schema Documentation

This document defines the Core database schema. All tables follow the naming convention `core_*`.

**IMPORTANT**: Before modifying the schema, update this document first.

---

## Overview

- **Database**: PostgreSQL 15+ with TimescaleDB extension
- **Naming**: `core_*` for Core tables, `module_<id>_*` for modules
- **IDs**: UUID v4 for all primary keys
- **Timestamps**: `TIMESTAMPTZ` for all datetime fields
- **Soft Deletes**: `deleted_at` column (nullable)

---

## Core Tables

### core_tenants

Multi-tenant organization/company records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Tenant ID |
| `name` | VARCHAR(255) | NOT NULL | Company name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| `settings` | JSONB | DEFAULT '{}' | Tenant configuration |
| `plan_id` | VARCHAR(50) | NOT NULL, DEFAULT 'essential' | Subscription plan |
| `stripe_customer_id` | VARCHAR(255) | UNIQUE | Stripe customer |
| `stripe_subscription_id` | VARCHAR(255) | UNIQUE | Stripe subscription |
| `billing_email` | VARCHAR(255) | | Billing contact |
| `is_active` | BOOLEAN | DEFAULT true | Tenant active |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |

**Indexes**:
- `idx_tenants_slug` ON (slug)
- `idx_tenants_stripe_customer` ON (stripe_customer_id)
- `idx_tenants_active` ON (is_active) WHERE deleted_at IS NULL

**Events**:
- `core.tenant.created`
- `core.tenant.updated`
- `core.tenant.deleted`
- `core.tenant.plan_changed`

---

### core_users

User accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | User ID |
| `tenant_id` | UUID | FK core_tenants(id), NOT NULL | Owner tenant |
| `email` | VARCHAR(255) | NOT NULL | Email address |
| `password_hash` | VARCHAR(255) | | Bcrypt hash |
| `first_name` | VARCHAR(100) | | First name |
| `last_name` | VARCHAR(100) | | Last name |
| `avatar_url` | VARCHAR(500) | | Profile picture |
| `locale` | VARCHAR(10) | DEFAULT 'en' | Preferred language |
| `timezone` | VARCHAR(50) | DEFAULT 'UTC' | User timezone |
| `mfa_enabled` | BOOLEAN | DEFAULT false | MFA active |
| `mfa_secret` | VARCHAR(255) | | TOTP secret (encrypted) |
| `email_verified_at` | TIMESTAMPTZ | | Email verification |
| `last_login_at` | TIMESTAMPTZ | | Last successful login |
| `failed_login_attempts` | INTEGER | DEFAULT 0 | Failed logins |
| `locked_until` | TIMESTAMPTZ | | Account lockout |
| `is_active` | BOOLEAN | DEFAULT true | Account active |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |

**Indexes**:
- `idx_users_tenant` ON (tenant_id)
- `idx_users_email` ON (tenant_id, email) UNIQUE WHERE deleted_at IS NULL
- `idx_users_active` ON (tenant_id, is_active) WHERE deleted_at IS NULL

**Events**:
- `core.user.created`
- `core.user.updated`
- `core.user.deleted`
- `core.user.logged_in`
- `core.user.logged_out`
- `core.user.password_changed`
- `core.user.mfa_enabled`
- `core.user.mfa_disabled`

---

### core_roles

Role definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Role ID |
| `tenant_id` | UUID | FK core_tenants(id) | Owner tenant (NULL=system) |
| `name` | VARCHAR(100) | NOT NULL | Role name |
| `name_i18n_key` | VARCHAR(255) | | Display name key |
| `description_i18n_key` | VARCHAR(255) | | Description key |
| `is_system` | BOOLEAN | DEFAULT false | System-defined role |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**:
- `idx_roles_tenant` ON (tenant_id)
- `idx_roles_name` ON (tenant_id, name) UNIQUE

**System Roles** (tenant_id = NULL):
- `admin` - Full system access
- `auditor` - Read-only audit access
- `manager` - Manage assigned resources
- `viewer` - Read-only access
- `module_operator` - Module operations

---

### core_permissions

Permission definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Permission ID |
| `code` | VARCHAR(255) | NOT NULL, UNIQUE | Permission code |
| `name_i18n_key` | VARCHAR(255) | | Display name key |
| `description_i18n_key` | VARCHAR(255) | | Description key |
| `module_id` | VARCHAR(100) | | Module (NULL=core) |
| `resource` | VARCHAR(100) | NOT NULL | Resource type |
| `action` | VARCHAR(50) | NOT NULL | Action type |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes**:
- `idx_permissions_code` ON (code)
- `idx_permissions_module` ON (module_id)

**Example Codes**:
- `core:users:read`
- `core:users:create`
- `core:risks:manage`
- `module:payroll:employees:read`

---

### core_role_permissions

Role-permission assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `role_id` | UUID | FK core_roles(id), NOT NULL | Role |
| `permission_id` | UUID | FK core_permissions(id), NOT NULL | Permission |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Assignment time |

**Primary Key**: (role_id, permission_id)

---

### core_user_roles

User-role assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | FK core_users(id), NOT NULL | User |
| `role_id` | UUID | FK core_roles(id), NOT NULL | Role |
| `granted_by` | UUID | FK core_users(id) | Who granted |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Assignment time |

**Primary Key**: (user_id, role_id)

**Events**:
- `core.access.role_granted`
- `core.access.role_revoked`

---

### core_user_attributes

ABAC attributes for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Attribute ID |
| `user_id` | UUID | FK core_users(id), NOT NULL | User |
| `attribute_key` | VARCHAR(100) | NOT NULL | Attribute name |
| `attribute_value` | VARCHAR(255) | NOT NULL | Attribute value |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes**:
- `idx_user_attributes_user` ON (user_id)
- `idx_user_attributes_key` ON (user_id, attribute_key)

**Common Attributes**:
- `department`: hr, finance, legal, ops
- `country`: ES, US, AE
- `level`: junior, senior, manager, director
- `clearance`: public, internal, confidential, secret

---

### core_risk_findings

Normalized risk findings from all modules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Finding ID |
| `tenant_id` | UUID | FK core_tenants(id), NOT NULL | Owner tenant |
| `module_id` | VARCHAR(100) | NOT NULL | Source module |
| `category` | VARCHAR(50) | NOT NULL | Risk category |
| `severity` | VARCHAR(20) | NOT NULL | Severity level |
| `likelihood` | DECIMAL(3,2) | CHECK (0 <= likelihood <= 1) | Probability |
| `impact_eur` | DECIMAL(12,2) | | Estimated EUR impact |
| `title_i18n_key` | VARCHAR(255) | NOT NULL | Title key |
| `description_i18n_key` | VARCHAR(255) | NOT NULL | Description key |
| `evidence_refs` | JSONB | DEFAULT '[]' | Evidence links |
| `entities` | JSONB | DEFAULT '[]' | Affected entities |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'new' | Current status |
| `recommended_actions` | JSONB | DEFAULT '[]' | Action keys |
| `policy_tags` | TEXT[] | DEFAULT '{}' | ABAC tags |
| `metadata` | JSONB | DEFAULT '{}' | Extra data |
| `detected_at` | TIMESTAMPTZ | DEFAULT NOW() | Detection time |
| `acknowledged_at` | TIMESTAMPTZ | | Acknowledgment time |
| `acknowledged_by` | UUID | FK core_users(id) | Acknowledger |
| `resolved_at` | TIMESTAMPTZ | | Resolution time |
| `resolved_by` | UUID | FK core_users(id) | Resolver |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**:
- `idx_risks_tenant` ON (tenant_id)
- `idx_risks_module` ON (module_id)
- `idx_risks_category` ON (category)
- `idx_risks_severity` ON (severity)
- `idx_risks_status` ON (status)
- `idx_risks_detected` ON (tenant_id, detected_at DESC)
- `idx_risks_tags` ON (policy_tags) USING GIN

**Events**:
- `core.risk.created`
- `core.risk.updated`
- `core.risk.acknowledged`
- `core.risk.mitigated`
- `core.risk.resolved`
- `core.risk.escalated`

---

### core_audit_events

Immutable audit log.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Event ID |
| `tenant_id` | UUID | FK core_tenants(id) | Tenant (NULL=system) |
| `actor_id` | UUID | FK core_users(id) | Who performed |
| `actor_type` | VARCHAR(50) | NOT NULL | user/system/module |
| `action` | VARCHAR(255) | NOT NULL | Action performed |
| `target_type` | VARCHAR(100) | | Target entity type |
| `target_id` | UUID | | Target entity ID |
| `changes` | JSONB | DEFAULT '{}' | Before/after values |
| `metadata` | JSONB | DEFAULT '{}' | Extra context |
| `ip_address` | INET | | Client IP |
| `user_agent` | TEXT | | Client user agent |
| `event_hash` | VARCHAR(64) | NOT NULL | SHA-256 hash |
| `batch_id` | UUID | FK core_audit_batches(id) | Anchoring batch |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Event time |

**Indexes**:
- `idx_audit_tenant` ON (tenant_id)
- `idx_audit_actor` ON (actor_id)
- `idx_audit_action` ON (action)
- `idx_audit_target` ON (target_type, target_id)
- `idx_audit_created` ON (tenant_id, created_at DESC)
- `idx_audit_batch` ON (batch_id)

**TimescaleDB**: Convert to hypertable partitioned by `created_at`

---

### core_audit_batches

Blockchain anchoring batches.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Batch ID |
| `merkle_root` | VARCHAR(64) | NOT NULL | Merkle tree root |
| `event_count` | INTEGER | NOT NULL | Events in batch |
| `first_event_at` | TIMESTAMPTZ | NOT NULL | First event time |
| `last_event_at` | TIMESTAMPTZ | NOT NULL | Last event time |
| `blockchain_network` | VARCHAR(50) | | Network name |
| `blockchain_tx_hash` | VARCHAR(100) | | Transaction hash |
| `blockchain_block` | BIGINT | | Block number |
| `anchored_at` | TIMESTAMPTZ | | Anchoring time |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | Batch status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes**:
- `idx_batches_status` ON (status)
- `idx_batches_tx` ON (blockchain_tx_hash)

**Statuses**: `pending`, `anchoring`, `anchored`, `failed`

---

### core_modules

Installed modules registry.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(100) | PK | Module ID |
| `version` | VARCHAR(20) | NOT NULL | Installed version |
| `name_i18n_key` | VARCHAR(255) | NOT NULL | Name key |
| `manifest` | JSONB | NOT NULL | Full manifest |
| `is_active` | BOOLEAN | DEFAULT true | Module enabled |
| `installed_at` | TIMESTAMPTZ | DEFAULT NOW() | Installation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

---

### core_tenant_modules

Module activation per tenant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `tenant_id` | UUID | FK core_tenants(id), NOT NULL | Tenant |
| `module_id` | VARCHAR(100) | FK core_modules(id), NOT NULL | Module |
| `is_active` | BOOLEAN | DEFAULT true | Activation status |
| `config` | JSONB | DEFAULT '{}' | Tenant-specific config |
| `activated_at` | TIMESTAMPTZ | DEFAULT NOW() | Activation time |
| `deactivated_at` | TIMESTAMPTZ | | Deactivation time |

**Primary Key**: (tenant_id, module_id)

**Events**:
- `core.module.activated`
- `core.module.deactivated`

---

### core_sessions

User sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Session ID |
| `user_id` | UUID | FK core_users(id), NOT NULL | User |
| `token_hash` | VARCHAR(64) | NOT NULL, UNIQUE | Hashed token |
| `refresh_token_hash` | VARCHAR(64) | UNIQUE | Hashed refresh |
| `ip_address` | INET | | Client IP |
| `user_agent` | TEXT | | Client UA |
| `device_id` | VARCHAR(255) | | Device identifier |
| `last_activity_at` | TIMESTAMPTZ | DEFAULT NOW() | Last request |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Session expiry |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `revoked_at` | TIMESTAMPTZ | | Revocation time |

**Indexes**:
- `idx_sessions_user` ON (user_id)
- `idx_sessions_token` ON (token_hash)
- `idx_sessions_expires` ON (expires_at)

---

### core_subscriptions

Billing subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Subscription ID |
| `tenant_id` | UUID | FK core_tenants(id), NOT NULL, UNIQUE | Tenant |
| `plan_id` | VARCHAR(50) | NOT NULL | Plan identifier |
| `billing_cycle` | VARCHAR(20) | NOT NULL | monthly/yearly |
| `status` | VARCHAR(50) | NOT NULL | Subscription status |
| `stripe_subscription_id` | VARCHAR(255) | UNIQUE | Stripe sub ID |
| `current_period_start` | TIMESTAMPTZ | | Period start |
| `current_period_end` | TIMESTAMPTZ | | Period end |
| `cancel_at_period_end` | BOOLEAN | DEFAULT false | Cancellation pending |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**:
- `idx_subscriptions_tenant` ON (tenant_id)
- `idx_subscriptions_stripe` ON (stripe_subscription_id)

**Events**:
- `core.subscription.created`
- `core.subscription.updated`
- `core.subscription.canceled`

---

### core_module_licenses

Module licenses per tenant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | License ID |
| `tenant_id` | UUID | FK core_tenants(id), NOT NULL | Tenant |
| `module_id` | VARCHAR(100) | FK core_modules(id), NOT NULL | Module |
| `license_type` | VARCHAR(50) | NOT NULL | included/addon |
| `is_active` | BOOLEAN | DEFAULT true | License active |
| `limits` | JSONB | DEFAULT '{}' | Usage limits |
| `stripe_item_id` | VARCHAR(255) | | Stripe subscription item |
| `valid_from` | TIMESTAMPTZ | DEFAULT NOW() | Start date |
| `valid_until` | TIMESTAMPTZ | | End date |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**:
- `idx_licenses_tenant` ON (tenant_id)
- `idx_licenses_module` ON (module_id)
- `idx_licenses_active` ON (tenant_id, is_active) WHERE is_active = true

---

## Migrations

All migrations are located in `packages/core/migrations/` and follow the pattern:

```
YYYYMMDDHHMMSS_description.sql
```

Example:
```
20241215000001_initial_schema.sql
20241215000002_add_audit_batches.sql
```

---

## Module Tables

Module tables follow the pattern `module_<id>_*` and are documented in:
- `/docs/database/modules/<module_id>.md`

---

*Last updated: 2024-12-15*
