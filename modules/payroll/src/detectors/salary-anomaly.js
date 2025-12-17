"use strict";
/**
 * Salary Anomaly Detector
 *
 * Detects unusual salary patterns that may indicate compliance issues.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryAnomalyDetector = void 0;
const sdk_1 = require("@platform/sdk");
class SalaryAnomalyDetector {
    id = 'salary_anomaly_detector';
    name_i18n_key = 'payroll.detectors.salary_anomaly.name';
    categories = ['payroll', 'finance', 'compliance'];
    context;
    thresholdPercent;
    constructor(context, thresholdPercent = 15) {
        this.context = context;
        this.thresholdPercent = thresholdPercent;
    }
    async detect(tenantId, timeframe) {
        this.context.logger.debug('Running salary anomaly detection', { tenantId, timeframe });
        const findings = [];
        // Check 1: Salaries significantly below department average
        const belowAverageResults = await this.detectBelowAverage(tenantId);
        findings.push(...belowAverageResults);
        // Check 2: Recent large salary changes
        const largeChangesResults = await this.detectLargeChanges(tenantId, timeframe);
        findings.push(...largeChangesResults);
        // Check 3: Gender pay gap analysis
        const payGapResults = await this.detectPayGap(tenantId);
        findings.push(...payGapResults);
        this.context.logger.info('Salary anomaly detection complete', {
            tenantId,
            findingsCount: findings.length,
        });
        return findings;
    }
    async healthCheck() {
        try {
            await this.context.db.query('SELECT 1', []);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Detect employees with salaries significantly below department average.
     */
    async detectBelowAverage(tenantId) {
        const results = await this.context.db.query(`SELECT
        e.id as employee_id,
        e.name as employee_name,
        e.department,
        e.role,
        c.monthly_salary as salary,
        dept.avg_salary as dept_avg_salary,
        ((dept.avg_salary - c.monthly_salary) / dept.avg_salary * 100) as deviation_percent
       FROM employees e
       JOIN contracts c ON e.id = c.employee_id AND c.status = 'active'
       JOIN (
         SELECT e2.department, e2.role, AVG(c2.monthly_salary) as avg_salary
         FROM employees e2
         JOIN contracts c2 ON e2.id = c2.employee_id AND c2.status = 'active'
         WHERE e2.tenant_id = ?
         GROUP BY e2.department, e2.role
       ) dept ON e.department = dept.department AND e.role = dept.role
       WHERE e.tenant_id = ?
       AND ((dept.avg_salary - c.monthly_salary) / dept.avg_salary * 100) > ?`, [tenantId, tenantId, this.thresholdPercent]);
        return results.map((r) => (0, sdk_1.createRiskFinding)({
            tenant_id: tenantId,
            module_id: 'payroll',
            detector_id: this.id,
            title_i18n_key: 'payroll.risks.salary_below_average.title',
            description_i18n_key: 'payroll.risks.salary_below_average.description',
            severity: r.deviation_percent > 30 ? 'high' : 'medium',
            category: 'compliance',
            likelihood: 0.8,
            impact_eur: this.calculatePayEquityRisk(r.salary, r.dept_avg_salary),
            entities: [
                { type: 'employee', id: r.employee_id, name: r.employee_name },
                { type: 'department', id: r.department, name: r.department },
            ],
            evidence: [
                {
                    type: 'analysis',
                    ref: `salary_analysis_${r.employee_id}`,
                    label: `${r.deviation_percent.toFixed(1)}% below average`,
                },
            ],
            recommended_actions_i18n_key: 'payroll.risks.salary_below_average.actions',
            detected_at: new Date().toISOString(),
        }));
    }
    /**
     * Detect large salary changes that may indicate issues.
     */
    async detectLargeChanges(tenantId, timeframe) {
        const results = await this.context.db.query(`SELECT
        e.id as employee_id,
        e.name as employee_name,
        sh.old_salary,
        sh.new_salary,
        ((sh.new_salary - sh.old_salary) / sh.old_salary * 100) as change_percent,
        sh.change_date
       FROM salary_history sh
       JOIN employees e ON sh.employee_id = e.id
       WHERE e.tenant_id = ?
       AND sh.change_date BETWEEN ? AND ?
       AND ABS((sh.new_salary - sh.old_salary) / sh.old_salary * 100) > ?`, [tenantId, timeframe.from, timeframe.to, this.thresholdPercent * 2]);
        return results.map((r) => (0, sdk_1.createRiskFinding)({
            tenant_id: tenantId,
            module_id: 'payroll',
            detector_id: this.id,
            title_i18n_key: 'payroll.risks.large_salary_change.title',
            description_i18n_key: 'payroll.risks.large_salary_change.description',
            severity: Math.abs(r.change_percent) > 50 ? 'high' : 'medium',
            category: 'finance',
            likelihood: 0.7,
            impact_eur: Math.abs(r.new_salary - r.old_salary) * 12, // Annual impact
            entities: [{ type: 'employee', id: r.employee_id, name: r.employee_name }],
            evidence: [
                {
                    type: 'salary_change',
                    ref: `salary_change_${r.employee_id}_${r.change_date}`,
                    label: `${r.change_percent > 0 ? '+' : ''}${r.change_percent.toFixed(1)}% change`,
                },
            ],
            recommended_actions_i18n_key: 'payroll.risks.large_salary_change.actions',
            detected_at: new Date().toISOString(),
        }));
    }
    /**
     * Detect gender pay gaps.
     */
    async detectPayGap(tenantId) {
        const results = await this.context.db.query(`SELECT
        e.department,
        e.role,
        AVG(CASE WHEN e.gender = 'M' THEN c.monthly_salary END) as male_avg,
        AVG(CASE WHEN e.gender = 'F' THEN c.monthly_salary END) as female_avg,
        ((AVG(CASE WHEN e.gender = 'M' THEN c.monthly_salary END) -
          AVG(CASE WHEN e.gender = 'F' THEN c.monthly_salary END)) /
          AVG(CASE WHEN e.gender = 'M' THEN c.monthly_salary END) * 100) as gap_percent
       FROM employees e
       JOIN contracts c ON e.id = c.employee_id AND c.status = 'active'
       WHERE e.tenant_id = ?
       AND e.gender IN ('M', 'F')
       GROUP BY e.department, e.role
       HAVING male_avg IS NOT NULL
       AND female_avg IS NOT NULL
       AND ABS(gap_percent) > ?`, [tenantId, this.thresholdPercent]);
        return results.map((r) => (0, sdk_1.createRiskFinding)({
            tenant_id: tenantId,
            module_id: 'payroll',
            detector_id: this.id,
            title_i18n_key: 'payroll.risks.gender_pay_gap.title',
            description_i18n_key: 'payroll.risks.gender_pay_gap.description',
            severity: Math.abs(r.gap_percent) > 25 ? 'critical' : r.gap_percent > 15 ? 'high' : 'medium',
            category: 'compliance',
            likelihood: 0.95,
            impact_eur: this.calculatePayGapLiability(r.gap_percent),
            entities: [
                { type: 'department', id: r.department, name: r.department },
                { type: 'role', id: r.role, name: r.role },
            ],
            evidence: [
                {
                    type: 'analysis',
                    ref: `pay_gap_${r.department}_${r.role}`,
                    label: `${r.gap_percent.toFixed(1)}% pay gap`,
                },
            ],
            recommended_actions_i18n_key: 'payroll.risks.gender_pay_gap.actions',
            detected_at: new Date().toISOString(),
        }));
    }
    calculatePayEquityRisk(salary, avgSalary) {
        const annualDifference = (avgSalary - salary) * 12;
        // Potential back-pay plus legal costs
        return annualDifference * 2 + 5000;
    }
    calculatePayGapLiability(gapPercent) {
        // Based on Spanish equality law fines
        if (Math.abs(gapPercent) > 25) {
            return 187515; // Severe violation
        }
        else if (Math.abs(gapPercent) > 15) {
            return 62500; // Serious violation
        }
        return 6250; // Minor violation
    }
}
exports.SalaryAnomalyDetector = SalaryAnomalyDetector;
//# sourceMappingURL=salary-anomaly.js.map