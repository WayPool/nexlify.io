"use strict";
/**
 * Audit logging middleware.
 * Captures all mutating API calls for audit trail.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = auditMiddleware;
const uuid_1 = require("uuid");
const logger_js_1 = require("../utils/logger.js");
// In-memory buffer for batching (in production, use a proper queue)
const auditBuffer = [];
const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 100;
// Periodic flush
setInterval(() => {
    if (auditBuffer.length > 0) {
        flushAuditBuffer();
    }
}, FLUSH_INTERVAL);
async function flushAuditBuffer() {
    if (auditBuffer.length === 0)
        return;
    const entries = auditBuffer.splice(0, auditBuffer.length);
    // In production, this would write to database and queue for blockchain anchoring
    logger_js_1.logger.debug('Flushing audit entries', { count: entries.length });
    // TODO: Write to audit_logs table
    // TODO: Queue for blockchain anchoring
}
/**
 * Extract action from method and path.
 */
function extractAction(method, path) {
    const parts = path.split('/').filter(Boolean);
    const resource = parts[1] || 'unknown';
    switch (method) {
        case 'POST':
            return `${resource}.create`;
        case 'PUT':
        case 'PATCH':
            return `${resource}.update`;
        case 'DELETE':
            return `${resource}.delete`;
        default:
            return `${resource}.read`;
    }
}
/**
 * Extract resource type from path.
 */
function extractResourceType(path) {
    const parts = path.split('/').filter(Boolean);
    return parts[1] || 'unknown';
}
/**
 * Extract resource ID from path.
 */
function extractResourceId(path) {
    const parts = path.split('/').filter(Boolean);
    // Pattern: /api/resource/:id
    if (parts.length >= 3) {
        return parts[2];
    }
    return undefined;
}
/**
 * Audit middleware for tracking API calls.
 */
function auditMiddleware(req, res, next) {
    // Only audit mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        next();
        return;
    }
    // Skip health checks and internal routes
    if (req.path.includes('/health') || req.path.includes('/internal')) {
        next();
        return;
    }
    // Capture response
    const originalSend = res.send;
    res.send = function (body) {
        // Create audit entry
        const entry = {
            id: (0, uuid_1.v4)(),
            tenant_id: req.user?.tenant_id || 'unknown',
            actor_id: req.user?.id || 'unknown',
            actor_email: req.user?.email || 'unknown',
            action: extractAction(req.method, req.path),
            resource_type: extractResourceType(req.path),
            resource_id: extractResourceId(req.path),
            method: req.method,
            path: req.path,
            ip_address: req.ip || 'unknown',
            user_agent: req.get('user-agent'),
            request_body: sanitizeBody(req.body),
            response_status: res.statusCode,
            timestamp: new Date().toISOString(),
        };
        // Add to buffer
        auditBuffer.push(entry);
        // Flush if buffer is full
        if (auditBuffer.length >= MAX_BUFFER_SIZE) {
            flushAuditBuffer();
        }
        return originalSend.call(this, body);
    };
    next();
}
/**
 * Sanitize request body to remove sensitive fields.
 */
function sanitizeBody(body) {
    if (!body || typeof body !== 'object') {
        return body;
    }
    const sensitiveFields = [
        'password',
        'password_hash',
        'token',
        'secret',
        'api_key',
        'private_key',
        'credit_card',
        'cvv',
    ];
    const sanitized = { ...body };
    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
//# sourceMappingURL=audit.js.map