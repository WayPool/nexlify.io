/**
 * Nordigen/GoCardless Open Banking API Client
 *
 * Handles authentication and communication with the Nordigen API
 * for PSD2-compliant bank connections across Europe.
 */
import axios from 'axios';
const NORDIGEN_BASE_URL = 'https://bankaccountdata.gocardless.com/api/v2';
export class NordigenClient {
    config;
    client;
    accessToken = null;
    tokenExpiresAt = 0;
    refreshToken = null;
    constructor(config) {
        this.config = config;
        this.client = axios.create({
            baseURL: config.baseUrl || NORDIGEN_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
        // Add request interceptor for auth
        this.client.interceptors.request.use(async (request) => {
            if (request.url !== '/token/new/' && request.url !== '/token/refresh/') {
                const token = await this.getAccessToken();
                request.headers.Authorization = `Bearer ${token}`;
            }
            return request;
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                // Clear tokens on auth error
                this.accessToken = null;
                this.tokenExpiresAt = 0;
            }
            throw this.formatError(error);
        });
    }
    // ===========================================================================
    // Authentication
    // ===========================================================================
    /**
     * Get a valid access token, refreshing if necessary
     */
    async getAccessToken() {
        const now = Date.now();
        // Return cached token if still valid (with 60s buffer)
        if (this.accessToken && this.tokenExpiresAt > now + 60000) {
            return this.accessToken;
        }
        // Try to refresh if we have a refresh token
        if (this.refreshToken) {
            try {
                const tokens = await this.refreshAccessToken();
                return tokens.access;
            }
            catch {
                // Refresh failed, get new tokens
            }
        }
        // Get new tokens
        const tokens = await this.createToken();
        return tokens.access;
    }
    /**
     * Create new access and refresh tokens
     */
    async createToken() {
        const response = await this.client.post('/token/new/', {
            secret_id: this.config.secretId,
            secret_key: this.config.secretKey,
        });
        this.accessToken = response.data.access;
        this.refreshToken = response.data.refresh;
        this.tokenExpiresAt = Date.now() + response.data.access_expires * 1000;
        return response.data;
    }
    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken() {
        const response = await this.client.post('/token/refresh/', {
            refresh: this.refreshToken,
        });
        this.accessToken = response.data.access;
        this.tokenExpiresAt = Date.now() + response.data.access_expires * 1000;
        return response.data;
    }
    // ===========================================================================
    // Institutions
    // ===========================================================================
    /**
     * Get list of supported financial institutions
     */
    async getInstitutions(country) {
        const params = country ? { country } : {};
        const response = await this.client.get('/institutions/', { params });
        return response.data;
    }
    /**
     * Get a specific institution by ID
     */
    async getInstitution(institutionId) {
        const response = await this.client.get(`/institutions/${institutionId}/`);
        return response.data;
    }
    // ===========================================================================
    // End User Agreements
    // ===========================================================================
    /**
     * Create an end user agreement for data access
     */
    async createAgreement(institutionId, maxHistoricalDays = 90, accessValidForDays = 90, accessScope = ['balances', 'details', 'transactions']) {
        const response = await this.client.post('/agreements/enduser/', {
            institution_id: institutionId,
            max_historical_days: maxHistoricalDays,
            access_valid_for_days: accessValidForDays,
            access_scope: accessScope,
        });
        return response.data;
    }
    /**
     * Get an existing agreement
     */
    async getAgreement(agreementId) {
        const response = await this.client.get(`/agreements/enduser/${agreementId}/`);
        return response.data;
    }
    /**
     * Delete an agreement
     */
    async deleteAgreement(agreementId) {
        await this.client.delete(`/agreements/enduser/${agreementId}/`);
    }
    // ===========================================================================
    // Requisitions (Bank Connection Flow)
    // ===========================================================================
    /**
     * Create a requisition to initiate bank connection
     * Returns a link the user must visit to authorize access
     */
    async createRequisition(institutionId, redirectUrl, reference, agreementId, userLanguage = 'ES') {
        const response = await this.client.post('/requisitions/', {
            institution_id: institutionId,
            redirect: redirectUrl,
            reference,
            agreement: agreementId,
            user_language: userLanguage,
        });
        return response.data;
    }
    /**
     * Get requisition status and linked accounts
     */
    async getRequisition(requisitionId) {
        const response = await this.client.get(`/requisitions/${requisitionId}/`);
        return response.data;
    }
    /**
     * List all requisitions
     */
    async listRequisitions(limit = 100, offset = 0) {
        const response = await this.client.get('/requisitions/', {
            params: { limit, offset },
        });
        return response.data;
    }
    /**
     * Delete a requisition and revoke access
     */
    async deleteRequisition(requisitionId) {
        await this.client.delete(`/requisitions/${requisitionId}/`);
    }
    // ===========================================================================
    // Accounts
    // ===========================================================================
    /**
     * Get account metadata
     */
    async getAccount(accountId) {
        const response = await this.client.get(`/accounts/${accountId}/`);
        return response.data;
    }
    /**
     * Get account details (IBAN, owner name, etc.)
     */
    async getAccountDetails(accountId) {
        const response = await this.client.get(`/accounts/${accountId}/details/`);
        return response.data;
    }
    /**
     * Get account balances
     */
    async getAccountBalances(accountId) {
        const response = await this.client.get(`/accounts/${accountId}/balances/`);
        return response.data;
    }
    /**
     * Get account transactions
     */
    async getAccountTransactions(accountId, dateFrom, dateTo) {
        const params = {};
        if (dateFrom)
            params.date_from = dateFrom;
        if (dateTo)
            params.date_to = dateTo;
        const response = await this.client.get(`/accounts/${accountId}/transactions/`, { params });
        return response.data;
    }
    // ===========================================================================
    // Premium Endpoints (if available)
    // ===========================================================================
    /**
     * Get premium account details with enriched data
     */
    async getPremiumAccountDetails(accountId) {
        const response = await this.client.get(`/accounts/premium/${accountId}/details/`);
        return response.data;
    }
    /**
     * Get premium transactions with merchant data
     */
    async getPremiumTransactions(accountId, dateFrom, dateTo) {
        const params = {};
        if (dateFrom)
            params.date_from = dateFrom;
        if (dateTo)
            params.date_to = dateTo;
        const response = await this.client.get(`/accounts/premium/${accountId}/transactions/`, {
            params,
        });
        return response.data;
    }
    // ===========================================================================
    // Helpers
    // ===========================================================================
    /**
     * Format API errors for consistent handling
     */
    formatError(error) {
        if (error.response?.data) {
            const data = error.response.data;
            const message = data.detail ||
                data.summary ||
                data.message ||
                'Nordigen API error';
            const err = new Error(message);
            err.code = 'NORDIGEN_ERROR';
            err.status = error.response.status;
            return err;
        }
        return error;
    }
    /**
     * Check if the client is properly configured
     */
    async healthCheck() {
        try {
            await this.getAccessToken();
            return true;
        }
        catch {
            return false;
        }
    }
}
/**
 * Create a Nordigen client instance
 */
export function createNordigenClient(config) {
    return new NordigenClient(config);
}
//# sourceMappingURL=nordigen-client.js.map