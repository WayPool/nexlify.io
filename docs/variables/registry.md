# Variables Registry

This document tracks all configuration variables, constants, and feature flags in the system.

**IMPORTANT**: Before creating any new variable, check this registry to avoid duplicates.

---

## Environment Variables

### Core Application

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `NODE_ENV` | string | `development` | All | Environment mode | Low |
| `PORT` | number | `3000` | API | Server port | Low |
| `LOG_LEVEL` | string | `info` | All | Logging verbosity | Low |
| `API_BASE_URL` | string | - | Web | Backend API URL | Medium |

### Database

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `DATABASE_URL` | string | - | API/Worker | PostgreSQL connection string | **Critical** |
| `DATABASE_POOL_MIN` | number | `2` | API/Worker | Min pool connections | Low |
| `DATABASE_POOL_MAX` | number | `10` | API/Worker | Max pool connections | Low |
| `DATABASE_SSL` | boolean | `true` | API/Worker | Enable SSL | High |
| `REDIS_URL` | string | - | API/Worker | Redis connection string | High |

### Authentication

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `JWT_SECRET` | string | - | API | JWT signing secret | **Critical** |
| `JWT_EXPIRES_IN` | string | `1h` | API | Token expiration | Medium |
| `JWT_REFRESH_EXPIRES_IN` | string | `7d` | API | Refresh token expiration | Medium |
| `SESSION_SECRET` | string | - | API | Session encryption key | **Critical** |
| `MFA_ISSUER` | string | `Platform` | API | MFA app issuer name | Low |

### OAuth Providers

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `GOOGLE_CLIENT_ID` | string | - | API/Web | Google OAuth client ID | Medium |
| `GOOGLE_CLIENT_SECRET` | string | - | API | Google OAuth secret | **Critical** |
| `GOOGLE_REDIRECT_URI` | string | - | API | OAuth callback URL | Medium |

### Email (SMTP)

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `SMTP_HOST` | string | - | API/Worker | SMTP server host | Low |
| `SMTP_PORT` | number | `465` | API/Worker | SMTP port | Low |
| `SMTP_USER` | string | - | API/Worker | SMTP username | Medium |
| `SMTP_PASS` | string | - | API/Worker | SMTP password | **Critical** |
| `SMTP_FROM` | string | - | API/Worker | Default sender | Low |
| `SMTP_SECURE` | boolean | `true` | API/Worker | Use TLS | Medium |

### Stripe (Payments)

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `STRIPE_SECRET_KEY` | string | - | API | Stripe API secret | **Critical** |
| `STRIPE_PUBLISHABLE_KEY` | string | - | Web | Stripe public key | Low |
| `STRIPE_WEBHOOK_SECRET` | string | - | API | Webhook verification | High |

### Blockchain

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `BLOCKCHAIN_PROVIDER_URL` | string | - | API/Worker | RPC endpoint | Medium |
| `BLOCKCHAIN_PRIVATE_KEY` | string | - | Worker | Signing key | **Critical** |
| `BLOCKCHAIN_CONTRACT_ADDRESS` | string | - | API/Worker | Anchoring contract | Medium |
| `BLOCKCHAIN_NETWORK` | string | `polygon` | API/Worker | Network name | Low |
| `ANCHORING_BATCH_SIZE` | number | `100` | Worker | Events per batch | Low |
| `ANCHORING_INTERVAL_MS` | number | `3600000` | Worker | Batch interval (1h) | Low |

### AI/LLM

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `OPENAI_API_KEY` | string | - | API/Worker | OpenAI API key | **Critical** |
| `AI_MODEL` | string | `gpt-4` | API/Worker | Default model | Low |
| `AI_MAX_TOKENS` | number | `2000` | API/Worker | Max response tokens | Low |

### Feature Flags

| Name | Type | Default | Scope | Description | Security Impact |
|------|------|---------|-------|-------------|-----------------|
| `FEATURE_MFA_REQUIRED` | boolean | `false` | API | Require MFA for all users | Medium |
| `FEATURE_BLOCKCHAIN_ANCHORING` | boolean | `true` | Worker | Enable blockchain anchoring | Low |
| `FEATURE_AI_ASSISTANT` | boolean | `false` | API/Web | Enable AI assistant | Low |
| `FEATURE_MULTI_LANGUAGE` | boolean | `true` | Web | Enable language switcher | Low |

---

## Application Constants

### packages/core/src/constants/risk.ts

