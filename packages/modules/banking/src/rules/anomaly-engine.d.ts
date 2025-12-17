/**
 * Anomaly Detection Engine
 *
 * Analyzes transactions against a set of rules to detect
 * suspicious or unusual patterns.
 */
import type { Transaction, TransactionFlag, AnomalyRule, BankingAlert } from '../types/index.js';
export interface TransactionHistory {
    getTransactionsByAccount(accountId: string, days: number): Promise<Transaction[]>;
    getAverageAmount(accountId: string, direction: 'credit' | 'debit'): Promise<number>;
    getKnownCounterparties(accountId: string): Promise<string[]>;
    getTypicalHours(accountId: string): Promise<number[]>;
    getLastActivityDate(accountId: string): Promise<string | null>;
}
export interface AlertStore {
    createAlert(alert: Omit<BankingAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankingAlert>;
}
export declare class AnomalyEngine {
    private rules;
    private history;
    private alertStore;
    constructor(rules: AnomalyRule[], history: TransactionHistory, alertStore: AlertStore);
    /**
     * Analyze a single transaction for anomalies
     */
    analyzeTransaction(transaction: Transaction, tenantId: string): Promise<{
        flags: TransactionFlag[];
        score: number;
    }>;
    /**
     * Analyze multiple transactions (batch)
     */
    analyzeTransactions(transactions: Transaction[], tenantId: string): Promise<Map<string, {
        flags: TransactionFlag[];
        score: number;
    }>>;
    /**
     * Run built-in anomaly detectors
     */
    private runBuiltInDetectors;
    /**
     * Detect unusually large or small amounts compared to history
     */
    private detectUnusualAmount;
    /**
     * Detect transactions at unusual hours
     */
    private detectUnusualTime;
    /**
     * Detect transactions with unknown counterparties
     */
    private detectUnknownCounterparty;
    /**
     * Detect transactions involving high-risk countries
     */
    private detectHighRiskCountry;
    /**
     * Detect suspiciously round amounts
     */
    private detectRoundAmount;
    /**
     * Detect potential structuring (amounts just below reporting threshold)
     */
    private detectStructuring;
    /**
     * Detect sudden activity on dormant accounts
     */
    private detectDormantActivation;
    /**
     * Detect potential duplicate transactions
     */
    private detectDuplicate;
    /**
     * Run custom rules defined by tenant
     */
    private runCustomRules;
    /**
     * Evaluate a single rule against a transaction
     */
    private evaluateRule;
    /**
     * Evaluate a single condition
     */
    private evaluateCondition;
    /**
     * Get field value from transaction using dot notation
     */
    private getFieldValue;
    /**
     * Calculate overall anomaly score (0-100)
     */
    private calculateAnomalyScore;
    /**
     * Create alerts for high severity flags
     */
    private createAlertsIfNeeded;
    /**
     * Get human-readable alert title
     */
    private getAlertTitle;
}
/**
 * Create default anomaly rules
 */
export declare function getDefaultRules(): Omit<AnomalyRule, 'id' | 'createdAt' | 'updatedAt'>[];
/**
 * Create an anomaly engine instance
 */
export declare function createAnomalyEngine(rules: AnomalyRule[], history: TransactionHistory, alertStore: AlertStore): AnomalyEngine;
//# sourceMappingURL=anomaly-engine.d.ts.map