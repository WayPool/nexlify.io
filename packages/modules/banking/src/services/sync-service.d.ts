/**
 * Transaction Sync Service
 *
 * Handles synchronization of bank transactions from Nordigen
 * and stores them in the local database.
 */
import type { NordigenClient } from './nordigen-client.js';
import type { BankConnection, BankAccount, Transaction } from '../types/index.js';
export interface SyncResult {
    accountId: string;
    newTransactions: number;
    updatedTransactions: number;
    errors: string[];
    syncedAt: string;
}
export interface TransactionStore {
    getConnection(connectionId: string): Promise<BankConnection | null>;
    getAccount(accountId: string): Promise<BankAccount | null>;
    getAccountsByConnection(connectionId: string): Promise<BankAccount[]>;
    getLastTransaction(accountId: string): Promise<Transaction | null>;
    upsertTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
    updateAccountBalance(accountId: string, balance: number, updatedAt: string): Promise<void>;
    updateConnectionSyncTime(connectionId: string, syncedAt: string): Promise<void>;
    saveAccount(account: Omit<BankAccount, 'id'>): Promise<BankAccount>;
}
export declare class TransactionSyncService {
    private nordigen;
    private store;
    constructor(nordigenClient: NordigenClient, store: TransactionStore);
    /**
     * Sync all accounts for a connection
     */
    syncConnection(connectionId: string): Promise<SyncResult[]>;
    /**
     * Refresh account list from Nordigen
     */
    private refreshAccounts;
    /**
     * Sync transactions for a single account
     */
    syncAccount(account: BankAccount): Promise<SyncResult>;
    /**
     * Map Nordigen transaction to internal format
     */
    private mapTransaction;
    /**
     * Extract merchant name from transaction
     */
    private extractMerchantName;
    /**
     * Auto-categorize transaction based on description and metadata
     */
    private categorizeTransaction;
    /**
     * Map Nordigen account type to internal type
     */
    private mapAccountType;
}
/**
 * Create a sync service instance
 */
export declare function createSyncService(nordigenClient: NordigenClient, store: TransactionStore): TransactionSyncService;
//# sourceMappingURL=sync-service.d.ts.map