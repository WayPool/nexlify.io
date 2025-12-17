"use strict";
/**
 * Overtime Violation Detector
 *
 * Detects employees who have exceeded overtime thresholds.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OvertimeDetector = void 0;
const sdk_1 = require("@platform/sdk");
class OvertimeDetector {
    id = 'overtime_detector';
    name_i18n_key = 'payroll.detectors.overtime.name';
    categories = ['payroll', 'compliance'];
    context;
    thresholdHours;
    constructor(context, thresholdHours = 40) {
        this.context = context;
        this.thresholdHours = thresholdHours;
    }
    async detect(tenantId, timeframe) {
        this.context.logger.debug('Running overtime detection', { tenantId, timeframe });
        // Query employees with excessive overtime
        const overtimeData = await this.context.db.query(`SELECT
        e.id as employee_id,
        e.name as employee_name,
        e.department,
        SUM(t.hours) as total_hours,
        SUM(CASE WHEN t.hours > 8 THEN t.hours - 8 ELSE 0 END) as overtime_hours
       FROM employees e
       JOIN timesheets t ON e.id = t.employee_id
       WHERE e.tenant_id = ?
       AND t.date BETWEEN ? AND ?
       GROUP BY e.id, e.name, e.department
       HAVING total_hours > ?`, [tenantId, timeframe.from, timeframe.to, this.thresholdHours]);
        const findings = [];
        for (const record of overtimeData) {
            const overtimePercentage = ((record.total_hours - this.thresholdHours) / this.thresholdHours) * 100;
            // Calculate severity based on overtime percentage
            let severity;
            if (overtimePercentage > 50) {
                severity = 'critical';
            }
            else if (overtimePercentage > 30) {
                severity = 'high';
            }
            else if (overtimePercentage > 15) {
                severity = 'medium';
            }
            else {
                severity = 'low';
            }
            // Estimate potential fine based on Spanish labor law
            const estimatedImpact = this.calculatePotentialFine(record.overtime_hours);
            findings.push((0, sdk_1.createRiskFinding)({
                tenant_id: tenantId,
                module_id: 'payroll',
                detector_id: this.id,
                title_i18n_key: 'payroll.risks.overtime_violation.title',
                description_i18n_key: 'payroll.risks.overtime_violation.description',
                severity,
                category: 'payroll',
                likelihood: 0.9, // High likelihood if detected
                impact_eur: estimatedImpact,
                entities: [
                    { type: 'employee', id: record.employee_id, name: record.employee_name },
                    { type: 'department', id: record.department, name: record.department },
                ],
                evidence: [
                    {
                        type: 'timesheet',
                        ref: `timesheet_${record.employee_id}_${timeframe.from}_${timeframe.to}`,
                        label: `${record.total_hours} hours worked`,
                    },
                ],
                recommended_actions_i18n_key: 'payroll.risks.overtime_violation.actions',
                detected_at: new Date().toISOString(),
            }));
        }
        this.context.logger.info('Overtime detection complete', {
            tenantId,
            findingsCount: findings.length,
        });
        return findings;
    }
    async healthCheck() {
        try {
            // Verify database connectivity
            await this.context.db.query('SELECT 1', []);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Calculate potential fine based on Spanish labor law.
     * Fines range from 626€ to 6,250€ per violation.
     */
    calculatePotentialFine(overtimeHours) {
        if (overtimeHours > 40) {
            return 6250; // Severe violation
        }
        else if (overtimeHours > 20) {
            return 3125; // Moderate violation
        }
        else {
            return 626; // Minor violation
        }
    }
}
exports.OvertimeDetector = OvertimeDetector;
//# sourceMappingURL=overtime.js.map