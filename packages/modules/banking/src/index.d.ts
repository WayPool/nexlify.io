/**
 * Banking Module
 *
 * Transaction monitoring and anomaly detection for enterprise banking.
 * Uses Nordigen/GoCardless for PSD2-compliant bank connections.
 */
export * from './types/index.js';
export { NordigenClient, createNordigenClient } from './services/nordigen-client.js';
export { TransactionSyncService, createSyncService } from './services/sync-service.js';
export type { SyncResult, TransactionStore } from './services/sync-service.js';
export { AnomalyEngine, createAnomalyEngine, getDefaultRules, } from './rules/anomaly-engine.js';
export type { TransactionHistory, AlertStore } from './rules/anomaly-engine.js';
//# sourceMappingURL=index.d.ts.map