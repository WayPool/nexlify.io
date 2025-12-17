"use strict";
/**
 * Banking Module Routes
 *
 * API endpoints for bank connections, transactions, and anomaly detection.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankingRoutes = void 0;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
exports.bankingRoutes = (0, express_1.Router)();
// Apply authentication to all banking routes
exports.bankingRoutes.use(auth_js_1.authMiddleware);
// Mock data stores
const connections = new Map();
const transactions = new Map();
const alerts = new Map();
// =============================================================================
// Institution Endpoints
// =============================================================================
/**
 * GET /api/banking/institutions
 * List available banks for connection
 */
exports.bankingRoutes.get('/institutions', async (req, res, next) => {
    try {
        const country = req.query.country || 'ES';
        // Mock Spanish banks
        const institutions = [
            {
                id: 'SANDBOXFINANCE_SFIN0000',
                name: 'Sandbox Finance',
                bic: 'SFIN0000',
                logo: 'https://cdn.nordigen.com/ais/SANDBOXFINANCE_SFIN0000.png',
                countries: ['ES'],
                transactionTotalDays: 730,
            },
            {
                id: 'BBVA_BBVAESMM',
                name: 'BBVA',
                bic: 'BBVAESMM',
                logo: 'https://cdn.nordigen.com/ais/BBVA_BBVAESMM.png',
                countries: ['ES'],
                transactionTotalDays: 730,
            },
            {
                id: 'SANTANDER_BSCHESMM',
                name: 'Banco Santander',
                bic: 'BSCHESMM',
                logo: 'https://cdn.nordigen.com/ais/SANTANDER_BSCHESMM.png',
                countries: ['ES'],
                transactionTotalDays: 730,
            },
            {
                id: 'CAIXABANK_CAIXESBB',
                name: 'CaixaBank',
                bic: 'CAIXESBB',
                logo: 'https://cdn.nordigen.com/ais/CAIXABANK_CAIXESBB.png',
                countries: ['ES'],
                transactionTotalDays: 730,
            },
            {
                id: 'SABADELL_BSABESBB',
                name: 'Banco Sabadell',
                bic: 'BSABESBB',
                logo: 'https://cdn.nordigen.com/ais/SABADELL_BSABESBB.png',
                countries: ['ES'],
                transactionTotalDays: 730,
            },
            {
                id: 'ING_INGDESM',
                name: 'ING',
                bic: 'INGDESM',
                logo: 'https://cdn.nordigen.com/ais/ING_INGDESM.png',
                countries: ['ES'],
                transactionTotalDays: 730,
            },
        ].filter((i) => i.countries.includes(country));
        res.json({ institutions });
    }
    catch (error) {
        next(error);
    }
});
// =============================================================================
// Connection Endpoints
// =============================================================================
/**
 * POST /api/banking/connections
 * Initiate bank connection
 */
