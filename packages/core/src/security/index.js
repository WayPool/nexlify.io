"use strict";
/**
 * Security Module
 *
 * RBAC/ABAC policy engine, permission checking, and security utilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyEngine = exports.CLEARANCE_LEVELS = exports.STANDARD_ATTRIBUTES = exports.PolicyEngine = void 0;
exports.parsePermission = parsePermission;
exports.buildPermission = buildPermission;
exports.expandRolePermissions = expandRolePermissions;
exports.attributesToRecord = attributesToRecord;
exports.hasClearance = hasClearance;
exports.secureCompare = secureCompare;
exports.generateSecureToken = generateSecureToken;
// =============================================================================
// Policy Engine
// =============================================================================
class PolicyEngine {
    abacRules = [];
    /**
     * Add an ABAC rule
     */
    addRule(rule) {
        this.abacRules.push(rule);
    }
    /**
     * Clear all rules
     */
    clearRules() {
        this.abacRules = [];
    }
    /**
     * Check if action is allowed using RBAC + ABAC
     */
    evaluate(context, request) {
        // First check RBAC (permission-based)
        const rbacResult = this.evaluateRBAC(context, request);
        if (!rbacResult.allowed) {
            return rbacResult;
        }
        // Then check ABAC (attribute-based)
        const abacResult = this.evaluateABAC(context, request);
        if (!abacResult.allowed) {
            return abacResult;
        }
        return { allowed: true };
    }
    /**
     * Check RBAC permissions
     */
    evaluateRBAC(context, request) {
        // Build the required permission code
        const requiredPermission = `${request.resource}:${request.action}`;
        // Check if user has the permission or wildcard
        const hasPermission = context.permissions.includes(requiredPermission) ||
            context.permissions.includes(`${request.resource}:*`) ||
            context.permissions.includes('*:*');
        // Admin role has all permissions
        const isAdmin = context.roles.includes('admin');
        if (hasPermission || isAdmin) {
            return { allowed: true, matched_rule: `rbac:${requiredPermission}` };
        }
        return {
            allowed: false,
            reason: `Missing permission: ${requiredPermission}`,
        };
    }
    /**
     * Check ABAC rules
     */
    evaluateABAC(context, request) {
        // If no ABAC rules, allow (RBAC already passed)
        if (this.abacRules.length === 0) {
            return { allowed: true };
        }
        // Find matching rules
        for (const rule of this.abacRules) {
            const matches = this.evaluateConditions(context, request, rule.conditions);
            if (matches) {
                if (rule.effect === 'deny') {
                    return {
                        allowed: false,
                        reason: `Denied by ABAC rule: ${rule.name}`,
                        matched_rule: rule.name,
                    };
                }
            }
        }
        return { allowed: true };
    }
    /**
     * Evaluate ABAC conditions
     */
    evaluateConditions(context, request, conditions) {
        for (const condition of conditions) {
            const attrValue = this.resolveAttribute(condition.attribute, context, request);
            if (!this.evaluateCondition(attrValue, condition)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Resolve attribute value from context
     */
    resolveAttribute(attribute, context, request) {
        // Check context attributes first
        if (attribute in context.attributes) {
            return context.attributes[attribute];
        }
        // Check request context
        if (request.context && attribute in request.context) {
            return request.context[attribute];
        }
        // Built-in attributes
        switch (attribute) {
            case 'user_id':
                return context.user_id;
            case 'tenant_id':
                return context.tenant_id;
            case 'roles':
                return context.roles;
            default:
                return undefined;
        }
    }
    /**
     * Evaluate a single condition
     */
    evaluateCondition(attrValue, condition) {
        if (condition.operator === 'exists') {
            return attrValue !== undefined;
        }
        if (attrValue === undefined) {
            return false;
        }
        const attrArray = Array.isArray(attrValue) ? attrValue : [attrValue];
        const condValue = condition.value;
        const condArray = Array.isArray(condValue) ? condValue : [condValue];
        switch (condition.operator) {
            case 'equals':
                return attrArray.length === 1 && attrArray[0] === condArray[0];
            case 'not_equals':
                return attrArray.length !== 1 || attrArray[0] !== condArray[0];
            case 'in':
                return attrArray.some((v) => condArray.includes(v));
            case 'not_in':
                return !attrArray.some((v) => condArray.includes(v));
            case 'contains':
                return condArray.every((v) => attrArray.includes(v));
            default:
                return false;
        }
    }
}
exports.PolicyEngine = PolicyEngine;
// =============================================================================
// Permission Utilities
// =============================================================================
/**
 * Parse permission code into components
 */
function parsePermission(code) {
    const parts = code.split(':');
    if (parts.length < 2) {
        return null;
    }
    // Handle module permissions: module:payroll:employees:read
    if (parts[0] === 'module' && parts.length >= 4) {
        return {
            resource: `module:${parts[1]}:${parts[2]}`,
            action: parts[3],
        };
    }
    // Core permissions: core:users:read
    if (parts.length >= 3) {
        return {
            resource: `${parts[0]}:${parts[1]}`,
            action: parts[2],
        };
    }
    return {
        resource: parts[0],
        action: parts[1],
    };
}
/**
 * Build permission code from components
 */
function buildPermission(scope, resource, action, moduleId) {
    if (scope === 'module' && moduleId) {
        return `module:${moduleId}:${resource}:${action}`;
    }
    return `${scope}:${resource}:${action}`;
}
/**
 * Get all permissions from roles
 */
function expandRolePermissions(roles, rolePermissions) {
    const permissions = new Set();
    for (const role of roles) {
        const perms = rolePermissions.get(role.id) ?? [];
        for (const perm of perms) {
            permissions.add(perm);
        }
    }
    return Array.from(permissions);
}
// =============================================================================
// Attribute Utilities
// =============================================================================
/**
 * Convert UserAttribute array to Record
 */
function attributesToRecord(attributes) {
    const record = {};
    for (const attr of attributes) {
        if (attr.attribute_key in record) {
            const existing = record[attr.attribute_key];
            if (Array.isArray(existing)) {
                existing.push(attr.attribute_value);
            }
            else {
                record[attr.attribute_key] = [existing, attr.attribute_value];
            }
        }
        else {
            record[attr.attribute_key] = attr.attribute_value;
        }
    }
    return record;
}
/**
 * Standard attribute keys
 */
exports.STANDARD_ATTRIBUTES = {
    DEPARTMENT: 'department',
    COUNTRY: 'country',
    LEVEL: 'level',
    CLEARANCE: 'clearance',
    REGION: 'region',
    COST_CENTER: 'cost_center',
};
/**
 * Standard clearance levels (ordered lowest to highest)
 */
exports.CLEARANCE_LEVELS = ['public', 'internal', 'confidential', 'secret'];
/**
 * Check if user has sufficient clearance
 */
function hasClearance(userClearance, requiredClearance) {
    if (!userClearance)
        return requiredClearance === 'public';
    const userLevel = exports.CLEARANCE_LEVELS.indexOf(userClearance);
    const requiredLevel = exports.CLEARANCE_LEVELS.indexOf(requiredClearance);
    return userLevel >= requiredLevel;
}
// =============================================================================
// Singleton Instance
// =============================================================================
exports.policyEngine = new PolicyEngine();
// =============================================================================
// Security Helpers
// =============================================================================
/**
 * Constant-time string comparison (prevents timing attacks)
 */
function secureCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
/**
 * Generate a secure random token
 */
function generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
    }
    return result;
}
//# sourceMappingURL=index.js.map