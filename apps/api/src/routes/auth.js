"use strict";
/**
 * Authentication routes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const auth_js_1 = require("../middleware/auth.js");
const error_handler_js_1 = require("../middleware/error-handler.js");
const index_js_1 = require("../db/index.js");
const schema_js_1 = require("../db/schema.js");
exports.authRoutes = (0, express_1.Router)();
// Validation schemas
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    companyName: zod_1.z.string().min(2),
});
const refreshSchema = zod_1.z.object({
    refresh_token: zod_1.z.string(),
});
/**
 * POST /api/auth/login
 */
exports.authRoutes.post('/login', async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Look up user in database
        const [user] = await index_js_1.db
            .select()
            .from(schema_js_1.users)
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email))
            .limit(1);
        if (!user) {
            throw error_handler_js_1.errors.unauthorized('Email o contraseña incorrectos');
        }
        // Verify password
        if (!user.password_hash) {
            throw error_handler_js_1.errors.unauthorized('Esta cuenta requiere inicio de sesión con Google');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw error_handler_js_1.errors.unauthorized('Email o contraseña incorrectos');
        }
        // Check user status
        if (user.status !== 'active') {
            throw error_handler_js_1.errors.forbidden('Tu cuenta está desactivada. Contacta al administrador.');
        }
        // Get tenant info
        const [tenant] = await index_js_1.db
            .select()
            .from(schema_js_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, user.tenant_id))
            .limit(1);
        if (!tenant || tenant.status !== 'active') {
            throw error_handler_js_1.errors.forbidden('Tu organización está desactivada.');
        }
        // Get user permissions
        const permissionsResult = await index_js_1.db
            .select({ permission: schema_js_1.userPermissions.permission })
            .from(schema_js_1.userPermissions)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userPermissions.user_id, user.id));
        const permissions = permissionsResult.map(p => p.permission);
        // Update last login
        await index_js_1.db
            .update(schema_js_1.users)
            .set({ last_login: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, user.id));
        // Generate tokens
        const token = (0, auth_js_1.generateToken)({
            id: user.id,
            email: user.email,
            tenant_id: user.tenant_id,
            roles: [user.role],
            permissions,
        });
        const refreshToken = (0, auth_js_1.generateRefreshToken)(user.id);
        // Parse name
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        res.json({
            token,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName,
                lastName,
                role: user.role,
                tenantId: user.tenant_id,
                tenantName: tenant.name,
                tenantPlan: tenant.plan,
                permissions,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/auth/register
 */
exports.authRoutes.post('/register', async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, companyName } = registerSchema.parse(req.body);
        // Check if user already exists
        const [existingUser] = await index_js_1.db
            .select()
            .from(schema_js_1.users)
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email))
            .limit(1);
        if (existingUser) {
            throw error_handler_js_1.errors.conflict('El email ya está registrado');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        const tenantId = (0, uuid_1.v4)();
        // Create slug from company name
        const slug = companyName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50) + '-' + Date.now().toString(36);
        // Create tenant in DB
        await index_js_1.db.insert(schema_js_1.tenants).values({
            id: tenantId,
            name: companyName,
            slug,
            plan: 'essential',
            status: 'active',
        });
        // Create user in DB
        await index_js_1.db.insert(schema_js_1.users).values({
            id: userId,
            tenant_id: tenantId,
            email,
            password_hash: passwordHash,
            name: `${firstName} ${lastName}`,
            role: 'admin',
            status: 'active',
        });
        // Grant all permissions to admin user
        const adminPermissions = [
            'users.read', 'users.write', 'users.delete',
            'modules.read', 'modules.configure', 'modules.manage',
            'risks.read', 'risks.update', 'risks.acknowledge', 'risks.resolve', 'risks.escalate',
            'audit.read', 'audit.export',
            'billing.read', 'billing.manage',
            'settings.read', 'settings.write',
        ];
        for (const permission of adminPermissions) {
            await index_js_1.db.insert(schema_js_1.userPermissions).values({
                id: (0, uuid_1.v4)(),
                user_id: userId,
                permission,
            });
        }
        // Generate token for auto-login after registration
        const token = (0, auth_js_1.generateToken)({
            id: userId,
            email,
            tenant_id: tenantId,
            roles: ['admin'],
            permissions: adminPermissions,
        });
        const refreshToken = (0, auth_js_1.generateRefreshToken)(userId);
        res.status(201).json({
            token,
            refresh_token: refreshToken,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                role: 'admin',
                tenantId,
                tenantName: companyName,
                permissions: adminPermissions,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/auth/refresh
 */
exports.authRoutes.post('/refresh', async (req, res, next) => {
    try {
        const { refresh_token } = refreshSchema.parse(req.body);
        // TODO: Verify refresh token and get user
        // TODO: Check if token is revoked
        // Mock response
        const token = (0, auth_js_1.generateToken)({
            id: (0, uuid_1.v4)(),
            email: 'user@example.com',
            tenant_id: (0, uuid_1.v4)(),
            roles: ['admin'],
            permissions: ['*'],
        });
        res.json({ token });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/auth/logout
 */
exports.authRoutes.post('/logout', async (req, res, next) => {
    try {
        // TODO: Revoke refresh token
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/auth/forgot-password
 */
exports.authRoutes.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = zod_1.z.object({ email: zod_1.z.string().email() }).parse(req.body);
        // TODO: Generate reset token and send email
        res.json({
            message: 'If an account exists with this email, a password reset link has been sent.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/auth/reset-password
 */
exports.authRoutes.post('/reset-password', async (req, res, next) => {
    try {
        const { token, password } = zod_1.z
            .object({
            token: zod_1.z.string(),
            password: zod_1.z.string().min(8),
        })
            .parse(req.body);
        // TODO: Verify reset token and update password
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/auth/google
 * Redirect to Google OAuth
 */
exports.authRoutes.get('/google', (req, res) => {
    // TODO: Implement Google OAuth redirect
    res.redirect('https://accounts.google.com/o/oauth2/v2/auth');
});
/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
exports.authRoutes.get('/google/callback', async (req, res, next) => {
    try {
        // TODO: Handle Google OAuth callback
        // - Exchange code for tokens
        // - Get user info
        // - Create/link user account
        // - Generate JWT
        res.redirect('http://localhost:3000/auth/callback');
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=auth.js.map