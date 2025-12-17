/**
 * Authentication middleware.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { errors } from './error-handler.js';

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

interface JwtPayload {
  sub: string;
  email: string;
  tenant_id: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Verify JWT token and attach user to request.
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw errors.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      tenant_id: payload.tenant_id,
      roles: payload.roles,
      permissions: payload.permissions,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw errors.unauthorized('Token expired');
    }
    throw errors.unauthorized('Invalid token');
  }
}

/**
 * Check if user has required permission.
 */
export function requirePermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw errors.unauthorized();
    }

    const hasPermission = permissions.some(
      (perm) =>
        req.user!.permissions.includes(perm) ||
        req.user!.permissions.includes('*')
    );

    if (!hasPermission) {
      throw errors.forbidden('Insufficient permissions');
    }

    next();
  };
}

/**
 * Check if user has required role.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw errors.unauthorized();
    }

    const hasRole = roles.some((role) => req.user!.roles.includes(role));

    if (!hasRole) {
      throw errors.forbidden('Insufficient role');
    }

    next();
  };
}

/**
 * Generate JWT token for user.
 */
export function generateToken(user: AuthUser): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    tenant_id: user.tenant_id,
    roles: user.roles,
    permissions: user.permissions,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expires_in,
  });
}

/**
 * Generate refresh token.
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refresh_expires_in,
  });
}
