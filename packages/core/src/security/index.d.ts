/**
 * Security Module
 *
 * RBAC/ABAC policy engine, permission checking, and security utilities.
 */
import type { UUID, Permission, Role, UserAttribute } from '../types/index.js';
export interface PolicyContext {
    user_id: UUID;
    tenant_id: UUID;
    roles: string[];
    permissions: string[];
    attributes: Record<string, string | string[]>;
}
export interface PolicyRequest {
    action: string;
    resource: string;
    resource_id?: UUID;
    context?: Record<string, unknown>;
}
export interface PolicyResult {
    allowed: boolean;
    reason?: string;
    matched_rule?: string;
}
export interface ABACRule {
    name: string;
    effect: 'allow' | 'deny';
    conditions: ABACCondition[];
}
export interface ABACCondition {
    attribute: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'exists' | 'contains';
    value: string | string[];
}
export declare class PolicyEngine {
    private abacRules;
    /**
     * Add an ABAC rule
     */
    addRule(rule: ABACRule): void;
    /**
     * Clear all rules
     */
    clearRules(): void;
    /**
     * Check if action is allowed using RBAC + ABAC
     */
    evaluate(context: PolicyContext, request: PolicyRequest): PolicyResult;
    /**
     * Check RBAC permissions
     */
    private evaluateRBAC;
    /**
     * Check ABAC rules
     */
    private evaluateABAC;
    /**
     * Evaluate ABAC conditions
     */
    private evaluateConditions;
    /**
     * Resolve attribute value from context
     */
    private resolveAttribute;
    /**
     * Evaluate a single condition
     */
    private evaluateCondition;
}
/**
 * Parse permission code into components
 */
export declare function parsePermission(code: string): {
    resource: string;
    action: string;
} | null;
/**
 * Build permission code from components
 */
export declare function buildPermission(scope: 'core' | 'module', resource: string, action: string, moduleId?: string): string;
/**
 * Get all permissions from roles
 */
export declare function expandRolePermissions(roles: Role[], rolePermissions: Map<UUID, Permission[]>): Permission[];
/**
 * Convert UserAttribute array to Record
 */
export declare function attributesToRecord(attributes: UserAttribute[]): Record<string, string | string[]>;
/**
 * Standard attribute keys
 */
export declare const STANDARD_ATTRIBUTES: {
    readonly DEPARTMENT: "department";
    readonly COUNTRY: "country";
    readonly LEVEL: "level";
    readonly CLEARANCE: "clearance";
    readonly REGION: "region";
    readonly COST_CENTER: "cost_center";
};
/**
 * Standard clearance levels (ordered lowest to highest)
 */
export declare const CLEARANCE_LEVELS: readonly ["public", "internal", "confidential", "secret"];
/**
 * Check if user has sufficient clearance
 */
export declare function hasClearance(userClearance: string | undefined, requiredClearance: string): boolean;
export declare const policyEngine: PolicyEngine;
/**
 * Constant-time string comparison (prevents timing attacks)
 */
export declare function secureCompare(a: string, b: string): boolean;
/**
 * Generate a secure random token
 */
export declare function generateSecureToken(length?: number): string;
//# sourceMappingURL=index.d.ts.map