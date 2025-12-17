/**
 * Nordigen/GoCardless Open Banking API Client
 *
 * Handles authentication and communication with the Nordigen API
 * for PSD2-compliant bank connections across Europe.
 */
import type { NordigenConfig, NordigenTokenResponse, NordigenInstitution, NordigenRequisition, NordigenAccount, NordigenBalance, NordigenTransaction } from '../types/index.js';
export declare class NordigenClient {
    private config;
    private client;
    private accessToken;
    private tokenExpiresAt;
    private refreshToken;
    constructor(config: NordigenConfig);
    /**
     * Get a valid access token, refreshing if necessary
     */
    private getAccessToken;
    /**
     * Create new access and refresh tokens
     */
    createToken(): Promise<NordigenTokenResponse>;
    /**
     * Refresh access token using refresh token
     */
    private refreshAccessToken;
    /**
     * Get list of supported financial institutions
     */
    getInstitutions(country?: string): Promise<NordigenInstitution[]>;
    /**
     * Get a specific institution by ID
     */
    getInstitution(institutionId: string): Promise<NordigenInstitution>;
    /**
     * Create an end user agreement for data access
     */
    createAgreement(institutionId: string, maxHistoricalDays?: number, accessValidForDays?: number, accessScope?: string[]): Promise<{
        id: string;
        created: string;
        institution_id: string;
        max_historical_days: number;
    }>;
    /**
     * Get an existing agreement
     */
    getAgreement(agreementId: string): Promise<{
        id: string;
        created: string;
        institution_id: string;
        max_historical_days: number;
        access_valid_for_days: number;
        accepted: string | null;
    }>;
    /**
     * Delete an agreement
     */
    deleteAgreement(agreementId: string): Promise<void>;
    /**
     * Create a requisition to initiate bank connection
     * Returns a link the user must visit to authorize access
     */
    createRequisition(institutionId: string, redirectUrl: string, reference: string, agreementId?: string, userLanguage?: string): Promise<NordigenRequisition>;
    /**
     * Get requisition status and linked accounts
     */
    getRequisition(requisitionId: string): Promise<NordigenRequisition>;
    /**
     * List all requisitions
     */
    listRequisitions(limit?: number, offset?: number): Promise<{
        count: number;
        results: NordigenRequisition[];
    }>;
    /**
     * Delete a requisition and revoke access
     */
    deleteRequisition(requisitionId: string): Promise<void>;
    /**
     * Get account metadata
     */
    getAccount(accountId: string): Promise<NordigenAccount>;
    /**
     * Get account details (IBAN, owner name, etc.)
     */
    getAccountDetails(accountId: string): Promise<{
        account: {
            resourceId: string;
            iban: string;
            currency: string;
            ownerName: string;
            name: string;
            product: string;
            cashAccountType: string;
        };
    }>;
    /**
     * Get account balances
     */
    getAccountBalances(accountId: string): Promise<{
        balances: NordigenBalance[];
    }>;
    /**
     * Get account transactions
     */
    getAccountTransactions(accountId: string, dateFrom?: string, dateTo?: string): Promise<{
        transactions: {
            booked: NordigenTransaction[];
            pending: NordigenTransaction[];
        };
    }>;
    /**
     * Get premium account details with enriched data
     */
    getPremiumAccountDetails(accountId: string): Promise<unknown>;
    /**
     * Get premium transactions with merchant data
     */
    getPremiumTransactions(accountId: string, dateFrom?: string, dateTo?: string): Promise<unknown>;
    /**
     * Format API errors for consistent handling
     */
    private formatError;
    /**
     * Check if the client is properly configured
     */
    healthCheck(): Promise<boolean>;
}
/**
 * Create a Nordigen client instance
 */
export declare function createNordigenClient(config: NordigenConfig): NordigenClient;
//# sourceMappingURL=nordigen-client.d.ts.map