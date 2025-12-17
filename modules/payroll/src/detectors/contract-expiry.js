"use strict";
/**
 * Contract Expiry Detector
 *
 * Detects contracts that are about to expire without renewal.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractExpiryDetector = void 0;
const sdk_1 = require("@platform/sdk");
class ContractExpiryDetector {
    id = 'contract_expiry_detector';
    name_i18n_key = 'payroll.detectors.contract_expiry.name';
    categories = ['payroll', 'legal'];
    context;
    warningDays;
    constructor(context, warningDays = 30) {
        this.context = context;
        this.warningDays = warningDays;
    }
    async detect(tenantId, _timeframe) {
        this.context.logger.debug('Running contract expiry detection', { tenantId });
        // Query contracts expiring soon
        const expiringContracts = await this.context.db.query(`SELECT
        c.id as contract_id,
        e.id as employee_id,
        e.name as employee_name,
        c.contract_type,
        c.end_date,
        DATEDIFF(c.end_date, CURDATE()) as days_until_expiry,
        c.monthly_salary
       FROM contracts c
       JOIN employees e ON c.employee_id = e.id
       WHERE e.tenant_id = ?
       AND c.status = 'active'
       AND c.end_date IS NOT NULL
       AND c.end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND NOT EXISTS (
         SELECT 1 FROM contracts c2
         WHERE c2.employee_id = c.employee_id
         AND c2.start_date > c.end_date
       )`, [tenantId, this.warningDays]);
        const findings = [];
        for (const contract of expiringContracts) {
            // Calculate severity based on days until expiry
            let severity;
            if (contract.days_until_expiry <= 7) {
                severity = 'critical';
            }
            else if (contract.days_until_expiry <= 14) {
                severity = 'high';
            }
            else if (contract.days_until_expiry <= 21) {
                severity = 'medium';
            }
            else {
                severity = 'low';
            }
            // Calculate impact (potential severance/replacement costs)
            const impact = this.calculateImpact(contract.monthly_salary, contract.contract_type, contract.days_until_expiry);
            findings.push((0, sdk_1.createRiskFinding)({
                tenant_id: tenantId,
                module_id: 'payroll',
                detector_id: this.id,
                title_i18n_key: 'payroll.risks.contract_expiry.title',
                description_i18n_key: 'payroll.risks.contract_expiry.description',
                severity,
                category: 'legal',
                likelihood: 0.95, // Very high if no renewal exists
                impact_eur: impact,
                entities: [
                    { type: 'employee', id: contract.employee_id, name: contract.employee_name },
                    { type: 'contract', id: contract.contract_id },
                ],
                evidence: [
                    {
                        type: 'document',
                        ref: `contract_${contract.contract_id}`,
                        label: `Contract expires ${contract.end_date}`,
                    },
                ],
                recommended_actions_i18n_key: 'payroll.risks.contract_expiry.actions',
                detected_at: new Date().toISOString(),
            }));
        }
        this.context.logger.info('Contract expiry detection complete', {
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
     * Calculate potential impact of contract expiry.
     * Includes potential severance, hiring costs, productivity loss.
     */
    calculateImpact(monthlySalary, contractType, daysUntilExpiry) {
        let baseCost = monthlySalary * 2; // Hiring replacement cost
        // Add urgency premium if expiring very soon
        if (daysUntilExpiry <= 7) {
            baseCost *= 1.5;
        }
        // Temporary contracts may have conversion obligations
        if (contractType === 'temporary') {
            baseCost += monthlySalary * 0.5; // Potential conversion liability
        }
        return Math.round(baseCost);
    }
}
exports.ContractExpiryDetector = ContractExpiryDetector;
//# sourceMappingURL=contract-expiry.js.map