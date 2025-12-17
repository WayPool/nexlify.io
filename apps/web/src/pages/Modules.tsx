/**
 * Modules Page
 *
 * Displays all available modules in the platform.
 * Currently all modules are in "Coming Soon" status as they are under development.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  Shield,
  FileText,
  Users,
  CreditCard,
  Scale,
  Building2,
  Landmark,
  Lock,
  Factory,
  Heart,
  Bell,
  Filter,
  Sparkles,
  ArrowRight,
  Info,
  Zap,
  AlertTriangle,
  Megaphone,
  Leaf,
  ShieldAlert,
  KeyRound,
  Smartphone,
  Timer,
  GraduationCap,
  Equal,
  UserPlus,
  Package,
  Truck,
  Wrench,
  Award,
  LifeBuoy,
  FileSearch,
  Link2,
  Bot,
  BarChart3,
  Workflow,
  Plug,
  Wallet,
  Receipt,
  Server,
  Database,
  Crown,
  Crosshair,
  Network,
  Brain,
  ShieldCheck,
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'coming_soon';
  category: string;
  plannedDetectors: number;
  features: string[];
  priority: 'high' | 'medium' | 'low';
  tier?: 'standard' | 'enterprise' | 'government';
}

// All platform modules - Currently all in development (36 modules)
const PLATFORM_MODULES: Module[] = [
  // =========== Compliance & Legal (6 módulos) ===========
  {
    id: 'aml',
    name: 'Anti-Blanqueo de Capitales (AML)',
    description: 'Detecta operaciones sospechosas, genera SAR automáticamente y cumple con la 6ta Directiva AML',
    longDescription: 'Sistema completo de prevención de blanqueo de capitales con detección de patrones sospechosos mediante IA, generación automática de informes SAR/STR y cumplimiento total con la normativa europea.',
    icon: CreditCard,
    status: 'coming_soon',
    category: 'Compliance & Legal',
    plannedDetectors: 12,
    features: ['Detección de patrones', 'Generación SAR/STR', 'KYC/KYB', 'Listas de sanciones'],
    priority: 'high',
  },
  {
    id: 'gdpr',
    name: 'GDPR & Privacidad',
    description: 'Gestión integral del cumplimiento GDPR: registro de actividades, evaluaciones de impacto',
    longDescription: 'Plataforma completa para el cumplimiento del RGPD incluyendo registro de actividades de tratamiento, evaluaciones de impacto (DPIA), gestión de consentimientos y derechos ARCO.',
    icon: Shield,
    status: 'coming_soon',
    category: 'Compliance & Legal',
    plannedDetectors: 10,
    features: ['Registro de actividades', 'DPIA automatizado', 'Gestión de derechos', 'Brechas de datos'],
    priority: 'high',
  },
  {
    id: 'contracts',
    name: 'Gestión de Contratos',
    description: 'Centraliza todos tus contratos, detecta cláusulas de riesgo y automatiza alertas de vencimiento',
    longDescription: 'Repositorio centralizado de contratos con análisis inteligente de cláusulas, alertas de vencimiento y renovación, y seguimiento de obligaciones contractuales.',
    icon: Scale,
    status: 'coming_soon',
    category: 'Compliance & Legal',
    plannedDetectors: 6,
    features: ['Análisis de cláusulas', 'Alertas de vencimiento', 'Repositorio centralizado', 'Firmas digitales'],
    priority: 'high',
  },
  {
    id: 'corporate',
    name: 'Gobierno Corporativo',
    description: 'Gestiona actas, poderes, apoderamientos y toda la documentación societaria',
    longDescription: 'Sistema integral para la gestión de documentación societaria, incluyendo libro de actas, poderes y mandatos, estructura societaria y cumplimiento mercantil.',
    icon: Building2,
    status: 'coming_soon',
    category: 'Compliance & Legal',
    plannedDetectors: 4,
    features: ['Libro de actas', 'Poderes y mandatos', 'Estructura societaria', 'Obligaciones mercantiles'],
    priority: 'medium',
  },
  {
    id: 'whistleblowing',
    name: 'Canal de Denuncias',
    description: 'Canal ético conforme a la Ley 2/2023. Anonimato garantizado, gestión de investigaciones',
    longDescription: 'Canal de denuncias interno conforme a la Ley 2/2023 de protección al informante, con anonimato garantizado, gestión de investigaciones y trazabilidad completa.',
    icon: Megaphone,
    status: 'coming_soon',
    category: 'Compliance & Legal',
    plannedDetectors: 5,
    features: ['Anonimato garantizado', 'Gestión de casos', 'Investigaciones', 'Reporting automático'],
    priority: 'high',
  },
  {
    id: 'esg',
    name: 'ESG & Sostenibilidad',
    description: 'Cumplimiento de la CSRD, cálculo de huella de carbono y reporting de sostenibilidad',
    longDescription: 'Plataforma para el cumplimiento de la directiva CSRD, cálculo y seguimiento de huella de carbono, y generación de informes de sostenibilidad según estándares ESRS.',
    icon: Leaf,
    status: 'coming_soon',
    category: 'Compliance & Legal',
    plannedDetectors: 8,
    features: ['Huella de carbono', 'Reporting CSRD', 'Indicadores ESG', 'Objetivos sostenibilidad'],
    priority: 'medium',
  },

  // =========== Finanzas & Tesorería (6 módulos) ===========
  {
    id: 'banking',
    name: 'Control Bancario',
    description: 'Conecta todas tus cuentas bancarias vía PSD2 y detecta anomalías en tiempo real',
    longDescription: 'Integración bancaria mediante Open Banking (PSD2) para monitoreo en tiempo real de todas tus cuentas, detección de anomalías y conciliación automática.',
    icon: Landmark,
    status: 'coming_soon',
    category: 'Finanzas & Tesorería',
    plannedDetectors: 9,
    features: ['Conexión PSD2', 'Detección de anomalías', 'Conciliación automática', 'Alertas en tiempo real'],
    priority: 'high',
  },
  {
    id: 'fraud',
    name: 'Detección de Fraude',
    description: 'IA avanzada para detectar patrones de fraude interno y externo antes de daño',
    longDescription: 'Sistema de detección de fraude basado en inteligencia artificial que identifica patrones sospechosos tanto internos como externos antes de que causen daño financiero.',
    icon: AlertTriangle,
    status: 'coming_soon',
    category: 'Finanzas & Tesorería',
    plannedDetectors: 15,
    features: ['IA predictiva', 'Fraude interno', 'Fraude externo', 'Alertas tempranas'],
    priority: 'high',
  },
  {
    id: 'budget',
    name: 'Control Presupuestario',
    description: 'Monitoriza desviaciones presupuestarias en tiempo real y genera alertas',
    longDescription: 'Herramienta de control presupuestario que monitoriza desviaciones en tiempo real, genera alertas automáticas y facilita la toma de decisiones financieras.',
    icon: Wallet,
    status: 'coming_soon',
    category: 'Finanzas & Tesorería',
    plannedDetectors: 6,
    features: ['Seguimiento en tiempo real', 'Alertas de desviación', 'Forecasting', 'Análisis de varianzas'],
    priority: 'medium',
  },
  {
    id: 'expenses',
    name: 'Gestión de Gastos',
    description: 'Control de gastos corporativos, tarjetas de empresa y políticas de aprobación',
    longDescription: 'Sistema completo de gestión de gastos corporativos incluyendo tarjetas de empresa, políticas de aprobación configurables y detección de gastos fuera de política.',
    icon: Receipt,
    status: 'coming_soon',
    category: 'Finanzas & Tesorería',
    plannedDetectors: 7,
    features: ['Tarjetas corporativas', 'Flujos de aprobación', 'Políticas de gasto', 'OCR de recibos'],
    priority: 'medium',
  },
  {
    id: 'treasury',
    name: 'Tesorería Avanzada',
    description: 'Cash pooling, previsiones de tesorería y gestión de liquidez multiempresa',
    longDescription: 'Solución enterprise de tesorería con cash pooling, previsiones de flujo de caja, gestión de liquidez multiempresa y optimización de saldos.',
    icon: Database,
    status: 'coming_soon',
    category: 'Finanzas & Tesorería',
    plannedDetectors: 8,
    features: ['Cash pooling', 'Previsiones', 'Multiempresa', 'Optimización liquidez'],
    priority: 'low',
    tier: 'enterprise',
  },
  {
    id: 'einvoicing',
    name: 'Facturación Electrónica',
    description: 'Cumplimiento automático de facturación electrónica B2B/B2G con validación y envío',
    longDescription: 'Sistema de facturación electrónica conforme a normativa con validación automática, envío a plataformas públicas (FACe, TicketBAI) y archivo legal.',
    icon: FileText,
    status: 'coming_soon',
    category: 'Finanzas & Tesorería',
    plannedDetectors: 5,
    features: ['Validación automática', 'FACe/TicketBAI', 'Archivo legal', 'Integración ERP'],
    priority: 'high',
  },

  // =========== Ciberseguridad & Accesos (6 módulos) ===========
  {
    id: 'iam',
    name: 'Control de Accesos (IAM)',
    description: 'Gestión centralizada de identidades, SSO empresarial y detección de accesos anómalos',
    longDescription: 'Plataforma de gestión de identidades y accesos con Single Sign-On empresarial, autenticación multifactor y detección de comportamientos anómalos.',
    icon: KeyRound,
    status: 'coming_soon',
    category: 'Ciberseguridad & Accesos',
    plannedDetectors: 10,
    features: ['SSO empresarial', 'MFA', 'Detección de anomalías', 'Provisioning automático'],
    priority: 'high',
  },
  {
    id: 'siem',
    name: 'SIEM & Logs',
    description: 'Centralización de logs, correlación de eventos y detección de amenazas en tiempo real',
    longDescription: 'Sistema SIEM enterprise para centralización de logs, correlación de eventos de seguridad y detección de amenazas mediante reglas y machine learning.',
    icon: Server,
    status: 'coming_soon',
    category: 'Ciberseguridad & Accesos',
    plannedDetectors: 20,
    features: ['Centralización logs', 'Correlación eventos', 'Detección amenazas', 'Dashboards SOC'],
    priority: 'medium',
    tier: 'enterprise',
  },
  {
    id: 'vulnerabilities',
    name: 'Vulnerabilidades',
    description: 'Escaneo continuo de vulnerabilidades, priorización por riesgo y seguimiento de remediación',
    longDescription: 'Plataforma de gestión de vulnerabilidades con escaneo continuo, priorización inteligente basada en riesgo real y seguimiento del proceso de remediación.',
    icon: ShieldAlert,
    status: 'coming_soon',
    category: 'Ciberseguridad & Accesos',
    plannedDetectors: 12,
    features: ['Escaneo continuo', 'Priorización por riesgo', 'Tracking remediación', 'Integración CI/CD'],
    priority: 'high',
  },
  {
    id: 'incident-response',
    name: 'Respuesta a Incidentes',
    description: 'Playbooks automatizados, gestión de incidentes y post-mortems estructurados',
    longDescription: 'Sistema de respuesta a incidentes de seguridad con playbooks automatizados, gestión del ciclo de vida del incidente y post-mortems estructurados.',
    icon: LifeBuoy,
    status: 'coming_soon',
    category: 'Ciberseguridad & Accesos',
    plannedDetectors: 8,
    features: ['Playbooks automáticos', 'Gestión incidentes', 'Post-mortems', 'Métricas MTTR'],
    priority: 'high',
  },
  {
    id: 'secrets',
    name: 'Gestión de Secretos',
    description: 'Vault empresarial para credenciales, rotación automática y auditoría de uso',
    longDescription: 'Vault enterprise para almacenamiento seguro de credenciales, claves API y certificados con rotación automática y auditoría completa de accesos.',
    icon: Lock,
    status: 'coming_soon',
    category: 'Ciberseguridad & Accesos',
    plannedDetectors: 6,
    features: ['Vault seguro', 'Rotación automática', 'Auditoría de uso', 'Integración DevOps'],
    priority: 'medium',
    tier: 'enterprise',
  },
  {
    id: 'mdm',
    name: 'MDM & Endpoints',
    description: 'Gestión de dispositivos móviles, políticas de seguridad y borrado remoto',
    longDescription: 'Plataforma de gestión de dispositivos móviles y endpoints con políticas de seguridad configurables, inventario de dispositivos y capacidad de borrado remoto.',
    icon: Smartphone,
    status: 'coming_soon',
    category: 'Ciberseguridad & Accesos',
    plannedDetectors: 7,
    features: ['Gestión de dispositivos', 'Políticas de seguridad', 'Borrado remoto', 'Inventario'],
    priority: 'medium',
  },

  // =========== Recursos Humanos (6 módulos) ===========
  {
    id: 'payroll',
    name: 'Nóminas & Contratos',
    description: 'Detecta violaciones de horas extra, vencimientos de contratos y anomalías salariales',
    longDescription: 'Sistema de control de nóminas y contratos que detecta automáticamente violaciones de horas extra, vencimientos de contratos y anomalías en la estructura salarial.',
    icon: Users,
    status: 'coming_soon',
    category: 'Recursos Humanos',
    plannedDetectors: 8,
    features: ['Detección de horas extra', 'Alertas de vencimiento', 'Análisis salarial', 'Informes automáticos'],
    priority: 'high',
  },
  {
    id: 'time-tracking',
    name: 'Control Horario',
    description: 'Registro de jornada conforme al RD 8/2019 con fichaje digital y geolocalización',
    longDescription: 'Sistema de registro de jornada conforme al RD 8/2019 con múltiples métodos de fichaje (app, web, biométrico), geolocalización y generación automática de informes.',
    icon: Timer,
    status: 'coming_soon',
    category: 'Recursos Humanos',
    plannedDetectors: 5,
    features: ['Fichaje digital', 'Geolocalización', 'Informes legales', 'Integración nóminas'],
    priority: 'high',
  },
  {
    id: 'training',
    name: 'Formación & Certificaciones',
    description: 'Gestión de formación obligatoria, certificaciones y alertas de caducidad',
    longDescription: 'Plataforma de gestión de formación corporativa con seguimiento de formación obligatoria, certificaciones profesionales y alertas de caducidad.',
    icon: GraduationCap,
    status: 'coming_soon',
    category: 'Recursos Humanos',
    plannedDetectors: 4,
    features: ['Formación obligatoria', 'Certificaciones', 'Alertas caducidad', 'LMS integrado'],
    priority: 'medium',
  },
  {
    id: 'prl',
    name: 'Prevención de Riesgos (PRL)',
    description: 'Gestión integral de prevención de riesgos laborales, accidentes y EPIs',
    longDescription: 'Sistema completo de prevención de riesgos laborales con evaluación de riesgos, gestión de accidentes e incidentes, y control de equipos de protección.',
    icon: Heart,
    status: 'coming_soon',
    category: 'Recursos Humanos',
    plannedDetectors: 7,
    features: ['Evaluación de riesgos', 'Gestión accidentes', 'Control EPIs', 'Formación PRL'],
    priority: 'high',
  },
  {
    id: 'equality',
    name: 'Plan de Igualdad',
    description: 'Cumplimiento del RD 901/2020, diagnóstico de situación y registro retributivo',
    longDescription: 'Herramienta para el cumplimiento del RD 901/2020 de planes de igualdad, incluyendo diagnóstico de situación, registro retributivo y seguimiento de medidas.',
    icon: Equal,
    status: 'coming_soon',
    category: 'Recursos Humanos',
    plannedDetectors: 5,
    features: ['Diagnóstico situación', 'Registro retributivo', 'Brecha salarial', 'Seguimiento medidas'],
    priority: 'medium',
  },
  {
    id: 'onboarding',
    name: 'Onboarding & Offboarding',
    description: 'Automatiza el proceso de alta y baja de empleados con checklists y workflows',
    longDescription: 'Sistema automatizado de onboarding y offboarding de empleados con checklists personalizables, workflows de aprobación y provisioning de accesos.',
    icon: UserPlus,
    status: 'coming_soon',
    category: 'Recursos Humanos',
    plannedDetectors: 4,
    features: ['Checklists automáticos', 'Workflows', 'Provisioning', 'Documentación digital'],
    priority: 'medium',
  },

  // =========== Operaciones & Cadena de Suministro (6 módulos) ===========
  {
    id: 'suppliers',
    name: 'Gestión de Proveedores',
    description: 'Evaluación de riesgo de proveedores, due diligence y monitoring continuo',
    longDescription: 'Plataforma de gestión de proveedores con evaluación de riesgo, due diligence automatizada, monitoring continuo y alertas de cambios relevantes.',
    icon: Factory,
    status: 'coming_soon',
    category: 'Operaciones & Cadena de Suministro',
    plannedDetectors: 6,
    features: ['Due diligence', 'Scoring de riesgo', 'Monitoring continuo', 'Alertas de cambios'],
    priority: 'high',
  },
  {
    id: 'inventory',
    name: 'Control de Inventario',
    description: 'Gestión de stock, alertas de rotura y detección de mermas anómalas',
    longDescription: 'Sistema de control de inventario con gestión de stock en tiempo real, alertas de rotura de stock y detección inteligente de mermas anómalas.',
    icon: Package,
    status: 'coming_soon',
    category: 'Operaciones & Cadena de Suministro',
    plannedDetectors: 5,
    features: ['Stock en tiempo real', 'Alertas de rotura', 'Detección de mermas', 'Inventario cíclico'],
    priority: 'medium',
  },
  {
    id: 'logistics',
    name: 'Logística & Transporte',
    description: 'Control de flotas, rutas y detección de incidencias en entregas',
    longDescription: 'Plataforma de gestión logística con control de flotas, optimización de rutas, tracking de envíos y detección automática de incidencias en entregas.',
    icon: Truck,
    status: 'coming_soon',
    category: 'Operaciones & Cadena de Suministro',
    plannedDetectors: 6,
    features: ['Control de flotas', 'Optimización rutas', 'Tracking envíos', 'Detección incidencias'],
    priority: 'medium',
  },
  {
    id: 'maintenance',
    name: 'Mantenimiento (CMMS)',
    description: 'Mantenimiento preventivo, correctivo y predictivo con IoT',
    longDescription: 'Sistema CMMS completo con gestión de mantenimiento preventivo, correctivo y predictivo, integración IoT y gestión de órdenes de trabajo.',
    icon: Wrench,
    status: 'coming_soon',
    category: 'Operaciones & Cadena de Suministro',
    plannedDetectors: 7,
    features: ['Mantenimiento preventivo', 'IoT integrado', 'Órdenes de trabajo', 'Análisis predictivo'],
    priority: 'medium',
  },
  {
    id: 'quality',
    name: 'Calidad (QMS)',
    description: 'Sistema de gestión de calidad ISO 9001, no conformidades y acciones correctivas',
    longDescription: 'Sistema de gestión de calidad conforme a ISO 9001 con gestión de no conformidades, acciones correctivas/preventivas y auditorías internas.',
    icon: Award,
    status: 'coming_soon',
    category: 'Operaciones & Cadena de Suministro',
    plannedDetectors: 6,
    features: ['ISO 9001', 'No conformidades', 'CAPA', 'Auditorías internas'],
    priority: 'medium',
  },
  {
    id: 'bcp',
    name: 'Continuidad de Negocio',
    description: 'Planes de continuidad, BIA y gestión de crisis empresarial',
    longDescription: 'Plataforma enterprise de continuidad de negocio con análisis de impacto (BIA), planes de continuidad y gestión de crisis.',
    icon: LifeBuoy,
    status: 'coming_soon',
    category: 'Operaciones & Cadena de Suministro',
    plannedDetectors: 5,
    features: ['Planes BCP', 'Análisis BIA', 'Gestión de crisis', 'Simulacros'],
    priority: 'low',
    tier: 'enterprise',
  },

  // =========== Datos, IA & Automatización (6 módulos) ===========
  {
    id: 'document-ai',
    name: 'Análisis Documental Integral',
    description: 'Convierte documentos en datos estructurados. Detecta riesgos y contradicciones con IA',
    longDescription: 'Motor de análisis documental con IA que extrae datos estructurados de documentos, detecta riesgos, inconsistencias y contradicciones automáticamente.',
    icon: FileSearch,
    status: 'coming_soon',
    category: 'Datos, IA & Automatización',
    plannedDetectors: 10,
    features: ['OCR inteligente', 'Extracción de datos', 'Detección de riesgos', 'Análisis de contratos'],
    priority: 'high',
  },
  {
    id: 'blockchain',
    name: 'Blockchain & Trazabilidad',
    description: 'Anclaje de auditorías en blockchain, verificación criptográfica y pruebas inmutables',
    longDescription: 'Sistema de trazabilidad blockchain para anclaje de auditorías, verificación criptográfica de documentos y generación de pruebas inmutables.',
    icon: Link2,
    status: 'coming_soon',
    category: 'Datos, IA & Automatización',
    plannedDetectors: 4,
    features: ['Anclaje blockchain', 'Verificación cripto', 'Pruebas inmutables', 'Trazabilidad completa'],
    priority: 'medium',
  },
  {
    id: 'ai-assistant',
    name: 'Asistente IA',
    description: 'Chatbot empresarial entrenado en tus datos para consultas sobre riesgos y compliance',
    longDescription: 'Asistente de IA conversacional entrenado específicamente en los datos de tu empresa para responder consultas sobre riesgos, compliance y normativa.',
    icon: Bot,
    status: 'coming_soon',
    category: 'Datos, IA & Automatización',
    plannedDetectors: 0,
    features: ['IA conversacional', 'Entrenado en tus datos', 'Consultas compliance', 'Soporte 24/7'],
    priority: 'high',
  },
  {
    id: 'bi',
    name: 'Business Intelligence',
    description: 'Dashboards personalizables, KPIs de riesgo y reportes ejecutivos automatizados',
    longDescription: 'Plataforma de Business Intelligence con dashboards personalizables, KPIs de riesgo en tiempo real y generación automática de reportes ejecutivos.',
    icon: BarChart3,
    status: 'coming_soon',
    category: 'Datos, IA & Automatización',
    plannedDetectors: 0,
    features: ['Dashboards custom', 'KPIs en tiempo real', 'Reportes automáticos', 'Drill-down'],
    priority: 'high',
  },
  {
    id: 'rpa',
    name: 'Automatización (RPA)',
    description: 'Automatiza tareas repetitivas, integraciones y flujos de trabajo sin código',
    longDescription: 'Plataforma enterprise de automatización robótica de procesos (RPA) para automatizar tareas repetitivas y crear flujos de trabajo sin código.',
    icon: Workflow,
    status: 'coming_soon',
    category: 'Datos, IA & Automatización',
    plannedDetectors: 0,
    features: ['Automatización sin código', 'Bots RPA', 'Workflows', 'Integraciones'],
    priority: 'medium',
    tier: 'enterprise',
  },
  {
    id: 'api',
    name: 'API & Integraciones',
    description: 'API REST completa, webhooks y conectores para SAP, Salesforce, Microsoft 365',
    longDescription: 'API REST completa con documentación OpenAPI, webhooks para eventos en tiempo real y conectores nativos para SAP, Salesforce, Microsoft 365 y más.',
    icon: Plug,
    status: 'coming_soon',
    category: 'Datos, IA & Automatización',
    plannedDetectors: 0,
    features: ['API REST', 'Webhooks', 'Conectores nativos', 'SDK'],
    priority: 'high',
  },

  // =========== Defensa, Gobierno & Seguridad Nacional (4 módulos) ===========
  // USO EXCLUSIVO: Gobiernos, Autoridades, Fuerzas Armadas y Agencias de Seguridad
  {
    id: 'threat-intelligence',
    name: 'Inteligencia de Amenazas',
    description: 'IA predictiva para detección de amenazas nacionales, terrorismo y crimen organizado',
    longDescription: 'Plataforma de inteligencia artificial de nivel militar para análisis predictivo de amenazas. Fusiona datos de múltiples fuentes (SIGINT, HUMINT, OSINT, IMINT) para identificar patrones de amenazas terroristas, crimen organizado y actores hostiles. Incluye análisis de redes sociales, dark web y comunicaciones cifradas.',
    icon: Crosshair,
    status: 'coming_soon',
    category: 'Defensa & Seguridad Nacional',
    plannedDetectors: 45,
    features: ['Fusión multi-INT', 'Análisis predictivo IA', 'Monitoreo dark web', 'Grafos de relaciones'],
    priority: 'high',
    tier: 'government',
  },
  {
    id: 'cyber-defense',
    name: 'Ciberdefensa Avanzada',
    description: 'Protección de infraestructuras críticas contra APTs, warfare y ataques estado-nación',
    longDescription: 'Sistema de ciberdefensa de grado militar diseñado para proteger infraestructuras críticas nacionales. Detecta y neutraliza APTs (Advanced Persistent Threats), ataques de estados-nación y operaciones de cyber warfare. Integración con SOCs gubernamentales y capacidad de respuesta automatizada.',
    icon: ShieldCheck,
    status: 'coming_soon',
    category: 'Defensa & Seguridad Nacional',
    plannedDetectors: 60,
    features: ['Detección APT', 'Threat hunting IA', 'Respuesta automatizada', 'Integración SOC nacional'],
    priority: 'high',
    tier: 'government',
  },
  {
    id: 'data-fusion',
    name: 'Fusión de Datos Nacional',
    description: 'Cruce masivo de bases de datos gubernamentales con IA para investigaciones',
    longDescription: 'Motor de fusión de datos a escala nacional que integra y correlaciona información de múltiples bases de datos gubernamentales: registros civiles, fiscales, judiciales, migratorios, financieros y de seguridad. IA avanzada para detección de patrones, fraudes masivos y redes criminales.',
    icon: Network,
    status: 'coming_soon',
    category: 'Defensa & Seguridad Nacional',
    plannedDetectors: 35,
    features: ['Cruce multi-base datos', 'Grafos de entidades', 'Detección de fraude masivo', 'Análisis de redes'],
    priority: 'high',
    tier: 'government',
  },
  {
    id: 'strategic-ai',
    name: 'IA Estratégica & Decisión',
    description: 'Inteligencia artificial para apoyo a decisiones estratégicas de seguridad nacional',
    longDescription: 'Sistema de inteligencia artificial de nivel estratégico para apoyo a la toma de decisiones en seguridad nacional. Análisis de escenarios geopolíticos, simulación de conflictos, evaluación de riesgos país y modelado predictivo de crisis. Diseñado para altos mandos y consejos de seguridad nacional.',
    icon: Brain,
    status: 'coming_soon',
    category: 'Defensa & Seguridad Nacional',
    plannedDetectors: 25,
    features: ['Simulación de escenarios', 'Análisis geopolítico', 'Modelado de crisis', 'Dashboards estratégicos'],
    priority: 'high',
    tier: 'government',
  },
  {
    id: 'national-cyberdefense',
    name: 'Ciberdefensa Nacional',
    description: 'Defensa contra ciberataques de estados-nación, APTs y amenazas a infraestructuras críticas',
    longDescription: 'Sistema de defensa cibernética de grado militar para proteger infraestructuras críticas nacionales contra ciberataques de estados-nación, grupos APT (Advanced Persistent Threats) y operaciones de cyber warfare. Incluye detección en tiempo real con IA militar, respuesta automatizada a incidentes, threat hunting avanzado e integración completa con SOCs gubernamentales, CCN-CERT y centros de ciberdefensa OTAN.',
    icon: ShieldCheck,
    status: 'coming_soon',
    category: 'Defensa & Seguridad Nacional',
    plannedDetectors: 85,
    features: ['Detección APT tiempo real', 'Protección infraestructuras críticas', 'Threat hunting IA militar', 'Integración SOC/CCN-CERT/OTAN'],
    priority: 'high',
    tier: 'government',
  },
];

const CATEGORIES = [
  'Compliance & Legal',
  'Finanzas & Tesorería',
  'Ciberseguridad & Accesos',
  'Recursos Humanos',
  'Operaciones & Cadena de Suministro',
  'Datos, IA & Automatización',
  'Defensa & Seguridad Nacional',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100 }
  },
};

const priorityConfig = {
  high: { label: 'Alta prioridad', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  medium: { label: 'Media prioridad', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  low: { label: 'Baja prioridad', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
};

function ModuleCard({ module, onClick }: { module: Module; onClick: () => void }) {
  const Icon = module.icon;
  const priority = priorityConfig[module.priority];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-primary-300 dark:hover:border-primary-700"
    >
      {/* Status Banner */}
      <div className={`absolute top-0 left-0 right-0 py-1.5 px-4 ${
        module.tier === 'government'
          ? 'bg-gradient-to-r from-red-600 to-red-800'
          : 'bg-gradient-to-r from-purple-500 to-indigo-500'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-medium text-white">Próximamente</span>
          {module.tier === 'enterprise' && (
            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs text-white flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Enterprise
            </span>
          )}
          {module.tier === 'government' && (
            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs text-white flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Gobierno
            </span>
          )}
        </div>
      </div>

      <div className="p-5 pt-11">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 group-hover:from-primary-100 group-hover:to-primary-50 dark:group-hover:from-primary-900/30 dark:group-hover:to-primary-900/20 transition-colors">
            <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
            {module.priority === 'high' ? 'Alta' : module.priority === 'medium' ? 'Media' : 'Baja'}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
          {module.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 min-h-[40px]">
          {module.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {module.plannedDetectors}
            </span>
            <span className="text-xs text-slate-400">detectores</span>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver más
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

function ModuleDetailModal({ module, onClose }: { module: Module | null; onClose: () => void }) {
  if (!module) return null;

  const Icon = module.icon;
  const priority = priorityConfig[module.priority];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className={`p-6 ${
            module.tier === 'government'
              ? 'bg-gradient-to-r from-red-600 to-red-800'
              : 'bg-gradient-to-r from-purple-500 to-indigo-500'
          }`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{module.name}</h2>
                  {module.tier === 'enterprise' && (
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Enterprise
                    </span>
                  )}
                  {module.tier === 'government' && (
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Gobierno
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-white/80" />
                  <span className="text-sm text-white/80">En desarrollo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {module.longDescription}
            </p>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Funcionalidades planificadas
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {module.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <Sparkles className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {module.plannedDetectors}
                </div>
                <div className="text-xs text-slate-500">Detectores</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className={`text-lg font-bold ${priority.color}`}>
                  {module.priority === 'high' ? 'Alta' : module.priority === 'medium' ? 'Media' : 'Baja'}
                </div>
                <div className="text-xs text-slate-500">Prioridad</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {module.category.split(' ')[0]}
                </div>
                <div className="text-xs text-slate-500">Categoría</div>
              </div>
            </div>

            {/* Info Banner */}
            {module.tier === 'government' ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/30">
                <ShieldCheck className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                    Uso Exclusivo - Autorizado
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    Este módulo está reservado exclusivamente para Gobiernos, Autoridades, Fuerzas Armadas y Agencias de Seguridad Nacional. Requiere verificación y acreditación gubernamental.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Este módulo está actualmente en desarrollo. Recibirás una notificación cuando esté disponible.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cerrar
            </button>
            <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificarme
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatsBar() {
  const totalModules = PLATFORM_MODULES.length;
  const totalDetectors = PLATFORM_MODULES.reduce((sum, m) => sum + m.plannedDetectors, 0);
  const highPriority = PLATFORM_MODULES.filter((m) => m.priority === 'high').length;
  const governmentModules = PLATFORM_MODULES.filter((m) => m.tier === 'government').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalModules}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Módulos totales</p>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDetectors}+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Detectores</p>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{highPriority}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Alta prioridad</p>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{governmentModules}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gobierno/Defensa</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Modules() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const filteredModules = PLATFORM_MODULES.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category for display
  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Módulos
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Explora los {PLATFORM_MODULES.length} módulos de la plataforma
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Development Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-5"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-purple-500 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              Plataforma en Desarrollo Activo
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Todos los módulos se encuentran en fase de desarrollo. Haz clic en cualquier módulo para ver sus funcionalidades planificadas y solicitar notificación cuando esté disponible.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar módulos..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer min-w-[200px]"
          >
            <option value="all">Todas las categorías ({PLATFORM_MODULES.length})</option>
            {CATEGORIES.map((c) => {
              const count = PLATFORM_MODULES.filter(m => m.category === c).length;
              return (
                <option key={c} value={c}>
                  {c} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Modules Grid - Grouped by Category */}
      {categoryFilter === 'all' ? (
        CATEGORIES.map((category) => {
          const modules = groupedModules[category];
          if (!modules || modules.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                {category}
                <span className="text-sm font-normal text-slate-400">({modules.length})</span>
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onClick={() => setSelectedModule(module)}
                  />
                ))}
              </motion.div>
            </div>
          );
        })
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onClick={() => setSelectedModule(module)}
            />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No se encontraron módulos
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Module Detail Modal */}
      {selectedModule && (
        <ModuleDetailModal
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </div>
  );
}
