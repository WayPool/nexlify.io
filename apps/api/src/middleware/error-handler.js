"use strict";
/**
 * Global error handler middleware.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = void 0;
exports.errorHandler = errorHandler;
exports.createError = createError;
const zod_1 = require("zod");
const logger_js_1 = require("../utils/logger.js");
function errorHandler(err, req, res, _next) {
    // Log error
    logger_js_1.logger.error('Request error', err, {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    // Zod validation error
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: err.errors,
        });
        return;
    }
    // Known application error
    if (err.statusCode) {
        res.status(err.statusCode).json({
            error: err.message,
            code: err.code || 'ERROR',
            details: err.details,
        });
        return;
    }
    // Unknown error
    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
    });
}
/**
 * Create an application error.
 */
function createError(message, statusCode, code, details) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
}
// Common error creators
exports.errors = {
    notFound: (resource) => createError(`${resource} not found`, 404, 'NOT_FOUND'),
    unauthorized: (message = 'Unauthorized') => createError(message, 401, 'UNAUTHORIZED'),
    forbidden: (message = 'Access denied') => createError(message, 403, 'FORBIDDEN'),
    badRequest: (message, details) => createError(message, 400, 'BAD_REQUEST', details),
    conflict: (message) => createError(message, 409, 'CONFLICT'),
    tooManyRequests: (message = 'Too many requests') => createError(message, 429, 'TOO_MANY_REQUESTS'),
};
//# sourceMappingURL=error-handler.js.map