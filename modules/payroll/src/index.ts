/**
 * Payroll Compliance Module
 *
 * This module provides payroll risk detection including:
 * - Overtime violations
 * - Contract expiry warnings
 * - Salary anomaly detection
 */

import type {
  ModuleContext,
  ModuleSDK,
  RiskDetector,
  ApiRoute,
} from '@platform/sdk';
import type { RiskFinding, TimeFrame, ModuleHealth } from '@platform/core';

import { OvertimeDetector } from './detectors/overtime.js';
import { ContractExpiryDetector } from './detectors/contract-expiry.js';
import { SalaryAnomalyDetector } from './detectors/salary-anomaly.js';

// Module configuration type
interface PayrollConfig {
  overtime_threshold_hours: number;
  contract_expiry_warning_days: number;
  salary_anomaly_threshold_percent: number;
}

// Module state
let moduleContext: ModuleContext | null = null;
let detectors: RiskDetector[] = [];

/**
 * Module SDK implementation.
 */
export const PayrollModule: ModuleSDK = {
  /**
   * Register the module with the platform.
   */
  async registerModule(context: ModuleContext): Promise<void> {
    moduleContext = context;
    const config = context.config as PayrollConfig;

    context.logger.info('Initializing Payroll module');

    // Initialize risk detectors
    detectors = [
      new OvertimeDetector(context, config.overtime_threshold_hours),
      new ContractExpiryDetector(context, config.contract_expiry_warning_days),
      new SalaryAnomalyDetector(context, config.salary_anomaly_threshold_percent),
    ];

    // Register detectors with risk engine
    for (const detector of detectors) {
      context.riskEngine.registerDetector(detector);
      context.logger.debug('Registered detector', { detectorId: detector.id });
    }

    // Register API routes
    context.api.registerRoutes(getApiRoutes(context));

    // Subscribe to relevant events
    context.eventBus.subscribe('employee.created', async (payload: unknown) => {
      context.logger.info('Employee created event received', { payload });
      // Could trigger re-detection here
    });

    context.eventBus.subscribe('contract.updated', async (payload: unknown) => {
      context.logger.info('Contract updated event received', { payload });
    });

    context.logger.info('Payroll module initialized successfully');
  },

  /**
   * Get risk findings for a tenant.
   */
  async getRiskFindings(tenantId: string, timeframe: TimeFrame): Promise<RiskFinding[]> {
    if (!moduleContext) {
      throw new Error('Module not initialized');
    }

    moduleContext.logger.debug('Getting risk findings', { tenantId, timeframe });

    const findings: RiskFinding[] = [];

    for (const detector of detectors) {
      const detectorFindings = await detector.detect(tenantId, timeframe);
      findings.push(...detectorFindings);
    }

    moduleContext.logger.info('Risk detection complete', {
      tenantId,
      findingsCount: findings.length,
    });

    return findings;
  },

  /**
   * Get module health status.
   */
  async getModuleHealth(): Promise<ModuleHealth> {
    if (!moduleContext) {
      return {
        module_id: 'payroll',
        status: 'unhealthy',
        message: 'Module not initialized',
        checked_at: new Date().toISOString(),
      };
    }

    const detectorHealthResults = await Promise.all(
      detectors.map(async (d) => ({
        id: d.id,
        healthy: await d.healthCheck(),
      }))
    );

    const allHealthy = detectorHealthResults.every((r) => r.healthy);
    const unhealthyDetectors = detectorHealthResults
      .filter((r) => !r.healthy)
      .map((r) => r.id);

    return {
      module_id: 'payroll',
      status: allHealthy ? 'healthy' : 'degraded',
      message: allHealthy
        ? 'All detectors healthy'
        : `Unhealthy detectors: ${unhealthyDetectors.join(', ')}`,
      checked_at: new Date().toISOString(),
      details: {
        detectors: detectorHealthResults,
      },
    };
  },
};

/**
 * Define API routes for the module.
 */
