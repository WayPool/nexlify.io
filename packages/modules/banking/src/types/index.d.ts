/**
 * Banking Module Types
 *
 * Type definitions for bank connections, transactions, and anomaly detection.
 */
import { z } from 'zod';
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
export type BankConnectionStatus = 'pending' | 'linked' | 'expired' | 'suspended' | 'error';
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
export type TransactionCategory = 'salary' | 'taxes' | 'utilities' | 'rent' | 'suppliers' | 'services' | 'equipment' | 'travel' | 'marketing' | 'insurance' | 'loans' | 'transfers' | 'fees' | 'refunds' | 'other';
export interface TransactionFlag {
    type: AnomalyType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    ruleId: string;
    detectedAt: string;
}
export type AnomalyType = 'unusual_amount' | 'unusual_time' | 'unusual_frequency' | 'unknown_counterparty' | 'high_risk_country' | 'round_amount' | 'structuring' | 'velocity' | 'dormant_activation' | 'category_mismatch' | 'duplicate' | 'manual_flag';
export interface AnomalyRule {
    id: string;
    name: string;
    description: string;
    type: AnomalyType;
    enabled: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    conditions: RuleCondition[];
    actions: RuleAction[];
    tenantId: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface RuleCondition {
    field: string;
    operator: ConditionOperator;
    value: unknown;
    unit?: string;
}
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'regex' | 'between';
export interface RuleAction {
    type: 'flag' | 'alert' | 'block' | 'notify';
    config: Record<string, unknown>;
}
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
    creditorAccount?: {
        iban: string;
    };
    debtorName?: string;
    debtorAccount?: {
        iban: string;
    };
    remittanceInformationUnstructured?: string;
    remittanceInformationStructured?: string;
    bankTransactionCode?: string;
    proprietaryBankTransactionCode?: string;
    internalTransactionId?: string;
}
export declare const CreateConnectionSchema: any;
export declare const UpdateAlertSchema: any;
export declare const CreateRuleSchema: any;
export type CreateConnectionInput = z.infer<typeof CreateConnectionSchema>;
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;
export type CreateRuleInput = z.infer<typeof CreateRuleSchema>;
//# sourceMappingURL=index.d.ts.map