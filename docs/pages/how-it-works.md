# How It Works Page

## Overview

Public marketing page explaining the Nexlify platform architecture, modular system, AI capabilities, and security features.

## File Information

| Property | Value |
|----------|-------|
| **Route** | `/how-it-works.html` |
| **Type** | Static HTML (public landing page) |
| **Location** | `httpdocs/how-it-works.html` |
| **Authentication** | None (public page) |
| **Created** | 2024-12-18 |

## Purpose

Professional institutional page designed to explain:

1. **Core Platform** - The foundational infrastructure shared by all modules
2. **Modular Architecture** - How modules extend the platform with specialized capabilities
3. **AI Layers** - Up to 6 specialized AI models per module
4. **Risk Engine** - Central risk aggregation and normalization
5. **Risk Lifecycle** - Detected → Classified → Prioritized → Evidenced → Resolved
6. **Security & Governance** - RBAC/ABAC, encryption, multi-tenant isolation
7. **Blockchain Auditing** - Hash anchoring for verifiable evidence
8. **Use Cases** - Real-world examples (construction, accounting firms)
9. **Module Installation** - 4-step activation process

## Content Sections

| Section ID | Title | Description |
|------------|-------|-------------|
| `#core` | Core Platform | Base infrastructure and capabilities |
| `#modulos` | Modulos Instalables | Available modules catalog |
| `#ia` | Inteligencia Artificial | 6 AI layers explanation |
| `#motor` | Risk Engine | Central risk aggregation |
| `#ciclo` | Risk Lifecycle | Risk state machine |
| `#arquitectura` | Architecture | Layered architecture diagram |
| `#seguridad` | Security | Security features and blockchain |
| `#casos` | Use Cases | Real-world implementation examples |
| `#instalacion` | Installation | Module activation steps |

## Dependencies

### Frontend Dependencies
- Google Fonts (Inter)
- Shared header component (`/components/header.js`)
- Shared footer component (`/components/footer.js`)

### No Backend Dependencies
Static HTML page with no API calls.

## Navigation Links

Page is linked from:
- Main site header navigation
- Footer "Producto" section
- Landing page (`/index.html`)

## SEO Metadata

```html
<title>Como Funciona - Nexlify | Risk Intelligence, Modular by Design</title>
<meta name="description" content="Descubre como Nexlify transforma la gestion de riesgos empresariales: base comun, modulos especializados, hasta 6 IAs por modulo, y auditoria verificable en blockchain.">
<meta name="keywords" content="gestion de riesgos, compliance, auditoria, blockchain, inteligencia artificial, modular, enterprise">
<link rel="canonical" href="https://nexlify.io/how-it-works.html">
```

## Design System

Uses the same CSS variables and styling as the main landing page:

- Primary color: `#0891b2` (cyan/teal)
- Accent gradient: `#14b8a6` → `#0891b2`
- Font: Inter
- Border radius: 10px-20px
- Card shadows: soft drop shadows

## Accessibility

- Semantic HTML structure (h1, h2, h3, h4)
- Proper heading hierarchy
- Sufficient color contrast (WCAG AA)
- Focus indicators on interactive elements
- Alt text for decorative SVG icons (aria-label)

## Related Files

| File | Purpose |
|------|---------|
| `/index.html` | Main landing page |
| `/about.html` | Company about page |
| `/modules.html` | Module catalog |
| `/investors.html` | Investor relations |
| `/components/header.js` | Shared header component |
| `/components/footer.js` | Shared footer component |

## Content Guidelines

### DO
- Use clear, professional language
- Focus on capabilities and architecture
- Include evidence-based claims
- Maintain institutional tone

### DO NOT
- Make unverifiable regulatory claims
- Use investment-related language (dividends, returns)
- Promise specific timelines without verification
- Add marketing fluff without substance

## Maintenance

When updating this page:
1. Maintain consistency with other landing pages
2. Update this documentation if sections change
3. Test on mobile viewports
4. Verify header/footer components load correctly
5. Check all internal links

---

*Last updated: 2024-12-18*
