-- Platform Database Migration
-- Migration: 0003_data_room
-- Description: Tables for Data Room access management

-- =============================================================================
-- Data Room Access
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_room_access (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  investor_inquiry_id VARCHAR(36),
  access_level ENUM('view', 'download', 'full') NOT NULL DEFAULT 'view',
  status ENUM('pending', 'active', 'revoked', 'expired') NOT NULL DEFAULT 'pending',
  invited_by VARCHAR(255) NOT NULL,
  last_access TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE INDEX data_room_access_email_idx (email),
  INDEX data_room_access_status_idx (status),
  INDEX data_room_access_inquiry_idx (investor_inquiry_id),

  FOREIGN KEY (investor_inquiry_id) REFERENCES investor_inquiries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Data Room Documents
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_room_documents (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('financials', 'legal', 'corporate', 'technical', 'market', 'team', 'other') NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  version VARCHAR(20) DEFAULT '1.0',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX data_room_documents_category_idx (category),
  INDEX data_room_documents_sort_idx (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Data Room Access Log
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_room_access_log (
  id VARCHAR(36) PRIMARY KEY,
  access_id VARCHAR(36) NOT NULL,
  document_id VARCHAR(36),
  action ENUM('login', 'view', 'download', 'logout') NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX data_room_access_log_access_idx (access_id),
  INDEX data_room_access_log_document_idx (document_id),
  INDEX data_room_access_log_created_at_idx (created_at),

  FOREIGN KEY (access_id) REFERENCES data_room_access(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES data_room_documents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
