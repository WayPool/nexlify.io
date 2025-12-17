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
const auth_js_1 = require("../middleware/auth.js");
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
        // TODO: Look up user in database
        // For demo, accept any password with 8+ chars
        const userId = (0, uuid_1.v4)();
        const tenantId = (0, uuid_1.v4)();
        // Generate tokens
        const token = (0, auth_js_1.generateToken)({
            id: userId,
            email,
            tenant_id: tenantId,
            roles: ['admin'],
            permissions: ['*'],
        });
        const refreshToken = (0, auth_js_1.generateRefreshToken)(userId);
        // Extract name from email for demo
        const namePart = email.split('@')[0];
        const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        res.json({
            token,
            refresh_token: refreshToken,
            user: {
                id: userId,
                email,
                firstName,
                lastName: 'Usuario',
                role: 'admin',
                tenantId,
                tenantName: 'Demo Company',
                permissions: ['*'],
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
        // TODO: Check if user exists in DB
        // TODO: Create tenant and user in DB
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        const tenantId = (0, uuid_1.v4)();
        // Generate token for auto-login after registration
        const token = (0, auth_js_1.generateToken)({
            id: userId,
            email,
            tenant_id: tenantId,
            roles: ['admin'],
            permissions: ['*'],
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
                permissions: ['*'],
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