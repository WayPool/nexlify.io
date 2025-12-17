/**
 * @platform/sdk
 *
 * SDK for building platform modules.
 * Modules can ONLY depend on this package.
 */

// Re-export types from core
export type {
  UUID,
  ISODateString,
  I18nKey,
  RiskCategory,
  RiskSeverity,
  RiskStatus,
  RiskFinding,
  EvidenceRef,
  EntityRef,
  EntityType,
  TimeFrame,
  ModuleManifest,
  ModuleHealth,
  ModuleHealthStatus,
} from '@platform/core';

// =============================================================================
// Module Context
// =============================================================================

export interface ModuleContext {
  /** Module ID */
  moduleId: string;

  /** Module configuration */
  config: ModuleConfig;

  /** Database access (scoped to module namespace) */
  db: ModuleDatabase;

  /** Event bus for emitting/subscribing */
  eventBus: ModuleEventBus;

  /** Risk engine for registering providers */
  riskEngine: RiskEngineClient;

  /** i18n utilities */
  i18n: I18nClient;

  /** Logging (scoped to module) */
  logger: ModuleLogger;

  /** API registration */
  api: ApiRegistry;

  /** Audit logging */
  audit: AuditClient;

  /** Blockchain anchoring */
  blockchain: BlockchainClient;
}

export interface ModuleConfig {
  [key: string]: unknown;
}

// =============================================================================
// Module Database
// =============================================================================

export interface ModuleDatabase {
  /**
   * Run a query. Table names are automatically prefixed with module namespace.
   */
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Get a single record by ID.
   */
  findById<T>(table: string, id: string): Promise<T | null>;

  /**
   * Insert a record.
   */
  insert<T>(table: string, data: Partial<T>): Promise<T>;

  /**
   * Update a record.
   */
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a record (soft delete by default).
   */
  delete(table: string, id: string): Promise<void>;

  /**
   * Run within a transaction.
   */
  transaction<T>(fn: (tx: ModuleDatabase) => Promise<T>): Promise<T>;
}

// =============================================================================
// Module Event Bus
// =============================================================================

export interface ModuleEventBus {
  /**
   * Emit an event. Event type is automatically prefixed with module.<id>.
   */
  emit<T>(type: string, payload: T): Promise<void>;

  /**
   * Subscribe to core events.
   */
  subscribe<T>(type: string, handler: (payload: T) => Promise<void>): () => void;
}

// =============================================================================
// Risk Engine Client
// =============================================================================

import type { RiskFinding, TimeFrame } from '@platform/core';

export interface RiskDetector {
  id: string;
  name_i18n_key: string;
  categories: string[];
  detect(tenantId: string, timeframe: TimeFrame): Promise<RiskFinding[]>;
  healthCheck(): Promise<boolean>;
}

export interface RiskEngineClient {
  /**
   * Register a risk detector.
   */
  registerDetector(detector: RiskDetector): void;

  /**
   * Unregister a risk detector.
   */
  unregisterDetector(detectorId: string): void;
}

// =============================================================================
// i18n Client
// =============================================================================

export interface I18nClient {
  /**
   * Translate a key.
   */
  t(key: string, params?: Record<string, string | number>): string;

  /**
   * Get current locale.
   */
  getLocale(): string;
}

// =============================================================================
// Logger
// =============================================================================

export interface ModuleLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

// =============================================================================
// API Registry
// =============================================================================

export interface ApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: (req: ApiRequest, res: ApiResponse) => Promise<void>;
  permission?: string;
}

export interface ApiRequest {
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  user: {
    id: string;
    tenant_id: string;
    roles: string[];
    permissions: string[];
  };
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: unknown): void;
  send(data: string): void;
}

export interface ApiRegistry {
  /**
   * Register API routes for the module.
   */
  registerRoutes(routes: ApiRoute[]): void;
}

// =============================================================================
// Audit Client
// =============================================================================

export interface AuditLogEntry {
  action: string;
  tenant_id: string;
  actor_id?: string;
  target_type?: string;
  target_id?: string;
  changes?: Record<string, { from?: unknown; to?: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface AuditClient {
  /**
   * Log an auditable action.
   */
  log(entry: AuditLogEntry): Promise<void>;
}

// =============================================================================
// Blockchain Client
// =============================================================================

export interface BlockchainClient {
  /**
   * Hash data for anchoring.
   */
  hash(data: unknown): string;

  /**
   * Verify a hash against blockchain.
   */
  verify(hash: string): Promise<{
    verified: boolean;
    txHash?: string;
    blockNumber?: number;
    anchoredAt?: string;
  }>;
}

// =============================================================================
// Module SDK Interface
// =============================================================================

export interface ModuleSDK {
  /**
   * Called by Core to register the module.
   */
  registerModule(context: ModuleContext): Promise<void>;

  /**
   * Called by Core to get risk findings for a tenant.
   */
  getRiskFindings(tenantId: string, timeframe: TimeFrame): Promise<RiskFinding[]>;

  /**
   * Called by Core to check module health.
   */
  getModuleHealth(): Promise<import('@platform/core').ModuleHealth>;
}

// =============================================================================
// Module Manifest Validation
// =============================================================================

import { z } from 'zod';

export const ModuleManifestSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  name_i18n_key: z.string(),
  description_i18n_key: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  permissions: z.array(z.string()),
  policies: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['rbac', 'abac']),
      rules: z.record(z.unknown()),
    })
  ),
  db_migrations_path: z.string(),
  risk_providers: z.array(z.string()),
  ui_extensions: z.object({
    routes: z
      .array(
        z.object({
          path: z.string(),
          component: z.string(),
          permission: z.string().optional(),
        })
      )
      .optional(),
    widgets: z
      .array(
        z.object({
          id: z.string(),
          component: z.string(),
          slots: z.array(z.string()),
        })
      )
      .optional(),
    menu_items: z
      .array(
        z.object({
          label_i18n_key: z.string(),
          icon: z.string(),
          path: z.string(),
          permission: z.string().optional(),
        })
      )
      .optional(),
  }),
  dependencies: z.record(z.string()).optional(),
  config_schema: z.record(z.unknown()).optional(),
});

export function validateManifest(manifest: unknown): import('@platform/core').ModuleManifest {
  return ModuleManifestSchema.parse(manifest) as import('@platform/core').ModuleManifest;
}

// =============================================================================
// Helper Functions
// =============================================================================

import { v4 as uuid } from 'uuid';

/**
 * Generate a UUID
 */
export { uuid };

/**
 * Create a risk finding with required fields
 */
export function createRiskFinding(
  input: Omit<RiskFinding, 'id' | 'status' | 'created_at' | 'updated_at'>
): RiskFinding {
  const now = new Date().toISOString();
  return {
    ...input,
    id: uuid(),
    status: 'new',
    created_at: now,
    updated_at: now,
  };
}
