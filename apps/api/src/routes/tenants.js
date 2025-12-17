"use strict";
/**
 * Tenant management routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_js_1 = require("../middleware/auth.js");
exports.tenantRoutes = (0, express_1.Router)();
// Validation schemas
const updateTenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * GET /api/tenants/current
 * Get current tenant info
 */
exports.tenantRoutes.get('/current', async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        // TODO: Query tenant from database
        res.json({
            id: tenantId,
            name: 'Acme Corp',
            plan: 'professional',
            settings: {
                locale: 'en',
                timezone: 'Europe/Madrid',
                currency: 'EUR',
            },
            created_at: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/tenants/current
 * Update current tenant
 */
exports.tenantRoutes.patch('/current', (0, auth_js_1.requirePermission)('tenants.update'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const data = updateTenantSchema.parse(req.body);
        // TODO: Update tenant in database
        res.json({
            id: tenantId,
            ...data,
            updated_at: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/tenants/current/stats
 * Get tenant statistics
 */
exports.tenantRoutes.get('/current/stats', async (req, res, next) => {
    try {
        // TODO: Query stats from database
        res.json({
            users: {
                total: 15,
                active: 12,
            },
            risks: {
                total: 127,
                active: 23,
                by_severity: {
                    critical: 2,
                    high: 8,
                    medium: 10,
                    low: 3,
                },
            },
            modules: {
                installed: 3,
                active: 3,
            },
            storage_used_mb: 1250,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/tenants/current/modules
 * Get installed modules for tenant
 */
exports.tenantRoutes.get('/current/modules', async (req, res, next) => {
    try {
        // TODO: Query installed modules
        res.json({
            data: [
                {
                    id: 'payroll',
                    name: 'Payroll Compliance',
                    version: '1.0.0',
                    status: 'active',
                    installed_at: new Date().toISOString(),
                },
                {
                    id: 'legal',
                    name: 'Legal Contracts',
                    version: '1.0.0',
                    status: 'active',
                    installed_at: new Date().toISOString(),
                },
            ],
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/tenants/current/modules/:moduleId
 * Install a module for tenant
 */
exports.tenantRoutes.post('/current/modules/:moduleId', (0, auth_js_1.requirePermission)('modules.install'), async (req, res, next) => {
    try {
        const { moduleId } = req.params;
        // TODO: Install module
        // - Verify module exists in registry
        // - Check plan allows module
        // - Run module migrations
        // - Initialize module
        res.status(201).json({
            id: moduleId,
            status: 'active',
            installed_at: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/tenants/current/modules/:moduleId
 * Uninstall a module from tenant
 */
exports.tenantRoutes.delete('/current/modules/:moduleId', (0, auth_js_1.requirePermission)('modules.uninstall'), async (req, res, next) => {
    try {
        const { moduleId } = req.params;
        // TODO: Uninstall module
        // - Deactivate module
        // - Archive module data (don't delete for audit)
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/tenants/current/api-keys
 * List API keys for tenant
 */
exports.tenantRoutes.get('/current/api-keys', (0, auth_js_1.requirePermission)('api_keys.read'), async (req, res, next) => {
    try {
        // TODO: Query API keys
        res.json({
            data: [
                {
                    id: 'key_1',
                    name: 'Production API',
                    prefix: 'pk_prod_****',
                    last_used: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                },
            ],
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/tenants/current/api-keys
 * Create API key
 */
exports.tenantRoutes.post('/current/api-keys', (0, auth_js_1.requirePermission)('api_keys.create'), async (req, res, next) => {
    try {
        const { name, permissions } = zod_1.z
            .object({
            name: zod_1.z.string().min(2),
            permissions: zod_1.z.array(zod_1.z.string()).optional(),
        })
            .parse(req.body);
        // TODO: Generate and store API key
        res.status(201).json({
            id: 'key_new',
            name,
            key: 'pk_prod_GENERATED_KEY_SHOWN_ONCE',
            created_at: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/tenants/current/api-keys/:keyId
 * Revoke API key
 */
exports.tenantRoutes.delete('/current/api-keys/:keyId', (0, auth_js_1.requirePermission)('api_keys.delete'), async (req, res, next) => {
    try {
        const { keyId } = req.params;
        // TODO: Revoke API key
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=tenants.js.map