exports.bankingRoutes.post('/connections', async (req, res, next) => {
    try {
        const { institutionId, redirectUrl } = req.body;
        const tenantId = req.user.tenant_id;
        if (!institutionId || !redirectUrl) {
            return res.status(400).json({ error: 'institutionId and redirectUrl are required' });
        }
        // In production, this would call Nordigen API
        const connectionId = `conn_${Date.now()}`;
        const requisitionId = `req_${Date.now()}`;
        const connection = {
            id: connectionId,
            tenantId,
            institutionId,
            institutionName: institutionId.split('_')[0],
            requisitionId,
            status: 'pending',
            accounts: [],
            lastSyncAt: null,
            createdAt: new Date().toISOString(),
        };
        connections.set(connectionId, connection);
        // Generate authorization link (in production from Nordigen)
        const authLink = `https://ob.nordigen.com/psd2/start/${requisitionId}/${institutionId}`;
        res.status(201).json({
            connection,
            authorizationUrl: authLink,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/banking/connections
 * List all bank connections for tenant
 */
exports.bankingRoutes.get('/connections', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const tenantConnections = Array.from(connections.values())
            .filter((c) => c.tenantId === tenantId);
        res.json({ connections: tenantConnections });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/banking/connections/:id
 * Get connection details
 */
exports.bankingRoutes.get('/connections/:id', async (req, res, next) => {
    try {
        const connection = connections.get(req.params.id);
        if (!connection || connection.tenantId !== req.user.tenant_id) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        res.json({ connection });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/banking/connections/:id/callback
 * Handle OAuth callback from bank
 */
exports.bankingRoutes.post('/connections/:id/callback', async (req, res, next) => {
    try {
        const connection = connections.get(req.params.id);
        if (!connection || connection.tenantId !== req.user.tenant_id) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        // Simulate successful authorization
        connection.status = 'linked';
        connection.accounts = [
            {
                id: `acc_${Date.now()}`,
                iban: 'ES9121000418450200051332',
                name: 'Cuenta Corriente Empresas',
                balance: 45892.34,
                currency: 'EUR',
            },
        ];
        connection.lastSyncAt = new Date().toISOString();
        // Generate some mock transactions
        generateMockTransactions(connection.accounts[0].id, req.user.tenant_id);
        res.json({ connection });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/banking/connections/:id/sync
 * Trigger manual sync of transactions
 */
exports.bankingRoutes.post('/connections/:id/sync', async (req, res, next) => {
    try {
        const connection = connections.get(req.params.id);
        if (!connection || connection.tenantId !== req.user.tenant_id) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        if (connection.status !== 'linked') {
            return res.status(400).json({ error: 'Connection is not active' });
        }
        // Simulate sync
        connection.lastSyncAt = new Date().toISOString();
        res.json({
            message: 'Sync completed',
            lastSyncAt: connection.lastSyncAt,
            newTransactions: Math.floor(Math.random() * 5),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/banking/connections/:id
 * Disconnect bank account
 */
exports.bankingRoutes.delete('/connections/:id', async (req, res, next) => {
    try {
        const connection = connections.get(req.params.id);
        if (!connection || connection.tenantId !== req.user.tenant_id) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        connections.delete(req.params.id);
        res.json({ message: 'Connection deleted' });
    }
    catch (error) {
        next(error);
    }
});
// =============================================================================
// Transaction Endpoints
// =============================================================================
/**
 * GET /api/banking/transactions
 * List transactions with filtering
 */
exports.bankingRoutes.get('/transactions', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const { accountId, dateFrom, dateTo, minAmount, maxAmount, direction, flagged, page = '1', limit = '50', } = req.query;
        let txList = Array.from(transactions.values());
        // Filter by account
        if (accountId) {
            txList = txList.filter((t) => t.accountId === accountId);
        }
        // Filter by date range
        if (dateFrom) {
            txList = txList.filter((t) => t.bookingDate >= dateFrom);
        }
        if (dateTo) {
            txList = txList.filter((t) => t.bookingDate <= dateTo);
        }
        // Filter by amount
        if (minAmount) {
            txList = txList.filter((t) => t.amount >= parseFloat(minAmount));
        }
        if (maxAmount) {
            txList = txList.filter((t) => t.amount <= parseFloat(maxAmount));
        }
        // Filter by direction
        if (direction) {
            txList = txList.filter((t) => t.direction === direction);
        }
        // Filter flagged only
        if (flagged === 'true') {
            txList = txList.filter((t) => t.flags.length > 0);
        }
        // Sort by date descending
        txList.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const start = (pageNum - 1) * limitNum;
        const paginatedTxs = txList.slice(start, start + limitNum);
        res.json({
            transactions: paginatedTxs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: txList.length,
                totalPages: Math.ceil(txList.length / limitNum),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/banking/transactions/:id
 * Get transaction details
 */
exports.bankingRoutes.get('/transactions/:id', async (req, res, next) => {
    try {
        const transaction = transactions.get(req.params.id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ transaction });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/banking/transactions/:id/flag
 * Manually flag a transaction
 */
exports.bankingRoutes.post('/transactions/:id/flag', async (req, res, next) => {
    try {
        const transaction = transactions.get(req.params.id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        const { reason } = req.body;
        transaction.flags.push({
            type: 'manual_flag',
            severity: 'medium',
            message: reason || 'Marcado manualmente para revision',
        });
        res.json({ transaction });
    }
    catch (error) {
        next(error);
    }
});
// =============================================================================
// Alert Endpoints
// =============================================================================
/**
 * GET /api/banking/alerts
 * List alerts
 */
exports.bankingRoutes.get('/alerts', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const { status, severity, page = '1', limit = '20' } = req.query;
        let alertList = Array.from(alerts.values())
            .filter((a) => a.tenantId === tenantId);
        if (status) {
            alertList = alertList.filter((a) => a.status === status);
        }
        if (severity) {
            alertList = alertList.filter((a) => a.severity === severity);
        }
        // Sort by creation date descending
        alertList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const start = (pageNum - 1) * limitNum;
        const paginatedAlerts = alertList.slice(start, start + limitNum);
        res.json({
            alerts: paginatedAlerts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: alertList.length,
                totalPages: Math.ceil(alertList.length / limitNum),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/banking/alerts/:id
 * Update alert status
 */
exports.bankingRoutes.patch('/alerts/:id', async (req, res, next) => {
    try {
        const alert = alerts.get(req.params.id);
        if (!alert || alert.tenantId !== req.user.tenant_id) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        const { status, resolution } = req.body;
        if (status)
            alert.status = status;
        if (resolution)
            alert.resolution = resolution;
        res.json({ alert });
    }
    catch (error) {
        next(error);
    }
});
// =============================================================================
// Analytics Endpoints
// =============================================================================
/**
 * GET /api/banking/analytics/summary
 * Get banking analytics summary
 */
exports.bankingRoutes.get('/analytics/summary', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const tenantConnections = Array.from(connections.values())
            .filter((c) => c.tenantId === tenantId);
        const tenantAlerts = Array.from(alerts.values())
            .filter((a) => a.tenantId === tenantId);
        const txList = Array.from(transactions.values());
        const openAlerts = tenantAlerts.filter((a) => a.status === 'open');
        const flaggedTxs = txList.filter((t) => t.flags.length > 0);
        // Calculate totals
        const totalBalance = tenantConnections.reduce((sum, c) => sum + c.accounts.reduce((s, a) => s + a.balance, 0), 0);
        const totalInflows = txList
            .filter((t) => t.direction === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalOutflows = txList
            .filter((t) => t.direction === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);
        res.json({
            summary: {
                connectedAccounts: tenantConnections.reduce((sum, c) => sum + c.accounts.length, 0),
                totalBalance,
                totalTransactions: txList.length,
                totalInflows,
                totalOutflows,
                openAlerts: openAlerts.length,
                flaggedTransactions: flaggedTxs.length,
                alertsBySeverity: {
                    critical: tenantAlerts.filter((a) => a.severity === 'critical').length,
                    high: tenantAlerts.filter((a) => a.severity === 'high').length,
                    medium: tenantAlerts.filter((a) => a.severity === 'medium').length,
                    low: tenantAlerts.filter((a) => a.severity === 'low').length,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// =============================================================================
// Helper Functions
// =============================================================================
function generateMockTransactions(accountId, tenantId) {
    const counterparties = [
        'Proveedor ABC S.L.',
        'Telefonica',
        'Amazon EU',
        'Seguridad Social',
        'Hacienda - AEAT',
        'Luz Verde S.A.',
        'Alquiler Oficina',
        'Google Ireland',
        'Microsoft',
        'Nominas Empleados',
    ];
    const now = new Date();
    for (let i = 0; i < 50; i++) {
        const txDate = new Date(now);
        txDate.setDate(txDate.getDate() - Math.floor(Math.random() * 90));
        const isDebit = Math.random() > 0.4;
        const amount = parseFloat((Math.random() * 15000 + 50).toFixed(2));
        const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
        const flags = [];
        let anomalyScore = 0;
        // Add some random flags
        if (amount > 9000 && Math.random() > 0.7) {
            flags.push({
                type: 'structuring',
                severity: 'high',
                message: 'Monto cercano al umbral de reporte',
            });
            anomalyScore = 75;
            // Create alert for this
            const alertId = `alert_${Date.now()}_${i}`;
            alerts.set(alertId, {
                id: alertId,
                tenantId,
                transactionId: `tx_${Date.now()}_${i}`,
                type: 'structuring',
                severity: 'high',
                title: 'Posible Fraccionamiento',
                description: `Transaccion de ${amount.toLocaleString('es-ES')} EUR cerca del umbral de reporte`,
                status: 'open',
                createdAt: txDate.toISOString(),
            });
        }
        if (amount > 12000 && Math.random() > 0.5) {
            flags.push({
                type: 'unusual_amount',
                severity: 'medium',
                message: 'Monto superior al promedio historico',
            });
            anomalyScore = Math.max(anomalyScore, 50);
        }
        const txId = `tx_${Date.now()}_${i}`;
        transactions.set(txId, {
            id: txId,
            accountId,
            amount,
            currency: 'EUR',
            direction: isDebit ? 'debit' : 'credit',
            description: isDebit ? `Pago a ${counterparty}` : `Ingreso de ${counterparty}`,
            counterpartyName: counterparty,
            bookingDate: txDate.toISOString().split('T')[0],
            anomalyScore,
            flags,
        });
    }
}
//# sourceMappingURL=banking.js.map