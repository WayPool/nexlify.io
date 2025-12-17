"use strict";
/**
 * User management routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const auth_js_1 = require("../middleware/auth.js");
const error_handler_js_1 = require("../middleware/error-handler.js");
exports.userRoutes = (0, express_1.Router)();
// Validation schemas
const createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2),
    role: zod_1.z.enum(['admin', 'auditor', 'manager', 'viewer', 'module_operator']),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    role: zod_1.z.enum(['admin', 'auditor', 'manager', 'viewer', 'module_operator']).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
/**
 * GET /api/users
 * List users in tenant
 */
exports.userRoutes.get('/', (0, auth_js_1.requirePermission)('users.read'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        // TODO: Query users from database with filters
        const users = [
            {
                id: (0, uuid_1.v4)(),
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
                status: 'active',
                mfa_enabled: true,
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
            },
        ];
        res.json({
            data: users,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total: users.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/users/:id
 * Get user by ID
 */
exports.userRoutes.get('/:id', (0, auth_js_1.requirePermission)('users.read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // TODO: Query user from database
        res.json({
            id,
            email: 'user@example.com',
            name: 'Test User',
            role: 'viewer',
            status: 'active',
            mfa_enabled: false,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/users
 * Create/invite user
 */
exports.userRoutes.post('/', (0, auth_js_1.requirePermission)('users.create'), async (req, res, next) => {
    try {
        const data = createUserSchema.parse(req.body);
        const tenantId = req.user.tenant_id;
        // TODO: Check if user with email already exists
        // TODO: Create user with pending status
        // TODO: Send invitation email
        const userId = (0, uuid_1.v4)();
        res.status(201).json({
            id: userId,
            email: data.email,
            name: data.name,
            role: data.role,
            status: 'pending',
            tenant_id: tenantId,
            created_at: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/users/:id
 * Update user
 */
exports.userRoutes.patch('/:id', (0, auth_js_1.requirePermission)('users.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = updateUserSchema.parse(req.body);
        // TODO: Update user in database
        res.json({
            id,
            ...data,
            updated_at: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/users/:id
 * Deactivate user
 */
exports.userRoutes.delete('/:id', (0, auth_js_1.requirePermission)('users.delete'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // Prevent self-deletion
        if (id === req.user.id) {
            throw error_handler_js_1.errors.badRequest('Cannot delete your own account');
        }
        // TODO: Soft delete user (set status to inactive)
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/users/:id/reset-password
 * Admin reset user password
 */
exports.userRoutes.post('/:id/reset-password', (0, auth_js_1.requirePermission)('users.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // TODO: Generate reset token and send email
        res.json({ message: 'Password reset email sent' });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/users/:id/mfa/enable
 * Enable MFA for user
 */
exports.userRoutes.post('/:id/mfa/enable', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Users can only enable MFA for themselves unless admin
        if (id !== req.user.id && !req.user.roles.includes('admin')) {
            throw error_handler_js_1.errors.forbidden();
        }
        // TODO: Generate MFA secret and return QR code
        res.json({
            secret: 'MOCK_SECRET',
            qr_code: 'data:image/png;base64,MOCK_QR_CODE',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/users/:id/mfa/verify
 * Verify MFA code and complete setup
 */
exports.userRoutes.post('/:id/mfa/verify', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code } = zod_1.z.object({ code: zod_1.z.string().length(6) }).parse(req.body);
        // TODO: Verify MFA code and enable MFA
        res.json({ message: 'MFA enabled successfully' });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/users/:id/mfa
 * Disable MFA for user
 */
exports.userRoutes.delete('/:id/mfa', (0, auth_js_1.requirePermission)('users.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // TODO: Disable MFA
        res.json({ message: 'MFA disabled' });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=users.js.map