/**
 * Profile routes - User profile management
 */

import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { errors } from '../middleware/error-handler.js';
import { db } from '../db/index.js';
import { users, tenants } from '../db/schema.js';

export const profileRoutes = Router();

// All routes require authentication
profileRoutes.use(authMiddleware);

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

/**
 * GET /api/profile
 * Get current user's profile
 */
profileRoutes.get('/', async (req, res, next) => {
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

    // Get tenant info
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, user.tenant_id))
      .limit(1);

    // Parse name
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      role: user.role,
      tenantId: user.tenant_id,
      tenantName: tenant?.name || '',
      mfaEnabled: user.mfa_enabled,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/profile
 * Update current user's profile
 */
profileRoutes.patch('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = updateProfileSchema.parse(req.body);

    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw errors.notFound('Usuario no encontrado');
    }

    // Update name if provided
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const nameParts = user.name.split(' ');
      const currentFirstName = nameParts[0] || '';
      const currentLastName = nameParts.slice(1).join(' ') || '';

      const newFirstName = data.firstName ?? currentFirstName;
      const newLastName = data.lastName ?? currentLastName;
      
      await db
        .update(users)
        .set({ name: `${newFirstName} ${newLastName}`.trim() })
        .where(eq(users.id, userId));
    }

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/profile/avatar
 * Upload user avatar (placeholder)
 */
profileRoutes.post('/avatar', async (_req, res, next) => {
  try {
    res.json({
      message: 'Avatar actualizado',
      avatar_url: null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/profile/avatar
 * Remove user avatar (placeholder)
 */
profileRoutes.delete('/avatar', async (_req, res, next) => {
  try {
    res.json({ message: 'Avatar eliminado' });
  } catch (error) {
    next(error);
  }
});
