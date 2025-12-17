/**
 * Authentication middleware.
 */
import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    id: string;
    email: string;
    tenant_id: string;
    roles: string[];
    permissions: string[];
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
/**
 * Verify JWT token and attach user to request.
 */
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
/**
 * Check if user has required permission.
 */
export declare function requirePermission(...permissions: string[]): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Check if user has required role.
 */
export declare function requireRole(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Generate JWT token for user.
 */
export declare function generateToken(user: AuthUser): string;
/**
 * Generate refresh token.
 */
export declare function generateRefreshToken(userId: string): string;
//# sourceMappingURL=auth.d.ts.map