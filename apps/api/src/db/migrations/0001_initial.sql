-- Platform Core Database Schema
-- Migration: 0001_initial
-- Description: Initial schema setup with all core tables

-- =============================================================================
-- Tenants
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  plan ENUM('essential', 'professional', 'enterprise') NOT NULL DEFAULT 'essential',
  settings JSON,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  status ENUM('active', 'suspended', 'cancelled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_tenants_slug (slug),
  INDEX idx_tenants_stripe_customer (stripe_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Users
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'auditor', 'manager', 'viewer', 'module_operator') NOT NULL DEFAULT 'viewer',
  status ENUM('pending', 'active', 'inactive') NOT NULL DEFAULT 'pending',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  google_id VARCHAR(255),
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE INDEX idx_users_email_tenant (email, tenant_id),
  INDEX idx_users_tenant (tenant_id),
  INDEX idx_users_google (google_id),

  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- User Permissions
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_permissions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by VARCHAR(36),

  UNIQUE INDEX idx_user_permissions_user_perm (user_id, permission),

  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Modules
-- =============================================================================

CREATE TABLE IF NOT EXISTS modules (
  id VARCHAR(50) PRIMARY KEY,
  name_i18n_key VARCHAR(100) NOT NULL,
  description_i18n_key VARCHAR(100),
  version VARCHAR(20) NOT NULL,
  author VARCHAR(255),
  manifest JSON NOT NULL,
  status ENUM('available', 'deprecated', 'removed') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Tenant Modules
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenant_modules (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  module_id VARCHAR(50) NOT NULL,
  status ENUM('active', 'inactive', 'error') NOT NULL DEFAULT 'active',
  config JSON,
  installed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP NULL,
  deactivated_at TIMESTAMP NULL,

  UNIQUE INDEX idx_tenant_modules_tenant_module (tenant_id, module_id),

  CONSTRAINT fk_tenant_modules_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_tenant_modules_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Blockchain Anchors (created before audit_logs for FK reference)
-- =============================================================================

CREATE TABLE IF NOT EXISTS blockchain_anchors (
  id VARCHAR(36) PRIMARY KEY,
  merkle_root VARCHAR(64) NOT NULL UNIQUE,
  tx_hash VARCHAR(66),
  block_number INT,
  chain_id INT,
  event_count INT NOT NULL,
  status ENUM('pending', 'confirmed', 'failed') NOT NULL DEFAULT 'pending',
  anchored_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_blockchain_anchors_tx_hash (tx_hash),
  INDEX idx_blockchain_anchors_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Risks
-- =============================================================================

CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  module_id VARCHAR(50) NOT NULL,
  detector_id VARCHAR(100) NOT NULL,
  title_i18n_key VARCHAR(100) NOT NULL,
  description_i18n_key VARCHAR(100),
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  status ENUM('new', 'acknowledged', 'mitigated', 'resolved', 'false_positive') NOT NULL DEFAULT 'new',
  category ENUM('legal', 'payroll', 'security', 'ops', 'finance', 'compliance') NOT NULL,
  likelihood DECIMAL(3,2) NOT NULL,
  impact_eur INT NOT NULL,
  entities JSON,
  evidence JSON,
  recommended_actions_i18n_key VARCHAR(100),
  assigned_to VARCHAR(36),
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP NULL,
  acknowledged_by VARCHAR(36),
  resolved_at TIMESTAMP NULL,
  resolved_by VARCHAR(36),
  resolution_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_risks_tenant (tenant_id),
  INDEX idx_risks_tenant_status (tenant_id, status),
  INDEX idx_risks_tenant_severity (tenant_id, severity),
  INDEX idx_risks_module (module_id),
  INDEX idx_risks_detected_at (detected_at),

  CONSTRAINT fk_risks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_risks_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  CONSTRAINT fk_risks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_risks_acknowledged_by FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_risks_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Risk History
-- =============================================================================

CREATE TABLE IF NOT EXISTS risk_history (
  id VARCHAR(36) PRIMARY KEY,
  risk_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id VARCHAR(36),
  changes JSON,
  notes TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_risk_history_risk (risk_id),
  INDEX idx_risk_history_timestamp (timestamp),

  CONSTRAINT fk_risk_history_risk FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
  CONSTRAINT fk_risk_history_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Audit Logs
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  actor_id VARCHAR(36),
  actor_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(36),
  method VARCHAR(10),
  path VARCHAR(500),
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body JSON,
  response_status INT,
  changes JSON,
  event_hash VARCHAR(64),
  anchor_id VARCHAR(36),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_audit_logs_tenant (tenant_id),
  INDEX idx_audit_logs_tenant_timestamp (tenant_id, timestamp),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_actor (actor_id),
  INDEX idx_audit_logs_event_hash (event_hash),

  CONSTRAINT fk_audit_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_logs_anchor FOREIGN KEY (anchor_id) REFERENCES blockchain_anchors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Audit Log Proofs
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_log_proofs (
  id VARCHAR(36) PRIMARY KEY,
  audit_log_id VARCHAR(36) NOT NULL UNIQUE,
  anchor_id VARCHAR(36) NOT NULL,
  leaf_hash VARCHAR(64) NOT NULL,
  proof JSON NOT NULL,
  positions JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_audit_log_proofs_anchor (anchor_id),

  CONSTRAINT fk_audit_log_proofs_audit_log FOREIGN KEY (audit_log_id) REFERENCES audit_logs(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_log_proofs_anchor FOREIGN KEY (anchor_id) REFERENCES blockchain_anchors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Sessions
-- =============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,

  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expires_at (expires_at),

  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- API Keys
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  key_prefix VARCHAR(10) NOT NULL,
  permissions JSON,
  last_used TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,

  INDEX idx_api_keys_tenant (tenant_id),

  CONSTRAINT fk_api_keys_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Notifications
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title_i18n_key VARCHAR(100) NOT NULL,
  body_i18n_key VARCHAR(100),
  data JSON,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_user_read (user_id, read_at),

  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
