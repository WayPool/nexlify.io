# Module SDK Documentation

This document defines the contracts and interfaces that all modules must implement.

## Overview

Modules are installable extensions that add business-specific functionality to the Core platform. Each module:

- Has its own isolated database namespace
- Emits events with its own prefix
- Provides risk detectors
- Extends the UI with routes/widgets
- Never directly imports Core internals

---

## Module Manifest

Every module MUST have a `module.json` at its root:

```json
{
  "id": "payroll",
  "version": "1.0.0",
  "name_i18n_key": "modules.payroll.name",
  "description_i18n_key": "modules.payroll.description",
  "author": "Core Team",
  "license": "proprietary",

  "permissions": [
    "module:payroll:employees:read",
    "module:payroll:employees:write",
    "module:payroll:payslips:read",
    "module:payroll:risks:manage"
  ],

  "policies": [
    {
      "name": "payroll_manager_access",
      "type": "abac",
      "rules": {
        "department": ["hr", "finance"],
        "level": ["manager", "admin"]
      }
    }
  ],

  "db_migrations_path": "./migrations",

  "risk_providers": [
    "ContractRiskDetector",
    "OvertimeRiskDetector",
    "IRPFRiskDetector"
  ],

  "ui_extensions": {
    "routes": [
      {
        "path": "/modules/payroll",
        "component": "PayrollDashboard",
        "permission": "module:payroll:employees:read"
      },
      {
        "path": "/modules/payroll/employees",
        "component": "EmployeeList",
        "permission": "module:payroll:employees:read"
      }
    ],
    "widgets": [
      {
        "id": "payroll-summary",
        "component": "PayrollSummaryWidget",
        "slots": ["dashboard-main", "tenant-overview"]
      }
    ],
    "menu_items": [
      {
        "label_i18n_key": "modules.payroll.menu.main",
        "icon": "users",
        "path": "/modules/payroll",
        "permission": "module:payroll:employees:read"
      }
    ]
  },

  "dependencies": {
    "core": ">=1.0.0"
  },

  "config_schema": {
    "type": "object",
    "properties": {
      "default_currency": {
        "type": "string",
        "default": "EUR"
      },
      "overtime_threshold_hours": {
        "type": "number",
        "default": 40
      }
    }
  }
}
```

---

## Required Interfaces

### ModuleEntry

The main entry point that Core calls to initialize the module:

```typescript
// modules/<id>/src/index.ts

import { ModuleContext, ModuleSDK } from '@platform/sdk';

export default class PayrollModule implements ModuleSDK {
  private context: ModuleContext;

  /**
   * Called by Core to register the module.
   * Use this to:
   * - Register risk detectors
   * - Register event handlers
   * - Initialize module state
   */
  async registerModule(context: ModuleContext): Promise<void> {
    this.context = context;

    // Register risk providers
    context.riskEngine.registerProvider(new ContractRiskDetector(context));
    context.riskEngine.registerProvider(new OvertimeRiskDetector(context));

    // Subscribe to events
    context.eventBus.subscribe('core.tenant.created', this.onTenantCreated);

    // Register API routes (if using custom endpoints)
    context.api.registerRoutes(this.getRoutes());
  }

  /**
   * Called by Core to get risk findings for a tenant.
   * Must return findings in the normalized RiskFinding format.
   */
  async getRiskFindings(
    tenantId: string,
    timeframe: TimeFrame
  ): Promise<RiskFinding[]> {
    const findings: RiskFinding[] = [];

    // Run all registered detectors
    for (const detector of this.detectors) {
      const detectorFindings = await detector.detect(tenantId, timeframe);
      findings.push(...detectorFindings);
    }

    return findings;
  }

  /**
   * Called by Core to check module health.
   */
  async getModuleHealth(): Promise<ModuleHealth> {
    const dbOk = await this.checkDatabase();
    const deps = await this.checkDependencies();

    return {
      status: dbOk && deps ? 'ok' : 'warn',
      details: {
        database: dbOk,
        dependencies: deps
      }
    };
  }
}
```

---

## RiskFinding Schema

All risk findings MUST conform to this schema:

