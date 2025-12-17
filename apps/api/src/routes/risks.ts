/**
 * Risk management routes.
 *
 * This API manages risks/alerts detected by active modules.
 * Currently returns empty data as no modules are active yet.
 */

import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '../middleware/auth.js';
import type { RiskCategory, RiskSeverity, RiskStatus } from '@platform/core';

export const riskRoutes = Router();

// Validation schemas
const riskFiltersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['new', 'acknowledged', 'mitigated', 'resolved', 'false_positive']).optional(),
  category: z.enum(['legal', 'payroll', 'security', 'ops', 'finance', 'compliance']).optional(),
  module_id: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  search: z.string().optional(),
});

const updateRiskSchema = z.object({
  status: z.enum(['new', 'acknowledged', 'mitigated', 'resolved', 'false_positive']).optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

/**
 * GET /api/risks
 * List risks with filters
 * Returns empty array when no modules are active
 */
riskRoutes.get('/', requirePermission('risks.read'), async (req, res, next) => {
  try {
    const filters = riskFiltersSchema.parse(req.query);

    // No modules are active - return empty risks
    // When modules are activated, they will emit risks via the event system
    // and those will be stored in the database for retrieval here
    const risks: unknown[] = [];

    res.json({
      data: risks,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total: 0,
        hasMore: false,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/risks/summary
 * Get risk summary stats
 * Returns zeros when no modules are active
 */
riskRoutes.get('/summary', requirePermission('risks.read'), async (req, res, next) => {
  try {
    // No modules are active - return zero stats
    res.json({
      total: 0,
      active: 0,
      total_exposure_eur: 0,
      by_severity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      by_category: {
        legal: 0,
        payroll: 0,
        security: 0,
        ops: 0,
        finance: 0,
        compliance: 0,
      },
      by_status: {
        new: 0,
        acknowledged: 0,
        mitigated: 0,
        resolved: 0,
        false_positive: 0,
      },
      trend: {
        last_7_days: [0, 0, 0, 0, 0, 0, 0],
        last_30_days: 0,
        change_percentage: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/risks/:id
 * Get risk details
 */
riskRoutes.get('/:id', requirePermission('risks.read'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Query risk from database when modules are active
    // For now, return 404 as no risks exist
    res.status(404).json({
      error: 'Risk not found',
      message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/risks/:id
 * Update risk status
 */
riskRoutes.patch('/:id', requirePermission('risks.update'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateRiskSchema.parse(req.body);

    // TODO: Update risk in database when risks exist
    res.status(404).json({
      error: 'Risk not found',
      message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/risks/:id/acknowledge
 * Acknowledge a risk
 */
riskRoutes.post(
  '/:id/acknowledge',
  requirePermission('risks.acknowledge'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // TODO: Update risk status to acknowledged when risks exist
      res.status(404).json({
        error: 'Risk not found',
        message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/risks/:id/resolve
 * Resolve a risk
 */
riskRoutes.post(
  '/:id/resolve',
  requirePermission('risks.resolve'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { notes, resolution } = z
        .object({
          notes: z.string().optional(),
          resolution: z.string().min(10),
        })
        .parse(req.body);

      // TODO: Update risk status to resolved when risks exist
      res.status(404).json({
        error: 'Risk not found',
        message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/risks/:id/false-positive
 * Mark risk as false positive
 */
riskRoutes.post(
  '/:id/false-positive',
  requirePermission('risks.update'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = z
        .object({
          reason: z.string().min(10),
        })
        .parse(req.body);

      // TODO: Update risk status when risks exist
      res.status(404).json({
        error: 'Risk not found',
        message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/risks/:id/escalate
 * Escalate a risk
 */
riskRoutes.post(
  '/:id/escalate',
  requirePermission('risks.escalate'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { to_user_id, notes } = z
        .object({
          to_user_id: z.string().uuid(),
          notes: z.string().optional(),
        })
        .parse(req.body);

      // TODO: Create escalation when risks exist
      res.status(404).json({
        error: 'Risk not found',
        message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/risks/:id/evidence
 * Get evidence for a risk
 */
riskRoutes.get('/:id/evidence', requirePermission('risks.read'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Query evidence from database when risks exist
    res.status(404).json({
      error: 'Risk not found',
      message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/risks/:id/history
 * Get audit history for a risk
 */
riskRoutes.get('/:id/history', requirePermission('risks.read'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Query history from database when risks exist
    res.status(404).json({
      error: 'Risk not found',
      message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
    });
  } catch (error) {
    next(error);
  }
});
