"use strict";
/**
 * Authentication middleware.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requirePermission = requirePermission;
exports.requireRole = requireRole;
exports.generateToken = generateToken;
exports.generateRefreshToken = generateRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
const error_handler_js_1 = require("./error-handler.js");
/**
 * Verify JWT token and attach user to request.
 */
function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw error_handler_js_1.errors.unauthorized('Missing or invalid authorization header');
    }
    const token = authHeader.substring(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_js_1.config.jwt.secret);
        req.user = {
            id: payload.sub,
            email: payload.email,
            tenant_id: payload.tenant_id,
            roles: payload.roles,
            permissions: payload.permissions,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw error_handler_js_1.errors.unauthorized('Token expired');
        }
        throw error_handler_js_1.errors.unauthorized('Invalid token');
    }
}
/**
 * Check if user has required permission.
 */
function requirePermission(...permissions) {
    return (req, _res, next) => {
        if (!req.user) {
            throw error_handler_js_1.errors.unauthorized();
        }
        const hasPermission = permissions.some((perm) => req.user.permissions.includes(perm) ||
            req.user.permissions.includes('*'));
        if (!hasPermission) {
            throw error_handler_js_1.errors.forbidden('Insufficient permissions');
        }
        next();
    };
}
/**
 * Check if user has required role.
 */
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw error_handler_js_1.errors.unauthorized();
        }
        const hasRole = roles.some((role) => req.user.roles.includes(role));
        if (!hasRole) {
            throw error_handler_js_1.errors.forbidden('Insufficient role');
        }
        next();
    };
}
/**
 * Generate JWT token for user.
 */
function generateToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        tenant_id: user.tenant_id,
        roles: user.roles,
        permissions: user.permissions,
    };
    return jsonwebtoken_1.default.sign(payload, config_js_1.config.jwt.secret, {
        expiresIn: config_js_1.config.jwt.expires_in,
    });
}
/**
 * Generate refresh token.
 */
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ sub: userId, type: 'refresh' }, config_js_1.config.jwt.secret, {
        expiresIn: config_js_1.config.jwt.refresh_expires_in,
    });
}
//# sourceMappingURL=auth.js.map