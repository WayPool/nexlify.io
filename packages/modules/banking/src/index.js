/**
 * Banking Module
 *
 * Transaction monitoring and anomaly detection for enterprise banking.
 * Uses Nordigen/GoCardless for PSD2-compliant bank connections.
 */
// Types
export * from './types/index.js';
// Services
export { NordigenClient, createNordigenClient } from './services/nordigen-client.js';
export { TransactionSyncService, createSyncService } from './services/sync-service.js';
// Rules Engine
export { AnomalyEngine, createAnomalyEngine, getDefaultRules, } from './rules/anomaly-engine.js';
//# sourceMappingURL=index.js.map