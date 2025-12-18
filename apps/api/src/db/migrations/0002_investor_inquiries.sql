-- Platform Database Migration
-- Migration: 0002_investor_inquiries
-- Description: Table for investor contact form submissions

-- =============================================================================
-- Investor Inquiries
-- =============================================================================

CREATE TABLE IF NOT EXISTS investor_inquiries (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255),
  country VARCHAR(10) NOT NULL,
  investor_type ENUM('institutional', 'professional', 'experienced', 'high_net_worth', 'family_office', 'other') NOT NULL,
  investment_range ENUM('100k-250k', '250k-500k', '500k-1m', '1m+'),
  message TEXT,
  is_qualified BOOLEAN NOT NULL DEFAULT FALSE,
  understands_risks BOOLEAN NOT NULL DEFAULT FALSE,
  understands_structure BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_privacy BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_contact BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('new', 'contacted', 'qualified', 'rejected', 'converted') NOT NULL DEFAULT 'new',
  notes TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_investor_inquiries_email (email),
  INDEX idx_investor_inquiries_status (status),
  INDEX idx_investor_inquiries_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
