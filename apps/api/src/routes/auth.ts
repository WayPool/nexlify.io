/**
 * Authentication routes.
 */

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import { errors } from '../middleware/error-handler.js';
import { db } from '../db/index.js';
import { tenants, users, userPermissions } from '../db/schema.js';
import { recordFailedLogin, recordSuccessfulLogin, logSecurityEvent } from '../middleware/security.js';

export const authRoutes = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(2),
});

const refreshSchema = z.object({
  refresh_token: z.string(),
});

/**
 * Get client IP address
 */
function getClientIP(req: import('express').Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded : forwarded[0];
    return ips.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * POST /api/auth/login
 */
authRoutes.post('/login', async (req, res, next) => {
  const clientIP = getClientIP(req);
  let attemptedEmail: string | undefined;

  try {
    const { email, password } = loginSchema.parse(req.body);
    attemptedEmail = email;

    // Look up user in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      // Record failed attempt
      recordFailedLogin(clientIP, email);
      logSecurityEvent('Failed login - user not found', { ip: clientIP, email });
      throw errors.unauthorized('Email o contraseña incorrectos');
    }

    // Verify password
    if (!user.password_hash) {
      recordFailedLogin(clientIP, email);
      logSecurityEvent('Failed login - no password hash', { ip: clientIP, email });
      throw errors.unauthorized('Esta cuenta requiere inicio de sesión con Google');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Record failed attempt
      recordFailedLogin(clientIP, email);
      logSecurityEvent('Failed login - invalid password', { ip: clientIP, email });
      throw errors.unauthorized('Email o contraseña incorrectos');
    }

    // Check user status
    if (user.status !== 'active') {
      logSecurityEvent('Failed login - inactive user', { ip: clientIP, email, status: user.status });
      throw errors.forbidden('Tu cuenta está desactivada. Contacta al administrador.');
    }

    // Get tenant info
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, user.tenant_id))
      .limit(1);

    if (!tenant || tenant.status !== 'active') {
      logSecurityEvent('Failed login - inactive tenant', { ip: clientIP, email, tenantStatus: tenant?.status });
      throw errors.forbidden('Tu organización está desactivada.');
    }

    // Get user permissions
    const permissionsResult = await db
      .select({ permission: userPermissions.permission })
      .from(userPermissions)
      .where(eq(userPermissions.user_id, user.id));

    const permissions = permissionsResult.map(p => p.permission);

    // Update last login
    await db
      .update(users)
      .set({ last_login: new Date() })
      .where(eq(users.id, user.id));

    // Record successful login (clears failed attempts)
    recordSuccessfulLogin(clientIP);
    logSecurityEvent('Successful login', { ip: clientIP, email, userId: user.id }, 'info');

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      roles: [user.role],
      permissions,
    });

    const refreshToken = generateRefreshToken(user.id);

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
  } catch (error) {
    // Record failed login for any error
    if (attemptedEmail) {
      recordFailedLogin(clientIP, attemptedEmail);
    }
    next(error);
  }
});

/**
 * POST /api/auth/register
 */
authRoutes.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, companyName } = registerSchema.parse(req.body);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw errors.conflict('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuid();
    const tenantId = uuid();

    // Create slug from company name
    const slug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) + '-' + Date.now().toString(36);

    // Create tenant in DB
    await db.insert(tenants).values({
      id: tenantId,
      name: companyName,
      slug,
      plan: 'essential',
      status: 'active',
    });

    // Create user in DB
    await db.insert(users).values({
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
      await db.insert(userPermissions).values({
        id: uuid(),
        user_id: userId,
        permission,
      });
    }

    // Generate token for auto-login after registration
    const token = generateToken({
      id: userId,
      email,
      tenant_id: tenantId,
      roles: ['admin'],
      permissions: adminPermissions,
    });

    const refreshToken = generateRefreshToken(userId);

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
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 */
authRoutes.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = refreshSchema.parse(req.body);

    // TODO: Verify refresh token and get user
    // TODO: Check if token is revoked

    // Mock response
    const token = generateToken({
      id: uuid(),
      email: 'user@example.com',
      tenant_id: uuid(),
      roles: ['admin'],
      permissions: ['*'],
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 */
authRoutes.post('/logout', async (req, res, next) => {
  try {
    // TODO: Revoke refresh token

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/forgot-password
 */
authRoutes.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    // TODO: Generate reset token and send email

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 */
authRoutes.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = z
      .object({
        token: z.string(),
        password: z.string().min(8),
      })
      .parse(req.body);

    // TODO: Verify reset token and update password

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/google
 * Redirect to Google OAuth
 */
authRoutes.get('/google', (req, res) => {
  // TODO: Implement Google OAuth redirect
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth');
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
authRoutes.get('/google/callback', async (req, res, next) => {
  try {
    // TODO: Handle Google OAuth callback
    // - Exchange code for tokens
    // - Get user info
    // - Create/link user account
    // - Generate JWT

    res.redirect('http://localhost:3000/auth/callback');
  } catch (error) {
    next(error);
  }
});