```typescript
interface RiskFinding {
  // Unique identifier (UUID)
  finding_id: string;

  // Tenant this finding belongs to
  tenant_id: string;

  // Module that detected this risk
  module_id: string;

  // Risk category (from Core enum)
  category: RiskCategory;
  // 'legal' | 'payroll' | 'security' | 'ops' | 'finance' | 'compliance'

  // Severity level
  severity: RiskSeverity;
  // 'low' | 'medium' | 'high' | 'critical'

  // Probability (0.0 to 1.0)
  likelihood: number;

  // Estimated impact in EUR (optional)
  impact_eur?: number;

  // i18n key for title
  title_i18n_key: string;

  // i18n key for description
  description_i18n_key: string;

  // References to evidence (internal links)
  evidence_refs: EvidenceRef[];

  // Affected entities
  entities: EntityRef[];

  // Current status
  status: RiskStatus;
  // 'new' | 'acknowledged' | 'mitigated' | 'resolved' | 'false_positive'

  // Timestamps
  detected_at: Date;
  updated_at: Date;

  // i18n keys for recommended actions
  recommended_actions: string[];

  // Tags for ABAC filtering
  policy_tags: string[];

  // Additional metadata
  metadata?: Record<string, unknown>;
}

interface EvidenceRef {
  type: 'document' | 'record' | 'log' | 'screenshot';
  ref_id: string;
  label_i18n_key: string;
}

interface EntityRef {
  type: 'employee' | 'contract' | 'company' | 'client' | 'asset';
  ref_id: string;
  label: string;
}
```

---

## Risk Detector Interface

```typescript
interface RiskDetector {
  // Unique identifier for this detector
  id: string;

  // Human-readable name (i18n key)
  name_i18n_key: string;

  // Categories this detector covers
  categories: RiskCategory[];

  /**
   * Run detection and return findings.
   */
  detect(
    tenantId: string,
    timeframe: TimeFrame
  ): Promise<RiskFinding[]>;

  /**
   * Check if detector is healthy.
   */
  healthCheck(): Promise<boolean>;
}
```

### Example Detector

```typescript
class ContractRiskDetector implements RiskDetector {
  id = 'payroll.contract_risk';
  name_i18n_key = 'modules.payroll.detectors.contract_risk';
  categories: RiskCategory[] = ['legal', 'payroll'];

  constructor(private context: ModuleContext) {}

  async detect(
    tenantId: string,
    timeframe: TimeFrame
  ): Promise<RiskFinding[]> {
    const findings: RiskFinding[] = [];

    // Get contracts with potential issues
    const contracts = await this.context.db.query(`
      SELECT * FROM module_payroll_contracts
      WHERE tenant_id = $1
        AND (
          hours_weekly < 20 AND actual_hours_avg > 35
          OR contract_type = 'temporary' AND duration_months > 24
        )
    `, [tenantId]);

    for (const contract of contracts) {
      findings.push({
        finding_id: uuid(),
        tenant_id: tenantId,
        module_id: 'payroll',
        category: 'legal',
        severity: 'high',
        likelihood: 0.8,
        impact_eur: 6000, // Estimated fine
        title_i18n_key: 'modules.payroll.risks.contract_mismatch.title',
        description_i18n_key: 'modules.payroll.risks.contract_mismatch.description',
        evidence_refs: [{
          type: 'record',
          ref_id: contract.id,
          label_i18n_key: 'modules.payroll.evidence.contract'
        }],
        entities: [{
          type: 'employee',
          ref_id: contract.employee_id,
          label: contract.employee_name
        }, {
          type: 'contract',
          ref_id: contract.id,
          label: contract.contract_number
        }],
        status: 'new',
        detected_at: new Date(),
        updated_at: new Date(),
        recommended_actions: [
          'modules.payroll.actions.review_contract',
          'modules.payroll.actions.adjust_hours'
        ],
        policy_tags: ['hr', 'legal', `department:${contract.department}`]
      });
    }

    return findings;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.context.db.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Module Context

The context object provided to modules:

```typescript
interface ModuleContext {
  // Module configuration
  config: ModuleConfig;

  // Database access (scoped to module namespace)
  db: ModuleDatabase;

  // Event bus for emitting/subscribing
  eventBus: EventBus;

  // Risk engine for registering providers
  riskEngine: RiskEngineClient;

  // i18n utilities
  i18n: I18nClient;

  // Logging (scoped to module)
  logger: Logger;

  // API registration
  api: ApiRegistry;

  // Audit logging
  audit: AuditClient;

  // Blockchain anchoring
  blockchain: BlockchainClient;
}
```

---

## Database Access

Modules have scoped database access:

```typescript
interface ModuleDatabase {
  /**
   * Run a query. Table names are automatically prefixed.
   * e.g., 'employees' becomes 'module_payroll_employees'
   */
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Get a single record by ID.
   */
  findById<T>(table: string, id: string): Promise<T | null>;

  /**
   * Insert a record.
   */
  insert<T>(table: string, data: Partial<T>): Promise<T>;

