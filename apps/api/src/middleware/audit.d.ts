/**
 * Audit logging middleware.
 * Captures all mutating API calls for audit trail.
 */
import { Request, Response, NextFunction } from 'express';
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
/**
 * Audit middleware for tracking API calls.
 */
export declare function auditMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=audit.d.ts.map