function getApiRoutes(context: ModuleContext): ApiRoute[] {
  return [
    // GET /api/modules/payroll/employees
    {
      method: 'GET',
      path: '/employees',
      permission: 'payroll.employees.read',
      handler: async (req, res) => {
        const tenantId = req.user.tenant_id;
        const { page = '1', limit = '20', search } = req.query;

        const employees = await context.db.query<{
          id: string;
          name: string;
          email: string;
          department: string;
          status: string;
        }>(
          `SELECT * FROM employees
           WHERE tenant_id = ?
           ${search ? 'AND (name LIKE ? OR email LIKE ?)' : ''}
           ORDER BY name
           LIMIT ? OFFSET ?`,
          search
            ? [tenantId, `%${search}%`, `%${search}%`, Number(limit), (Number(page) - 1) * Number(limit)]
            : [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]
        );

        res.json({
          data: employees,
          meta: { page: Number(page), limit: Number(limit) },
        });
      },
    },

    // GET /api/modules/payroll/employees/:id
    {
      method: 'GET',
      path: '/employees/:id',
      permission: 'payroll.employees.read',
      handler: async (req, res) => {
        const { id } = req.params;
        const employee = await context.db.findById('employees', id);

        if (!employee) {
          res.status(404).json({ error: 'Employee not found' });
          return;
        }

        res.json(employee);
      },
    },

    // POST /api/modules/payroll/employees
    {
      method: 'POST',
      path: '/employees',
      permission: 'payroll.employees.write',
      handler: async (req, res) => {
        const tenantId = req.user.tenant_id;
        const data = req.body as {
          name: string;
          email: string;
          department: string;
          salary: number;
          contract_type: string;
        };

        const employee = await context.db.insert('employees', {
          ...data,
          tenant_id: tenantId,
        });

        // Emit event
        await context.eventBus.emit('employee.created', { employee });

        // Audit log
        await context.audit.log({
          action: 'payroll.employee.created',
          tenant_id: tenantId,
          actor_id: req.user.id,
          target_type: 'employee',
          target_id: employee.id,
          metadata: { name: data.name },
        });

        res.status(201).json(employee);
      },
    },

    // GET /api/modules/payroll/contracts
    {
      method: 'GET',
      path: '/contracts',
      permission: 'payroll.contracts.read',
      handler: async (req, res) => {
        const tenantId = req.user.tenant_id;
        const { status, expiring_soon } = req.query;

        let query = 'SELECT * FROM contracts WHERE tenant_id = ?';
        const params: unknown[] = [tenantId];

        if (status) {
          query += ' AND status = ?';
          params.push(status);
        }

        if (expiring_soon === 'true') {
          query += ' AND end_date <= DATE_ADD(NOW(), INTERVAL 30 DAY)';
        }

        const contracts = await context.db.query(query, params);
        res.json({ data: contracts });
      },
    },

    // GET /api/modules/payroll/overtime
    {
      method: 'GET',
      path: '/overtime',
      permission: 'payroll.read',
      handler: async (req, res) => {
        const tenantId = req.user.tenant_id;
        const { from_date, to_date } = req.query;

        const overtime = await context.db.query(
          `SELECT
            e.id as employee_id,
            e.name as employee_name,
            SUM(t.hours) as total_hours,
            SUM(CASE WHEN t.hours > 8 THEN t.hours - 8 ELSE 0 END) as overtime_hours
           FROM employees e
           JOIN timesheets t ON e.id = t.employee_id
           WHERE e.tenant_id = ?
           AND t.date BETWEEN ? AND ?
           GROUP BY e.id, e.name
           HAVING overtime_hours > 0
           ORDER BY overtime_hours DESC`,
          [tenantId, from_date, to_date]
        );

        res.json({ data: overtime });
      },
    },

    // GET /api/modules/payroll/stats
    {
      method: 'GET',
      path: '/stats',
      permission: 'payroll.read',
      handler: async (req, res) => {
        const tenantId = req.user.tenant_id;

        // Mock stats - in production, query from database
        res.json({
          employees: {
            total: 150,
            active: 142,
            on_leave: 8,
          },
          contracts: {
            permanent: 120,
            temporary: 30,
            expiring_30_days: 5,
          },
          payroll: {
            total_monthly_eur: 450000,
            avg_salary_eur: 3000,
          },
          risks: {
            overtime_violations: 3,
            contract_issues: 5,
            salary_anomalies: 2,
          },
        });
      },
    },
  ];
}

// Export module
export default PayrollModule;
