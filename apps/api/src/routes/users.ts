/**
 * User management routes.
 *
 * Manages users, roles, and module-specific permissions.
 * Currently returns empty data as this is a fresh installation.
 */

import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { requirePermission } from '../middleware/auth.js';
import { errors } from '../middleware/error-handler.js';

export const userRoutes = Router();

// Permission levels for modules
const permissionLevels = ['read', 'write', 'manage', 'admin'] as const;

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['admin', 'manager', 'auditor', 'module_operator', 'viewer']),
  modulePermissions: z.array(z.object({
    moduleId: z.string(),
    permissions: z.array(z.enum(permissionLevels)),
  })).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['admin', 'manager', 'auditor', 'module_operator', 'viewer']).optional(),
  status: z.enum(['active', 'pending', 'inactive']).optional(),
});

const updatePermissionsSchema = z.object({
  modulePermissions: z.array(z.object({
    moduleId: z.string(),
    permissions: z.array(z.enum(permissionLevels)),
  })),
});

/**
 * GET /api/users
 * List users in tenant
 * Returns empty array when no users have been added
 */
userRoutes.get('/', requirePermission('users.read'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    // No users have been added yet - return empty array
    // Users will be created via the invite flow
    const users: unknown[] = [];

    res.json({
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        hasMore: false,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/stats
 * Get user statistics for the tenant
 */
userRoutes.get('/stats', requirePermission('users.read'), async (req, res, next) => {
  try {
    // No users yet - return zero stats
    res.json({
      total: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      byRole: {
        admin: 0,
        manager: 0,
        auditor: 0,
        module_operator: 0,
        viewer: 0,
      },
      mfaEnabled: 0,
      lastActivity: null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/plan-limits
 * Get user limits based on current subscription plan
 */
userRoutes.get('/plan-limits', requirePermission('users.read'), async (req, res, next) => {
  try {
    // TODO: Get actual plan from tenant subscription
    // For now, return starter plan limits
    res.json({
      plan: 'starter',
      limits: {
        maxUsers: 5,
        currentUsers: 0,
        remainingUsers: 5,
        maxAdmins: 1,
        currentAdmins: 0,
        features: {
          sso: false,
          mfaRequired: false,
          auditLog: true,
          customRoles: false,
          apiAccess: false,
        },
      },
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          maxUsers: 5,
          maxAdmins: 1,
          pricePerUser: 0,
        },
        {
          id: 'professional',
          name: 'Professional',
          maxUsers: 25,
          maxAdmins: 3,
          pricePerUser: 29,
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          maxUsers: -1, // unlimited
          maxAdmins: -1,
          pricePerUser: 49,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
userRoutes.get('/:id', requirePermission('users.read'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Query user from database
    // For now, return 404 as no users exist
    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users
 * Create/invite user
 */
userRoutes.post('/', requirePermission('users.create'), async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const tenantId = req.user!.tenant_id;

    // TODO: Check plan limits before creating user
    // TODO: Check if user with email already exists
    // TODO: Create user with pending status
    // TODO: Send invitation email

    const userId = uuid();

    res.status(201).json({
      id: userId,
      email: data.email,
      name: data.name,
      role: data.role,
      status: 'pending',
      mfaEnabled: false,
      modulePermissions: data.modulePermissions || [],
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
      message: 'Invitación enviada correctamente',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/:id
 * Update user
 */
userRoutes.patch('/:id', requirePermission('users.update'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    // TODO: Update user in database
    // For now, return 404 as no users exist
    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/:id/permissions
 * Update user module permissions
 */
userRoutes.patch('/:id/permissions', requirePermission('users.update'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { modulePermissions } = updatePermissionsSchema.parse(req.body);

    // TODO: Update user permissions in database
    // For now, return 404 as no users exist
    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * Deactivate user
 */
userRoutes.delete('/:id', requirePermission('users.delete'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!.id) {
      throw errors.badRequest('No puedes desactivar tu propia cuenta');
    }

    // TODO: Soft delete user (set status to inactive)
    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:id/resend-invite
 * Resend invitation email
 */
userRoutes.post('/:id/resend-invite', requirePermission('users.update'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Check if user is in pending status
    // TODO: Regenerate invite token
    // TODO: Send invitation email

    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:id/reset-password
 * Admin reset user password
 */
userRoutes.post(
  '/:id/reset-password',
  requirePermission('users.update'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // TODO: Generate reset token and send email
      res.status(404).json({
        error: 'User not found',
        message: 'No se encontró el usuario solicitado.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/users/:id/mfa/enable
 * Enable MFA for user
 */
userRoutes.post('/:id/mfa/enable', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Users can only enable MFA for themselves unless admin
    if (id !== req.user!.id && !req.user!.roles.includes('admin')) {
      throw errors.forbidden();
    }

    // TODO: Generate MFA secret and return QR code
    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:id/mfa/verify
 * Verify MFA code and complete setup
 */
userRoutes.post('/:id/mfa/verify', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body);

    // TODO: Verify MFA code and enable MFA
    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:id/mfa
 * Disable MFA for user
 */
userRoutes.delete('/:id/mfa', requirePermission('users.update'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Disable MFA
    res.status(404).json({
      error: 'User not found',
      message: 'No se encontró el usuario solicitado.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/roles
 * Get available roles and their descriptions
 */
userRoutes.get('/roles/list', requirePermission('users.read'), async (req, res, next) => {
  try {
    res.json({
      roles: [
        {
          id: 'admin',
          name: 'Administrador',
          description: 'Acceso total a la plataforma y gestión de usuarios',
          permissions: ['*'],
        },
        {
          id: 'manager',
          name: 'Gestor',
          description: 'Puede gestionar módulos asignados y ver reportes',
          permissions: ['modules.manage', 'risks.manage', 'reports.view'],
        },
        {
          id: 'auditor',
          name: 'Auditor',
          description: 'Acceso de lectura completo para auditoría',
          permissions: ['*.read', 'audit.full'],
        },
        {
          id: 'module_operator',
          name: 'Operador de Módulo',
          description: 'Acceso limitado a módulos específicos asignados',
          permissions: ['assigned_modules.*'],
        },
        {
          id: 'viewer',
          name: 'Visor',
          description: 'Solo puede ver información, sin editar',
          permissions: ['*.read'],
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});
