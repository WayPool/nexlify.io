/**
 * Anomaly Detection Engine
 *
 * Analyzes transactions against a set of rules to detect
 * suspicious or unusual patterns.
 */
import { differenceInDays, parseISO, getHours } from 'date-fns';
// High-risk countries for AML (simplified list)
const HIGH_RISK_COUNTRIES = [
    'AF', 'BY', 'CF', 'CD', 'CU', 'GN', 'GW', 'HT', 'IR', 'IQ', 'LB', 'LY',
    'ML', 'MM', 'NI', 'KP', 'PK', 'RU', 'SO', 'SS', 'SD', 'SY', 'VE', 'YE', 'ZW'
];
// Reporting threshold (for structuring detection) - 10,000 EUR in EU
const REPORTING_THRESHOLD = 10000;
export class AnomalyEngine {
    rules;
    history;
    alertStore;
    constructor(rules, history, alertStore) {
        this.rules = rules.filter((r) => r.enabled);
        this.history = history;
        this.alertStore = alertStore;
    }
    /**
     * Analyze a single transaction for anomalies
     */
    async analyzeTransaction(transaction, tenantId) {
        const flags = [];
        let totalScore = 0;
        // Run built-in detectors
        const builtInFlags = await this.runBuiltInDetectors(transaction);
        flags.push(...builtInFlags);
        // Run custom rules
        const ruleFlags = await this.runCustomRules(transaction, tenantId);
        flags.push(...ruleFlags);
        // Calculate anomaly score (0-100)
        totalScore = this.calculateAnomalyScore(flags);
        // Create alerts for high severity flags
        await this.createAlertsIfNeeded(transaction, flags, tenantId);
        return { flags, score: totalScore };
    }
    /**
     * Analyze multiple transactions (batch)
     */
    async analyzeTransactions(transactions, tenantId) {
        const results = new Map();
        for (const tx of transactions) {
            const result = await this.analyzeTransaction(tx, tenantId);
            results.set(tx.id, result);
        }
        return results;
    }
    /**
     * Run built-in anomaly detectors
     */
    async runBuiltInDetectors(tx) {
        const flags = [];
        // 1. Unusual Amount Detection
        const unusualAmountFlag = await this.detectUnusualAmount(tx);
        if (unusualAmountFlag)
            flags.push(unusualAmountFlag);
        // 2. Unusual Time Detection
        const unusualTimeFlag = this.detectUnusualTime(tx);
        if (unusualTimeFlag)
            flags.push(unusualTimeFlag);
        // 3. Unknown Counterparty Detection
        const unknownCounterpartyFlag = await this.detectUnknownCounterparty(tx);
        if (unknownCounterpartyFlag)
            flags.push(unknownCounterpartyFlag);
        // 4. High-Risk Country Detection
        const highRiskCountryFlag = this.detectHighRiskCountry(tx);
        if (highRiskCountryFlag)
            flags.push(highRiskCountryFlag);
        // 5. Round Amount Detection (potential structuring)
        const roundAmountFlag = this.detectRoundAmount(tx);
        if (roundAmountFlag)
            flags.push(roundAmountFlag);
        // 6. Structuring Detection (just below threshold)
        const structuringFlag = this.detectStructuring(tx);
        if (structuringFlag)
            flags.push(structuringFlag);
        // 7. Dormant Account Activation
        const dormantFlag = await this.detectDormantActivation(tx);
        if (dormantFlag)
            flags.push(dormantFlag);
        // 8. Duplicate Detection
        const duplicateFlag = await this.detectDuplicate(tx);
        if (duplicateFlag)
            flags.push(duplicateFlag);
        return flags;
    }
    /**
     * Detect unusually large or small amounts compared to history
     */
    async detectUnusualAmount(tx) {
        const avgAmount = await this.history.getAverageAmount(tx.accountId, tx.direction);
        if (avgAmount === 0)
            return null; // No history
        const deviation = tx.amount / avgAmount;
        // Flag if more than 5x the average
        if (deviation > 5) {
            return {
                type: 'unusual_amount',
                severity: deviation > 10 ? 'high' : 'medium',
                message: `Monto ${deviation.toFixed(1)}x mayor que el promedio historico (${avgAmount.toFixed(2)} EUR)`,
                ruleId: 'builtin:unusual_amount',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Detect transactions at unusual hours
     */
    detectUnusualTime(tx) {
        const hour = getHours(parseISO(tx.bookingDate));
        // Business hours are typically 8-20
        // Flag transactions between 1-5 AM
        if (hour >= 1 && hour <= 5) {
            return {
                type: 'unusual_time',
                severity: 'low',
                message: `Transaccion registrada a las ${hour}:00 - fuera del horario habitual`,
                ruleId: 'builtin:unusual_time',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Detect transactions with unknown counterparties
     */
    async detectUnknownCounterparty(tx) {
        if (!tx.counterpartyName && !tx.counterpartyIban)
            return null;
        const knownParties = await this.history.getKnownCounterparties(tx.accountId);
        const counterpartyId = tx.counterpartyIban || tx.counterpartyName || '';
        if (knownParties.length > 0 && !knownParties.includes(counterpartyId)) {
            return {
                type: 'unknown_counterparty',
                severity: tx.amount > 1000 ? 'medium' : 'low',
                message: `Primera transaccion con: ${tx.counterpartyName || tx.counterpartyIban}`,
                ruleId: 'builtin:unknown_counterparty',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Detect transactions involving high-risk countries
     */
    detectHighRiskCountry(tx) {
        const iban = tx.counterpartyIban;
        if (!iban)
            return null;
        // Extract country code from IBAN (first 2 characters)
        const countryCode = iban.substring(0, 2).toUpperCase();
        if (HIGH_RISK_COUNTRIES.includes(countryCode)) {
            return {
                type: 'high_risk_country',
                severity: 'high',
                message: `Transaccion con pais de alto riesgo: ${countryCode}`,
                ruleId: 'builtin:high_risk_country',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Detect suspiciously round amounts
     */
    detectRoundAmount(tx) {
        // Only flag larger amounts
        if (tx.amount < 1000)
            return null;
        // Check if it's a round number (ends in 000)
        const isRound = tx.amount % 1000 === 0;
        if (isRound && tx.amount >= 5000) {
            return {
                type: 'round_amount',
                severity: 'low',
                message: `Monto exacto sospechoso: ${tx.amount.toLocaleString('es-ES')} EUR`,
                ruleId: 'builtin:round_amount',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Detect potential structuring (amounts just below reporting threshold)
     */
    detectStructuring(tx) {
        // Check if amount is suspiciously close to threshold (within 15%)
        const lowerBound = REPORTING_THRESHOLD * 0.85;
        const upperBound = REPORTING_THRESHOLD * 0.99;
        if (tx.amount >= lowerBound && tx.amount <= upperBound) {
            return {
                type: 'structuring',
                severity: 'high',
                message: `Monto justo por debajo del umbral de reporte (${tx.amount.toLocaleString('es-ES')} EUR)`,
                ruleId: 'builtin:structuring',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Detect sudden activity on dormant accounts
     */
    async detectDormantActivation(tx) {
        const lastActivity = await this.history.getLastActivityDate(tx.accountId);
        if (!lastActivity)
            return null;
        const daysSinceLastActivity = differenceInDays(new Date(), parseISO(lastActivity));
        // Flag if no activity in last 90 days
        if (daysSinceLastActivity > 90) {
            return {
                type: 'dormant_activation',
                severity: 'medium',
                message: `Cuenta sin actividad por ${daysSinceLastActivity} dias antes de esta transaccion`,
                ruleId: 'builtin:dormant_activation',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Detect potential duplicate transactions
     */
    async detectDuplicate(tx) {
        // Get recent transactions
        const recentTxs = await this.history.getTransactionsByAccount(tx.accountId, 7);
        // Look for transactions with same amount, counterparty, and within 24 hours
        const duplicates = recentTxs.filter((other) => {
            if (other.id === tx.id)
                return false;
            if (other.amount !== tx.amount)
                return false;
            if (other.direction !== tx.direction)
                return false;
            if (other.counterpartyIban !== tx.counterpartyIban)
                return false;
            const daysDiff = Math.abs(differenceInDays(parseISO(tx.bookingDate), parseISO(other.bookingDate)));
            return daysDiff <= 1;
        });
        if (duplicates.length > 0) {
            return {
                type: 'duplicate',
                severity: 'medium',
                message: `Posible transaccion duplicada (${duplicates.length} similar(es) en las ultimas 24h)`,
                ruleId: 'builtin:duplicate',
                detectedAt: new Date().toISOString(),
            };
        }
        return null;
    }
    /**
     * Run custom rules defined by tenant
     */
    async runCustomRules(tx, tenantId) {
        const flags = [];
        // Filter rules for this tenant (or global rules)
        const applicableRules = this.rules.filter((rule) => rule.tenantId === null || rule.tenantId === tenantId);
        for (const rule of applicableRules) {
            if (this.evaluateRule(rule, tx)) {
                flags.push({
                    type: rule.type,
                    severity: rule.severity,
                    message: rule.description,
                    ruleId: rule.id,
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        return flags;
    }
    /**
     * Evaluate a single rule against a transaction
     */
    evaluateRule(rule, tx) {
        // All conditions must match (AND logic)
        return rule.conditions.every((condition) => this.evaluateCondition(condition, tx));
    }
    /**
     * Evaluate a single condition
     */
    evaluateCondition(condition, tx) {
        const fieldValue = this.getFieldValue(tx, condition.field);
        const conditionValue = condition.value;
        switch (condition.operator) {
            case 'eq':
                return fieldValue === conditionValue;
            case 'neq':
                return fieldValue !== conditionValue;
            case 'gt':
                return Number(fieldValue) > Number(conditionValue);
            case 'gte':
                return Number(fieldValue) >= Number(conditionValue);
            case 'lt':
                return Number(fieldValue) < Number(conditionValue);
            case 'lte':
                return Number(fieldValue) <= Number(conditionValue);
            case 'contains':
                return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
            case 'not_contains':
                return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
            case 'in':
                return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
            case 'not_in':
                return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
            case 'regex':
                return new RegExp(String(conditionValue), 'i').test(String(fieldValue));
            case 'between':
                if (Array.isArray(conditionValue) && conditionValue.length === 2) {
                    const num = Number(fieldValue);
                    return num >= Number(conditionValue[0]) && num <= Number(conditionValue[1]);
                }
                return false;
            default:
                return false;
        }
    }
    /**
     * Get field value from transaction using dot notation
     */
    getFieldValue(tx, field) {
        const parts = field.split('.');
        let value = tx;
        for (const part of parts) {
            if (value === null || value === undefined)
                return undefined;
            value = value[part];
        }
        return value;
    }
    /**
     * Calculate overall anomaly score (0-100)
     */
    calculateAnomalyScore(flags) {
        if (flags.length === 0)
            return 0;
        const severityWeights = {
            low: 10,
            medium: 25,
            high: 50,
            critical: 100,
        };
        const totalWeight = flags.reduce((sum, flag) => sum + severityWeights[flag.severity], 0);
        // Cap at 100
        return Math.min(100, totalWeight);
    }
    /**
     * Create alerts for high severity flags
     */
    async createAlertsIfNeeded(tx, flags, tenantId) {
        const highSeverityFlags = flags.filter((f) => f.severity === 'high' || f.severity === 'critical');
        for (const flag of highSeverityFlags) {
            await this.alertStore.createAlert({
                tenantId,
                transactionId: tx.id,
                accountId: tx.accountId,
                type: flag.type,
                severity: flag.severity,
                title: this.getAlertTitle(flag.type),
                description: flag.message,
                status: 'open',
                assignedTo: null,
                resolvedBy: null,
                resolvedAt: null,
                resolution: null,
            });
        }
    }
    /**
     * Get human-readable alert title
     */
    getAlertTitle(type) {
        const titles = {
            unusual_amount: 'Monto Inusual Detectado',
            unusual_time: 'Transaccion en Horario Atipico',
            unusual_frequency: 'Frecuencia de Transacciones Anormal',
            unknown_counterparty: 'Contraparte Desconocida',
            high_risk_country: 'Transaccion con Pais de Alto Riesgo',
            round_amount: 'Monto Sospechosamente Redondo',
            structuring: 'Posible Fraccionamiento',
            velocity: 'Movimiento Rapido de Fondos',
            dormant_activation: 'Activacion de Cuenta Inactiva',
            category_mismatch: 'Categoria No Coincide con Perfil',
            duplicate: 'Posible Transaccion Duplicada',
            manual_flag: 'Marcado Manualmente',
        };
        return titles[type] || 'Anomalia Detectada';
    }
}
/**
 * Create default anomaly rules
 */
export function getDefaultRules() {
    return [
        {
            name: 'Transacciones mayores a 50,000 EUR',
            description: 'Alerta para transacciones superiores a 50,000 EUR',
            type: 'unusual_amount',
            enabled: true,
            severity: 'high',
            tenantId: null,
            conditions: [{ field: 'amount', operator: 'gt', value: 50000 }],
            actions: [{ type: 'alert', config: {} }],
        },
        {
            name: 'Transacciones internacionales grandes',
            description: 'Transacciones internacionales superiores a 10,000 EUR',
            type: 'high_risk_country',
            enabled: true,
            severity: 'medium',
            tenantId: null,
            conditions: [
                { field: 'amount', operator: 'gt', value: 10000 },
                { field: 'counterpartyIban', operator: 'regex', value: '^(?!ES)' },
            ],
            actions: [{ type: 'flag', config: {} }],
        },
        {
            name: 'Pagos a criptomonedas',
            description: 'Detecta pagos a exchanges de criptomonedas conocidos',
            type: 'category_mismatch',
            enabled: true,
            severity: 'medium',
            tenantId: null,
            conditions: [
                {
                    field: 'counterpartyName',
                    operator: 'regex',
                    value: 'coinbase|binance|kraken|bitstamp|bitfinex|crypto',
                },
            ],
            actions: [{ type: 'flag', config: {} }],
        },
    ];
}
/**
 * Create an anomaly engine instance
 */
export function createAnomalyEngine(rules, history, alertStore) {
    return new AnomalyEngine(rules, history, alertStore);
}
//# sourceMappingURL=anomaly-engine.js.map