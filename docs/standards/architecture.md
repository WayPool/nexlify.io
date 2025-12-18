# Architecture Standards

This document defines the architectural principles and structure of the platform.

## Core Principles

### 1. Real Modularity
- **Core knows nothing about module business logic**
- Core defines contracts (interfaces, events, policies)
- Modules register dynamically via SDK
- Core NEVER imports modules

### 2. Zero Hardcoding
- All UI/Backend text uses i18n keys
- No magic strings for roles, events, or risks
- Configuration via environment or database

### 3. Audit & Traceability by Default
- Every relevant action emits an auditable event
- Every event is anchored to blockchain
- Full lineage for all data transformations

### 4. Security by Design
- Principle of least privilege
- All access through Policy Engine
- Zero-trust between services
- RBAC + ABAC combined

### 5. Banking-Grade Quality
- Consistent, sober UI
- High legibility
- Subtle micro-interactions
- Full accessibility (AA)

### 6. Documentation as Part of Build
- No code is complete without documentation
- Auto-generated where possible

---

## System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  apps/web (React + Tailwind + Design System)                │
├─────────────────────────────────────────────────────────────┤
│                      API LAYER                               │
│  apps/api (Node.js + Express/Fastify)                       │
├─────────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                          │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ Risk Engine │ Event Bus   │ Policy      │ Module       │ │
│  │             │             │ Engine      │ Runtime      │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN LAYER                              │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ Tenants     │ Users/Auth  │ Risks       │ Audit        │ │
│  │             │             │             │              │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE LAYER                         │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ PostgreSQL  │ Redis       │ Blockchain  │ Object       │ │
│  │ + Timescale │ (Cache)     │ Anchoring   │ Storage      │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Platform Components

### Identity & Access (RBAC/ABAC)
- Multi-tenant isolation
- Role-based access control
- Attribute-based access control
- MFA for privileged roles
- Session management with rotation

### Tenant Management
- Complete tenant isolation
- Per-tenant configuration
- Per-tenant module activation
- Per-tenant billing/subscription

### Event Bus
- Domain events for business logic
- Audit events for compliance
- Async processing via queues
- Event sourcing support

### Risk Engine
- Normalized risk model (RiskFinding)
- Risk scoring algorithms
- Risk state management
- Aggregation and reporting

### Analytics & Dashboard
- KPIs visualization
- Timeline views
- Heatmaps
- Drill-down capabilities

### i18n Engine
- Frontend + Backend support
- English as base language
- Dynamic language loading
- Fallback handling

### Storage
- PostgreSQL for relational data
- TimescaleDB for time-series
- Redis for caching
- S3-compatible for objects

### Blockchain Anchoring
- Event hashing (SHA-256)
- Batch anchoring (Merkle trees)
- Verification APIs
- Evidence pack generation

### Module Runtime
- Dynamic module loading
- Permission enforcement
- Migration execution
- UI extension mounting

---

## Module Architecture

Each module MUST implement:

### Manifest (`module.json`)
```json
{
  "id": "payroll",
  "version": "1.0.0",
  "name_i18n_key": "modules.payroll.name",
  "permissions": ["module:payroll:employees:read", "..."],
  "policies": [],
  "db_migrations_path": "./migrations",
  "risk_providers": ["PayrollRiskDetector"],
  "ui_extensions": {
    "routes": ["/modules/payroll/*"],
    "widgets": ["PayrollSummaryWidget"]
  }
}
```

### SDK Interfaces

```typescript
interface ModuleSDK {
  // Register module with core
  registerModule(context: ModuleContext): Promise<void>;

  // Return risk findings in normalized format
  getRiskFindings(tenantId: string, timeframe: TimeFrame): Promise<RiskFinding[]>;

  // Health check
  getModuleHealth(): Promise<ModuleHealth>;
}
```

### Isolation Rules
- DB namespace: `module_<id>_*`
- Event prefix: `module.<id>.`
- i18n namespace: `modules/<id>/`
- No direct Core DB access
- Communicate via SDK only

---

## Data Flow

### Risk Detection Flow
```
Module Detector → RiskFinding → Risk Engine → Normalize → Store → Event → Anchor
```

### Audit Flow
```
Action → Audit Event → Event Bus → Audit Store → Hash → Batch → Blockchain
```

### Authentication Flow
```
Request → API Gateway → Auth Middleware → Policy Engine → Handler
```

---

## Security Architecture

### Zero-Trust Model
- All services authenticate
- All requests authorized
- All data encrypted
- All access logged

### Encryption
- TLS 1.3 in transit
- AES-256 at rest
- Envelope encryption for sensitive fields
- HSM for key management (production)

### Access Control
```
User → Role(s) → Permission(s)
     ↓
Request → Policy Engine → [RBAC Check] → [ABAC Check] → Allow/Deny
                              ↓               ↓
                           Roles          Attributes
                                         (tenant, dept,
                                          country, level)
```

---

## Deployment Architecture

### Development
```
Local Docker Compose
├── api (hot reload)
├── web (Vite dev server)
├── worker
├── postgres
├── redis
└── mailhog
```

### Production
```
Kubernetes Cluster
├── Ingress (TLS termination)
├── API Deployment (replicas)
├── Web (static, CDN)
├── Worker Deployment
├── PostgreSQL (managed)
├── Redis (managed)
└── Blockchain Node (external)
```

---

## File Organization

```
/
├── docs/                    # Documentation
│   ├── architecture/        # Architecture docs
│   │   └── files/          # Per-file documentation
│   ├── database/           # DB schema docs
│   │   └── modules/        # Module-specific DB docs
│   ├── modules/            # Module documentation
│   ├── pages/              # Public pages documentation
│   ├── variables/          # Variable registry
│   ├── standards/          # Coding standards
│   └── runbooks/           # Operations guides
│
├── apps/
│   ├── web/                # Frontend (React)
│   ├── api/                # Backend API
│   └── worker/             # Background jobs
│
├── packages/
│   ├── core/               # Core libraries
│   ├── ui/                 # Design system
│   ├── i18n/               # i18n utilities
│   ├── sdk/                # Module SDK
│   └── blockchain/         # Blockchain utilities
│
├── modules/
│   ├── payroll/
│   ├── legal/
│   ├── contracts/
│   ├── production/
│   └── crm/
│
└── scripts/                # Build & utility scripts
```

---

## Dependencies Between Packages

```
apps/web     → packages/ui, packages/i18n
apps/api     → packages/core, packages/i18n, packages/blockchain
apps/worker  → packages/core, packages/blockchain

modules/*    → packages/sdk (ONLY)

packages/sdk → packages/core (types only)
packages/ui  → packages/i18n
```

**Rule: Modules can ONLY depend on packages/sdk**

---

*Last updated: 2024-12-18*
