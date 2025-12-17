/**
 * Audit logging middleware.
 * Captures all mutating API calls for audit trail.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger.js';

export interface AuditEntry {
  id: string;
  tenant_id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  method: string;
  path: string;
  ip_address: string;
  user_agent?: string;
  request_body?: unknown;
  response_status: number;
  timestamp: string;
}

// In-memory buffer for batching (in production, use a proper queue)
const auditBuffer: AuditEntry[] = [];
const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 100;

// Periodic flush
setInterval(() => {
  if (auditBuffer.length > 0) {
    flushAuditBuffer();
  }
}, FLUSH_INTERVAL);

async function flushAuditBuffer(): Promise<void> {
  if (auditBuffer.length === 0) return;

  const entries = auditBuffer.splice(0, auditBuffer.length);

  // In production, this would write to database and queue for blockchain anchoring
  logger.debug('Flushing audit entries', { count: entries.length });

  // TODO: Write to audit_logs table
  // TODO: Queue for blockchain anchoring
}

/**
 * Extract action from method and path.
 */
function extractAction(method: string, path: string): string {
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
function extractResourceType(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[1] || 'unknown';
}

/**
 * Extract resource ID from path.
 */
function extractResourceId(path: string): string | undefined {
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
export function auditMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
  res.send = function (body): Response {
    // Create audit entry
    const entry: AuditEntry = {
      id: uuid(),
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
function sanitizeBody(body: unknown): unknown {
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

  const sanitized = { ...body } as Record<string, unknown>;

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
