/**
 * Transaction Sync Service
 *
 * Handles synchronization of bank transactions from Nordigen
 * and stores them in the local database.
 */
import { format, subDays, parseISO } from 'date-fns';
export class TransactionSyncService {
    nordigen;
    store;
    constructor(nordigenClient, store) {
        this.nordigen = nordigenClient;
        this.store = store;
    }
    /**
     * Sync all accounts for a connection
     */
    async syncConnection(connectionId) {
        const connection = await this.store.getConnection(connectionId);
        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }
        if (connection.status !== 'linked') {
            throw new Error(`Connection ${connectionId} is not in linked status`);
        }
        const results = [];
        // First, refresh account list from Nordigen
        await this.refreshAccounts(connection);
        // Get all accounts for this connection
        const accounts = await this.store.getAccountsByConnection(connectionId);
        // Sync each account
        for (const account of accounts) {
            try {
                const result = await this.syncAccount(account);
                results.push(result);
            }
            catch (error) {
                results.push({
                    accountId: account.id,
                    newTransactions: 0,
                    updatedTransactions: 0,
                    errors: [error instanceof Error ? error.message : 'Unknown error'],
                    syncedAt: new Date().toISOString(),
                });
            }
        }
        // Update connection sync time
        await this.store.updateConnectionSyncTime(connectionId, new Date().toISOString());
        return results;
    }
    /**
     * Refresh account list from Nordigen
     */
    async refreshAccounts(connection) {
        const requisition = await this.nordigen.getRequisition(connection.requisitionId);
        for (const nordigenAccountId of requisition.accounts) {
            // Check if account already exists
            const existingAccount = connection.accounts.find((a) => a.externalId === nordigenAccountId);
            if (existingAccount)
                continue;
            // Get account details from Nordigen
            const accountMeta = await this.nordigen.getAccount(nordigenAccountId);
            const accountDetails = await this.nordigen.getAccountDetails(nordigenAccountId);
            const balances = await this.nordigen.getAccountBalances(nordigenAccountId);
            // Find the current balance
            const currentBalance = balances.balances.find((b) => b.balanceType === 'interimAvailable' || b.balanceType === 'expected');
            // Save new account
            await this.store.saveAccount({
                connectionId: connection.id,
                externalId: nordigenAccountId,
                iban: accountDetails.account.iban || accountMeta.iban,
                name: accountDetails.account.name || 'Cuenta Principal',
                ownerName: accountDetails.account.ownerName || accountMeta.owner_name,
                currency: accountDetails.account.currency || 'EUR',
                accountType: this.mapAccountType(accountDetails.account.cashAccountType),
                balance: currentBalance ? parseFloat(currentBalance.balanceAmount.amount) : 0,
                balanceUpdatedAt: currentBalance?.referenceDate || new Date().toISOString(),
                status: 'active',
            });
        }
    }
    /**
     * Sync transactions for a single account
     */
    async syncAccount(account) {
        const result = {
            accountId: account.id,
            newTransactions: 0,
            updatedTransactions: 0,
            errors: [],
            syncedAt: new Date().toISOString(),
        };
        try {
            // Determine date range
            const lastTransaction = await this.store.getLastTransaction(account.id);
            const dateFrom = lastTransaction
                ? format(parseISO(lastTransaction.bookingDate), 'yyyy-MM-dd')
                : format(subDays(new Date(), 90), 'yyyy-MM-dd'); // Default to 90 days
            const dateTo = format(new Date(), 'yyyy-MM-dd');
            // Fetch transactions from Nordigen
            const { transactions } = await this.nordigen.getAccountTransactions(account.externalId, dateFrom, dateTo);
            // Process booked transactions
            for (const nordigenTx of transactions.booked) {
                try {
                    const tx = this.mapTransaction(nordigenTx, account.id, 'booked');
                    const saved = await this.store.upsertTransaction(tx);
                    if (saved.createdAt === saved.updatedAt) {
                        result.newTransactions++;
                    }
                    else {
                        result.updatedTransactions++;
                    }
                }
                catch (error) {
                    result.errors.push(`Failed to process transaction ${nordigenTx.transactionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            // Process pending transactions
            for (const nordigenTx of transactions.pending) {
                try {
                    const tx = this.mapTransaction(nordigenTx, account.id, 'pending');
                    await this.store.upsertTransaction(tx);
                    result.newTransactions++;
                }
                catch (error) {
                    result.errors.push(`Failed to process pending transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            // Update account balance
            const balances = await this.nordigen.getAccountBalances(account.externalId);
            const currentBalance = balances.balances.find((b) => b.balanceType === 'interimAvailable' || b.balanceType === 'expected');
            if (currentBalance) {
                await this.store.updateAccountBalance(account.id, parseFloat(currentBalance.balanceAmount.amount), currentBalance.referenceDate);
            }
        }
        catch (error) {
            result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
        }
        return result;
    }
    /**
     * Map Nordigen transaction to internal format
     */
    mapTransaction(nordigenTx, accountId, status) {
        const amount = parseFloat(nordigenTx.transactionAmount.amount);
        const isCredit = amount > 0;
        // Determine counterparty
        const counterpartyName = isCredit
            ? nordigenTx.debtorName
            : nordigenTx.creditorName;
        const counterpartyIban = isCredit
            ? nordigenTx.debtorAccount?.iban
            : nordigenTx.creditorAccount?.iban;
        // Build description
        const description = nordigenTx.remittanceInformationUnstructured ||
            nordigenTx.remittanceInformationStructured ||
            counterpartyName ||
            'Sin descripcion';
        return {
            accountId,
            externalId: nordigenTx.transactionId || nordigenTx.internalTransactionId || crypto.randomUUID(),
            amount: Math.abs(amount),
            currency: nordigenTx.transactionAmount.currency,
            direction: isCredit ? 'credit' : 'debit',
            status,
            bookingDate: nordigenTx.bookingDate,
            valueDate: nordigenTx.valueDate || nordigenTx.bookingDate,
            description,
            merchantName: this.extractMerchantName(nordigenTx),
            merchantCategory: nordigenTx.bankTransactionCode || null,
            counterpartyName: counterpartyName || null,
            counterpartyIban: counterpartyIban || null,
            reference: nordigenTx.remittanceInformationStructured ||
                nordigenTx.remittanceInformationUnstructured ||
                null,
            category: this.categorizeTransaction(nordigenTx),
            metadata: {
                bankTransactionCode: nordigenTx.bankTransactionCode,
                proprietaryBankTransactionCode: nordigenTx.proprietaryBankTransactionCode,
            },
            anomalyScore: null,
            flags: [],
        };
    }
    /**
     * Extract merchant name from transaction
     */
    extractMerchantName(tx) {
        const amount = parseFloat(tx.transactionAmount.amount);
        const isCredit = amount > 0;
        // For debits, creditor is the merchant
        // For credits, debtor is the source
        return isCredit ? tx.debtorName || null : tx.creditorName || null;
    }
    /**
     * Auto-categorize transaction based on description and metadata
     */
    categorizeTransaction(tx) {
        const description = (tx.remittanceInformationUnstructured ||
            tx.creditorName ||
            tx.debtorName ||
            '').toLowerCase();
        // Simple keyword-based categorization
        const categoryKeywords = {
            salary: ['nomina', 'salario', 'sueldo', 'payroll'],
            taxes: ['hacienda', 'aeat', 'impuesto', 'iva', 'irpf', 'tax'],
            utilities: ['luz', 'agua', 'gas', 'electricidad', 'telefono', 'internet', 'vodafone', 'movistar', 'orange'],
            rent: ['alquiler', 'arrendamiento', 'rent'],
            suppliers: ['proveedor', 'supplier', 'factura', 'invoice'],
            services: ['consultoria', 'asesoria', 'servicio', 'service'],
            equipment: ['equipamiento', 'hardware', 'software', 'licencia'],
            travel: ['viaje', 'vuelo', 'hotel', 'renfe', 'iberia', 'booking'],
            marketing: ['publicidad', 'marketing', 'google ads', 'facebook', 'linkedin'],
            insurance: ['seguro', 'insurance', 'mutua', 'mapfre', 'axa'],
            loans: ['prestamo', 'credito', 'hipoteca', 'loan', 'mortgage'],
            transfers: ['transferencia', 'transfer', 'bizum'],
            fees: ['comision', 'fee', 'cargo', 'mantenimiento'],
            refunds: ['devolucion', 'refund', 'reembolso'],
            other: [],
        };
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some((kw) => description.includes(kw))) {
                return category;
            }
        }
        return null;
    }
    /**
     * Map Nordigen account type to internal type
     */
    mapAccountType(cashAccountType) {
        if (!cashAccountType)
            return 'checking';
        const typeMap = {
            CACC: 'checking',
            SVGS: 'savings',
            CARD: 'credit',
            LOAN: 'loan',
        };
        return typeMap[cashAccountType.toUpperCase()] || 'other';
    }
}
/**
 * Create a sync service instance
 */
export function createSyncService(nordigenClient, store) {
    return new TransactionSyncService(nordigenClient, store);
}
//# sourceMappingURL=sync-service.js.map