| Name | Value | Description |
|------|-------|-------------|
| `RISK_CATEGORIES` | `['legal', 'payroll', 'security', 'ops', 'finance', 'compliance']` | Valid risk categories |
| `RISK_SEVERITIES` | `['low', 'medium', 'high', 'critical']` | Severity levels |
| `RISK_STATUSES` | `['new', 'acknowledged', 'mitigated', 'resolved', 'false_positive']` | Risk states |
| `SEVERITY_WEIGHTS` | `{ low: 1, medium: 3, high: 7, critical: 10 }` | Scoring weights |

### packages/core/src/constants/auth.ts

| Name | Value | Description |
|------|-------|-------------|
| `PASSWORD_MIN_LENGTH` | `12` | Minimum password length |
| `PASSWORD_REQUIRE_UPPERCASE` | `true` | Require uppercase letter |
| `PASSWORD_REQUIRE_LOWERCASE` | `true` | Require lowercase letter |
| `PASSWORD_REQUIRE_NUMBER` | `true` | Require digit |
| `PASSWORD_REQUIRE_SPECIAL` | `true` | Require special character |
| `MAX_LOGIN_ATTEMPTS` | `5` | Before account lockout |
| `LOCKOUT_DURATION_MS` | `900000` | 15 minutes lockout |
| `SESSION_IDLE_TIMEOUT_MS` | `1800000` | 30 minutes idle |

### packages/core/src/constants/pagination.ts

| Name | Value | Description |
|------|-------|-------------|
| `DEFAULT_PAGE_SIZE` | `20` | Default items per page |
| `MAX_PAGE_SIZE` | `100` | Maximum items per page |
| `DEFAULT_SORT_ORDER` | `'desc'` | Default sort direction |

### packages/core/src/constants/audit.ts

| Name | Value | Description |
|------|-------|-------------|
| `AUDIT_RETENTION_DAYS` | `2555` | 7 years retention |
| `AUDIT_HASH_ALGORITHM` | `'sha256'` | Hashing algorithm |
| `MERKLE_TREE_LEAVES` | `1024` | Max leaves per tree |

---

## i18n Constants

### packages/i18n/src/constants.ts

| Name | Value | Description |
|------|-------|-------------|
| `DEFAULT_LOCALE` | `'en'` | Base language |
| `SUPPORTED_LOCALES` | `['en', 'es']` | Available languages |
| `FALLBACK_LOCALE` | `'en'` | Fallback when key missing |
| `NAMESPACE_SEPARATOR` | `'.'` | Key separator |

---

## UI Constants

### packages/ui/src/tokens/spacing.ts

| Name | Value | Description |
|------|-------|-------------|
| `SPACING_UNIT` | `4` | Base spacing unit (px) |
| `SPACING_XS` | `4` | 4px |
| `SPACING_SM` | `8` | 8px |
| `SPACING_MD` | `16` | 16px |
| `SPACING_LG` | `24` | 24px |
| `SPACING_XL` | `32` | 32px |
| `SPACING_2XL` | `48` | 48px |

### packages/ui/src/tokens/animation.ts

| Name | Value | Description |
|------|-------|-------------|
| `ANIMATION_DURATION_FAST` | `150` | Fast animations (ms) |
| `ANIMATION_DURATION_NORMAL` | `200` | Normal animations (ms) |
| `ANIMATION_DURATION_SLOW` | `250` | Slow animations (ms) |
| `ANIMATION_EASING` | `'ease-in-out'` | Default easing |

---

## Plan/Pricing Constants

### packages/core/src/constants/plans.ts

| Name | Value | Description |
|------|-------|-------------|
| `PLAN_ESSENTIAL_MONTHLY` | `37500` | 375€ in cents |
| `PLAN_PROFESSIONAL_MONTHLY` | `235000` | 2350€ in cents |
| `PLAN_ENTERPRISE_MONTHLY` | `750000` | 7500€ in cents |
| `ANNUAL_DISCOUNT_MONTHS` | `2` | Months free on annual |

---

## Adding New Variables

When adding a new variable:

1. **Check this file first** - Ensure it doesn't exist
2. **Add entry to this registry** - With all columns filled
3. **Document security impact**:
   - `Low`: No security implications
   - `Medium`: Could affect functionality if exposed
   - `High`: Could enable unauthorized access
   - `Critical`: Full system compromise if exposed
4. **Update `.env.example`** - If it's an env var
5. **Add validation** - In config loading code

---

*Last updated: 2024-12-15*
