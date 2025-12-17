"use strict";
/**
 * Risk management routes.
 *
 * This API manages risks/alerts detected by active modules.
 * Currently returns empty data as no modules are active yet.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_js_1 = require("../middleware/auth.js");
exports.riskRoutes = (0, express_1.Router)();
// Validation schemas
const riskFiltersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().default(1),
    limit: zod_1.z.coerce.number().default(20),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    status: zod_1.z.enum(['new', 'acknowledged', 'mitigated', 'resolved', 'false_positive']).optional(),
    category: zod_1.z.enum(['legal', 'payroll', 'security', 'ops', 'finance', 'compliance']).optional(),
    module_id: zod_1.z.string().optional(),
    from_date: zod_1.z.string().optional(),
    to_date: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
const updateRiskSchema = zod_1.z.object({
    status: zod_1.z.enum(['new', 'acknowledged', 'mitigated', 'resolved', 'false_positive']).optional(),
    notes: zod_1.z.string().optional(),
    assigned_to: zod_1.z.string().uuid().optional(),
});
/**
 * GET /api/risks
 * List risks with filters
 * Returns empty array when no modules are active
 */
exports.riskRoutes.get('/', (0, auth_js_1.requirePermission)('risks.read'), async (req, res, next) => {
    try {
        const filters = riskFiltersSchema.parse(req.query);
        // No modules are active - return empty risks
        // When modules are activated, they will emit risks via the event system
        // and those will be stored in the database for retrieval here
        const risks = [];
        res.json({
            data: risks,
            meta: {
                page: filters.page,
                limit: filters.limit,
                total: 0,
                hasMore: false,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/risks/summary
 * Get risk summary stats
 * Returns zeros when no modules are active
 */
exports.riskRoutes.get('/summary', (0, auth_js_1.requirePermission)('risks.read'), async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/risks/:id
 * Get risk details
 */
exports.riskRoutes.get('/:id', (0, auth_js_1.requirePermission)('risks.read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // TODO: Query risk from database when modules are active
        // For now, return 404 as no risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/risks/:id
 * Update risk status
 */
exports.riskRoutes.patch('/:id', (0, auth_js_1.requirePermission)('risks.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = updateRiskSchema.parse(req.body);
        // TODO: Update risk in database when risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/risks/:id/acknowledge
 * Acknowledge a risk
 */
exports.riskRoutes.post('/:id/acknowledge', (0, auth_js_1.requirePermission)('risks.acknowledge'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // TODO: Update risk status to acknowledged when risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/risks/:id/resolve
 * Resolve a risk
 */
exports.riskRoutes.post('/:id/resolve', (0, auth_js_1.requirePermission)('risks.resolve'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes, resolution } = zod_1.z
            .object({
            notes: zod_1.z.string().optional(),
            resolution: zod_1.z.string().min(10),
        })
            .parse(req.body);
        // TODO: Update risk status to resolved when risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/risks/:id/false-positive
 * Mark risk as false positive
 */
exports.riskRoutes.post('/:id/false-positive', (0, auth_js_1.requirePermission)('risks.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = zod_1.z
            .object({
            reason: zod_1.z.string().min(10),
        })
            .parse(req.body);
        // TODO: Update risk status when risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/risks/:id/escalate
 * Escalate a risk
 */
exports.riskRoutes.post('/:id/escalate', (0, auth_js_1.requirePermission)('risks.escalate'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { to_user_id, notes } = zod_1.z
            .object({
            to_user_id: zod_1.z.string().uuid(),
            notes: zod_1.z.string().optional(),
        })
            .parse(req.body);
        // TODO: Create escalation when risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/risks/:id/evidence
 * Get evidence for a risk
 */
exports.riskRoutes.get('/:id/evidence', (0, auth_js_1.requirePermission)('risks.read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // TODO: Query evidence from database when risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/risks/:id/history
 * Get audit history for a risk
 */
exports.riskRoutes.get('/:id/history', (0, auth_js_1.requirePermission)('risks.read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // TODO: Query history from database when risks exist
        res.status(404).json({
            error: 'Risk not found',
            message: 'No hay riesgos registrados. Activa módulos para comenzar a detectar riesgos.',
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=risks.js.map