  /**
   * Update a record.
   */
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a record (soft delete by default).
   */
  delete(table: string, id: string): Promise<void>;

  /**
   * Run within a transaction.
   */
  transaction<T>(fn: (tx: ModuleDatabase) => Promise<T>): Promise<T>;
}
```

---

## Event Emission

```typescript
// Emit module event (auto-prefixed with module.<id>.)
await context.eventBus.emit('employee.created', {
  tenant_id: tenantId,
  employee_id: employee.id,
  timestamp: new Date()
});

// Subscribe to core events
context.eventBus.subscribe('core.tenant.settings_changed', async (event) => {
  // React to tenant settings change
});
```

---

## Audit Logging

```typescript
// Log an auditable action
await context.audit.log({
  action: 'employee.salary_updated',
  tenant_id: tenantId,
  actor_id: userId,
  target_type: 'employee',
  target_id: employeeId,
  changes: {
    salary: { from: oldSalary, to: newSalary }
  },
  metadata: {
    reason: 'Annual review',
    approved_by: managerId
  }
});
```

---

## UI Extensions

### Route Component

```tsx
// modules/payroll/src/ui/pages/EmployeeList.tsx

import { useModuleContext, DataTable, useI18n } from '@platform/sdk/react';

export function EmployeeList() {
  const { t } = useI18n();
  const { api } = useModuleContext();

  const { data: employees, loading } = api.useQuery('/employees');

  return (
    <DataTable
      title={t('modules.payroll.employees.title')}
      columns={[
        { key: 'name', label: t('modules.payroll.employees.name') },
        { key: 'department', label: t('modules.payroll.employees.department') },
        { key: 'risk_score', label: t('common.risk_score') }
      ]}
      data={employees}
      loading={loading}
    />
  );
}
```

### Widget Component

```tsx
// modules/payroll/src/ui/widgets/PayrollSummaryWidget.tsx

import { Widget, useModuleContext, useI18n } from '@platform/sdk/react';

export function PayrollSummaryWidget() {
  const { t } = useI18n();
  const { api } = useModuleContext();

  const { data } = api.useQuery('/summary');

  return (
    <Widget title={t('modules.payroll.widgets.summary.title')}>
      <div className="grid grid-cols-3 gap-4">
        <Stat label={t('modules.payroll.widgets.summary.employees')} value={data?.total_employees} />
        <Stat label={t('modules.payroll.widgets.summary.risks')} value={data?.active_risks} />
        <Stat label={t('modules.payroll.widgets.summary.exposure')} value={`${data?.total_exposure}€`} />
      </div>
    </Widget>
  );
}
```

---

## Migrations

Place migrations in `modules/<id>/migrations/`:

```sql
-- migrations/001_initial.sql

CREATE TABLE module_payroll_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core_tenants(id),
  external_id VARCHAR(100),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  department VARCHAR(100),
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(tenant_id, external_id)
);

CREATE INDEX idx_payroll_employees_tenant ON module_payroll_employees(tenant_id);
CREATE INDEX idx_payroll_employees_department ON module_payroll_employees(department);
```

---

## i18n Files

Place translations in `modules/<id>/i18n/`:

```json
// i18n/en/payroll.json
{
  "modules": {
    "payroll": {
      "name": "Payroll Management",
      "description": "Employee and payroll risk management",
      "menu": {
        "main": "Payroll"
      },
      "employees": {
        "title": "Employees",
        "name": "Name",
        "department": "Department",
        "add": "Add Employee"
      },
      "risks": {
        "contract_mismatch": {
          "title": "Contract Hours Mismatch",
          "description": "Employee {{name}} has a part-time contract but works full-time hours"
        }
      },
      "actions": {
        "review_contract": "Review and update contract",
        "adjust_hours": "Adjust working hours"
      }
    }
  }
}
```

---

## Module Lifecycle

1. **Discovery**: Core scans `/modules/*/module.json`
2. **Validation**: Manifest validated against schema
3. **Migration**: Database migrations run
4. **Registration**: `registerModule()` called
5. **Health Check**: Initial `getModuleHealth()` call
6. **Active**: Module ready to receive requests

---

## Best Practices

1. **Always use i18n keys** - Never hardcode strings
2. **Emit events for important actions** - Enable audit trail
3. **Use the provided database client** - Maintains isolation
4. **Implement proper error handling** - Use SDK error types
5. **Keep detectors focused** - One concern per detector
6. **Document all risks** - Clear descriptions and actions
7. **Test migrations** - Up and down paths
8. **Version your manifest** - Follow semver

---

*Last updated: 2024-12-15*
