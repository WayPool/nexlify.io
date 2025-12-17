/**
 * @platform/sdk
 *
 * SDK for building platform modules.
 * Modules can ONLY depend on this package.
 */
export type { UUID, ISODateString, I18nKey, RiskCategory, RiskSeverity, RiskStatus, RiskFinding, EvidenceRef, EntityRef, EntityType, TimeFrame, ModuleManifest, ModuleHealth, ModuleHealthStatus, } from '@platform/core';
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
export interface ModuleLogger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
}
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
export interface AuditLogEntry {
    action: string;
    tenant_id: string;
    actor_id?: string;
    target_type?: string;
    target_id?: string;
    changes?: Record<string, {
        from?: unknown;
        to?: unknown;
    }>;
    metadata?: Record<string, unknown>;
}
export interface AuditClient {
    /**
     * Log an auditable action.
     */
    log(entry: AuditLogEntry): Promise<void>;
}
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
import { z } from 'zod';
export declare const ModuleManifestSchema: z.ZodObject<{
    id: z.ZodString;
    version: z.ZodString;
    name_i18n_key: z.ZodString;
    description_i18n_key: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    license: z.ZodOptional<z.ZodString>;
    permissions: z.ZodArray<z.ZodString, "many">;
    policies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["rbac", "abac"]>;
        rules: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type: "rbac" | "abac";
        name: string;
        rules: Record<string, unknown>;
    }, {
        type: "rbac" | "abac";
        name: string;
        rules: Record<string, unknown>;
    }>, "many">;
    db_migrations_path: z.ZodString;
    risk_providers: z.ZodArray<z.ZodString, "many">;
    ui_extensions: z.ZodObject<{
        routes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            component: z.ZodString;
            permission: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            component: string;
            permission?: string | undefined;
        }, {
            path: string;
            component: string;
            permission?: string | undefined;
        }>, "many">>;
        widgets: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            component: z.ZodString;
            slots: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            component: string;
            slots: string[];
        }, {
            id: string;
            component: string;
            slots: string[];
        }>, "many">>;
        menu_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label_i18n_key: z.ZodString;
            icon: z.ZodString;
            path: z.ZodString;
            permission: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            icon: string;
            label_i18n_key: string;
            permission?: string | undefined;
        }, {
            path: string;
            icon: string;
            label_i18n_key: string;
            permission?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        widgets?: {
            id: string;
            component: string;
            slots: string[];
        }[] | undefined;
        routes?: {
            path: string;
            component: string;
            permission?: string | undefined;
        }[] | undefined;
        menu_items?: {
            path: string;
            icon: string;
            label_i18n_key: string;
            permission?: string | undefined;
        }[] | undefined;
    }, {
        widgets?: {
            id: string;
            component: string;
            slots: string[];
        }[] | undefined;
        routes?: {
            path: string;
            component: string;
            permission?: string | undefined;
        }[] | undefined;
        menu_items?: {
            path: string;
            icon: string;
            label_i18n_key: string;
            permission?: string | undefined;
        }[] | undefined;
    }>;
    dependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    config_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    permissions: string[];
    id: string;
    name_i18n_key: string;
    version: string;
    policies: {
        type: "rbac" | "abac";
        name: string;
        rules: Record<string, unknown>;
    }[];
    db_migrations_path: string;
    risk_providers: string[];
    ui_extensions: {
        widgets?: {
            id: string;
            component: string;
            slots: string[];
        }[] | undefined;
        routes?: {
            path: string;
            component: string;
            permission?: string | undefined;
        }[] | undefined;
        menu_items?: {
            path: string;
            icon: string;
            label_i18n_key: string;
            permission?: string | undefined;
        }[] | undefined;
    };
    description_i18n_key?: string | undefined;
    author?: string | undefined;
    license?: string | undefined;
    dependencies?: Record<string, string> | undefined;
    config_schema?: Record<string, unknown> | undefined;
}, {
    permissions: string[];
    id: string;
    name_i18n_key: string;
    version: string;
    policies: {
        type: "rbac" | "abac";
        name: string;
        rules: Record<string, unknown>;
    }[];
    db_migrations_path: string;
    risk_providers: string[];
    ui_extensions: {
        widgets?: {
            id: string;
            component: string;
            slots: string[];
        }[] | undefined;
        routes?: {
            path: string;
            component: string;
            permission?: string | undefined;
        }[] | undefined;
        menu_items?: {
            path: string;
            icon: string;
            label_i18n_key: string;
            permission?: string | undefined;
        }[] | undefined;
    };
    description_i18n_key?: string | undefined;
    author?: string | undefined;
    license?: string | undefined;
    dependencies?: Record<string, string> | undefined;
    config_schema?: Record<string, unknown> | undefined;
}>;
export declare function validateManifest(manifest: unknown): import('@platform/core').ModuleManifest;
import { v4 as uuid } from 'uuid';
/**
 * Generate a UUID
 */
export { uuid };
/**
 * Create a risk finding with required fields
 */
export declare function createRiskFinding(input: Omit<RiskFinding, 'id' | 'status' | 'created_at' | 'updated_at'>): RiskFinding;
//# sourceMappingURL=index.d.ts.map