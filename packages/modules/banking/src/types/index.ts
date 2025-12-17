/**
 * Banking Module Types
 *
 * Type definitions for bank connections, transactions, and anomaly detection.
 */

import { z } from 'zod';

// =============================================================================
// Bank Connection Types
// =============================================================================

export interface BankInstitution {
  id: string;
  name: string;
  bic: string;
  logo: string;
  countries: string[];
  transactionTotalDays: number;
}

export interface BankConnection {
  id: string;
  tenantId: string;
  institutionId: string;
  institutionName: string;
  requisitionId: string;
  agreementId: string;
  status: BankConnectionStatus;
  accounts: BankAccount[];
  lastSyncAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type BankConnectionStatus =
  | 'pending' // Awaiting user authorization
  | 'linked' // Successfully connected
  | 'expired' // Connection expired, needs re-auth
  | 'suspended' // Temporarily suspended
  | 'error'; // Connection error

export interface BankAccount {
  id: string;
  connectionId: string;
  externalId: string;
  iban: string;
  name: string;
  ownerName: string;
  currency: string;
  accountType: AccountType;
  balance: number;
  balanceUpdatedAt: string;
  status: 'active' | 'inactive';
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'loan' | 'other';

// =============================================================================
// Transaction Types
// =============================================================================

export interface Transaction {
  id: string;
  accountId: string;
  externalId: string;
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  status: TransactionStatus;
  bookingDate: string;
  valueDate: string;
  description: string;
  merchantName: string | null;
  merchantCategory: string | null;
  counterpartyName: string | null;
  counterpartyIban: string | null;
  reference: string | null;
  category: TransactionCategory | null;
  metadata: Record<string, unknown>;
  anomalyScore: number | null;
  flags: TransactionFlag[];
  createdAt: string;
}

export type TransactionStatus = 'pending' | 'booked' | 'rejected';

export type TransactionCategory =
  | 'salary'
  | 'taxes'
  | 'utilities'
  | 'rent'
  | 'suppliers'
  | 'services'
  | 'equipment'
  | 'travel'
  | 'marketing'
  | 'insurance'
  | 'loans'
  | 'transfers'
  | 'fees'
  | 'refunds'
  | 'other';

export interface TransactionFlag {
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ruleId: string;
  detectedAt: string;
}

// =============================================================================
// Anomaly Detection Types
// =============================================================================

export type AnomalyType =
  | 'unusual_amount' // Transaction amount significantly differs from normal
  | 'unusual_time' // Transaction at unusual hour
  | 'unusual_frequency' // Too many transactions in short period
  | 'unknown_counterparty' // First time transacting with this party
  | 'high_risk_country' // Transaction to/from high-risk jurisdiction
  | 'round_amount' // Suspiciously round amounts (money laundering indicator)
  | 'structuring' // Multiple transactions just below reporting threshold
  | 'velocity' // Rapid movement of funds
  | 'dormant_activation' // Sudden activity on dormant account
  | 'category_mismatch' // Transaction doesn't match business profile
  | 'duplicate' // Possible duplicate transaction
  | 'manual_flag'; // Manually flagged by user

export interface AnomalyRule {
  id: string;
  name: string;
  description: string;
  type: AnomalyType;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: RuleCondition[];
  actions: RuleAction[];
  tenantId: string | null; // null = global rule
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  unit?: string;
}

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'regex'
  | 'between';

export interface RuleAction {
  type: 'flag' | 'alert' | 'block' | 'notify';
  config: Record<string, unknown>;
}

// =============================================================================
// Alert Types
// =============================================================================

export interface BankingAlert {
  id: string;
  tenantId: string;
  transactionId: string;
  accountId: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: AlertStatus;
  assignedTo: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

// =============================================================================
// Nordigen/GoCardless API Types
// =============================================================================

export interface NordigenConfig {
  secretId: string;
  secretKey: string;
  baseUrl?: string;
}

export interface NordigenTokenResponse {
  access: string;
  access_expires: number;
  refresh: string;
  refresh_expires: number;
}

export interface NordigenInstitution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
}

export interface NordigenRequisition {
  id: string;
  created: string;
  redirect: string;
  status: string;
  institution_id: string;
  agreement: string;
  reference: string;
  accounts: string[];
  link: string;
  ssn: string | null;
  account_selection: boolean;
  redirect_immediate: boolean;
}

export interface NordigenAccount {
  id: string;
  created: string;
  last_accessed: string;
  iban: string;
  institution_id: string;
  status: string;
  owner_name: string;
}

export interface NordigenBalance {
  balanceAmount: {
    amount: string;
    currency: string;
  };
  balanceType: string;
  referenceDate: string;
}

export interface NordigenTransaction {
  transactionId: string;
  bookingDate: string;
  valueDate: string;
  transactionAmount: {
    amount: string;
    currency: string;
  };
  creditorName?: string;
  creditorAccount?: { iban: string };
  debtorName?: string;
  debtorAccount?: { iban: string };
  remittanceInformationUnstructured?: string;
  remittanceInformationStructured?: string;
  bankTransactionCode?: string;
  proprietaryBankTransactionCode?: string;
  internalTransactionId?: string;
}

// =============================================================================
// Validation Schemas
// =============================================================================

export const CreateConnectionSchema = z.object({
  institutionId: z.string().min(1),
  redirectUrl: z.string().url(),
});

export const UpdateAlertSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'dismissed']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  resolution: z.string().max(1000).optional(),
});

export const CreateRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  type: z.enum([
    'unusual_amount',
    'unusual_time',
    'unusual_frequency',
    'unknown_counterparty',
    'high_risk_country',
    'round_amount',
    'structuring',
    'velocity',
    'dormant_activation',
    'category_mismatch',
    'duplicate',
    'manual_flag',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  enabled: z.boolean().default(true),
  conditions: z.array(
    z.object({
      field: z.string(),
      operator: z.enum([
        'eq',
        'neq',
        'gt',
        'gte',
        'lt',
        'lte',
        'contains',
        'not_contains',
        'in',
        'not_in',
        'regex',
        'between',
      ]),
      value: z.unknown(),
      unit: z.string().optional(),
    })
  ),
  actions: z.array(
    z.object({
      type: z.enum(['flag', 'alert', 'block', 'notify']),
      config: z.record(z.unknown()),
    })
  ),
});

export type CreateConnectionInput = z.infer<typeof CreateConnectionSchema>;
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;
export type CreateRuleInput = z.infer<typeof CreateRuleSchema>;
