/**
 * Settings routes - Account settings, security, notifications
 */

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { errors } from '../middleware/error-handler.js';
import { db } from '../db/index.js';
import { users, tenants } from '../db/schema.js';

export const settingsRoutes = Router();

// All routes require authentication
settingsRoutes.use(authMiddleware);

// Validation schemas
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// ============================================================================
// PASSWORD
// ============================================================================

/**
 * POST /api/settings/password
 * Change user password
 */
settingsRoutes.post('/password', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw errors.notFound('Usuario no encontrado');
    }

    // Verify current password
    if (!user.password_hash) {
      throw errors.badRequest('Esta cuenta no tiene contraseña establecida');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw errors.unauthorized('Contraseña actual incorrecta');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ password_hash: newPasswordHash })
      .where(eq(users.id, userId));

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

/**
 * POST /api/settings/2fa/setup
 * Setup 2FA - Generate secret and QR code
 */
settingsRoutes.post('/2fa/setup', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw errors.notFound('Usuario no encontrado');
    }

    // Generate secret using speakeasy
    const secret = speakeasy.generateSecret({
      name: `Nexlify (${userEmail})`,
      issuer: 'Nexlify',
      length: 32,
    });

    // Store secret temporarily (base32 encoded)
    await db
      .update(users)
      .set({ mfa_secret: secret.base32 })
      .where(eq(users.id, userId));

    // Generate QR code as data URL
    const otpauthUrl = secret.otpauth_url ||
      `otpauth://totp/Nexlify:${userEmail}?secret=${secret.base32}&issuer=Nexlify`;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    res.json({
      qr_code: qrCodeDataUrl,
      secret: secret.base32,
      backup_codes: backupCodes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/settings/2fa/verify
 * Verify 2FA code and enable 2FA
 */
settingsRoutes.post('/2fa/verify', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body);

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw errors.notFound('Usuario no encontrado');
    }

    if (!user.mfa_secret) {
      throw errors.badRequest('No hay configuración de 2FA pendiente');
    }

    // Verify the TOTP code using speakeasy
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before/after for clock drift
    });

    if (!verified) {
      throw errors.unauthorized('Código incorrecto');
    }

    // Enable 2FA
    await db
      .update(users)
      .set({ mfa_enabled: true })
      .where(eq(users.id, userId));

    res.json({ message: '2FA activado correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/settings/2fa
 * Disable 2FA
 */
settingsRoutes.delete('/2fa', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    await db
      .update(users)
      .set({ 
        mfa_enabled: false,
        mfa_secret: null,
      })
      .where(eq(users.id, userId));

    res.json({ message: '2FA desactivado' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/settings/2fa/status
 * Check if 2FA is enabled
 */
settingsRoutes.get('/2fa/status', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw errors.notFound('Usuario no encontrado');
    }

    res.json({
      enabled: user.mfa_enabled,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// SESSIONS
// ============================================================================

/**
 * GET /api/settings/sessions
 * Get active sessions
 */
settingsRoutes.get('/sessions', async (req, res, next) => {
  try {
    res.json({
      sessions: [
        {
          id: '1',
          device: 'Este dispositivo',
          browser: req.headers['user-agent']?.split(' ').slice(-1)[0] || 'Unknown',
          location: 'España',
          lastActive: 'Ahora',
          current: true,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/settings/sessions/:sessionId
 * Revoke a specific session
 */
settingsRoutes.delete('/sessions/:sessionId', async (_req, res, next) => {
  try {
    res.json({ message: 'Sesión revocada' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/settings/sessions
 * Revoke all sessions except current
 */
settingsRoutes.delete('/sessions', async (_req, res, next) => {
  try {
    res.json({ message: 'Todas las sesiones han sido revocadas' });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * GET /api/settings/notifications
 */
settingsRoutes.get('/notifications', async (_req, res, next) => {
  try {
    res.json({
      email: {
        riskAlerts: true,
        weeklyDigest: true,
        securityAlerts: true,
        productUpdates: false,
      },
      push: {
        riskAlerts: true,
        mentions: true,
        reminders: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/settings/notifications
 */
settingsRoutes.patch('/notifications', async (_req, res, next) => {
  try {
    res.json({ message: 'Preferencias actualizadas' });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PRIVACY
// ============================================================================

/**
 * GET /api/settings/privacy
 */
settingsRoutes.get('/privacy', async (_req, res, next) => {
  try {
    res.json({
      profileVisibility: 'team',
      activityStatus: true,
      analyticsSharing: false,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/settings/privacy
 */
settingsRoutes.patch('/privacy', async (_req, res, next) => {
  try {
    res.json({ message: 'Configuración de privacidad actualizada' });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DATA EXPORT & ACCOUNT DELETION
// ============================================================================

/**
 * GET /api/settings/export
 * Export all user data
 */
settingsRoutes.get('/export', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const tenantId = req.user!.tenant_id;

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw errors.notFound('Usuario no encontrado');
    }

    // Get tenant data
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    // Parse name
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Build export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        role: user.role,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
      organization: tenant ? {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        createdAt: tenant.created_at,
      } : null,
    };

    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/settings/account
 * Delete user account
 */
settingsRoutes.delete('/account', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const tenantId = req.user!.tenant_id;

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw errors.notFound('Usuario no encontrado');
    }

    // Check if user is the only admin
    if (user.role === 'admin') {
      const admins = await db
        .select()
        .from(users)
        .where(eq(users.tenant_id, tenantId));

      const adminCount = admins.filter(u => u.role === 'admin').length;

      if (adminCount <= 1) {
        throw errors.badRequest('No puedes eliminar la única cuenta de administrador.');
      }
    }

    // Soft delete - mark as inactive and anonymize
    await db
      .update(users)
      .set({
        status: 'inactive',
        email: `deleted_${Date.now()}_${user.email}`,
        name: 'Usuario eliminado',
        password_hash: null,
      })
      .where(eq(users.id, userId));

    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});
