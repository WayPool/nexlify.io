/**
 * Dashboard Routes
 *
 * API endpoints for modular dashboard widgets.
 * Returns widget configuration and data based on active modules.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const dashboardRoutes: Router = Router();

// Apply authentication to all dashboard routes
dashboardRoutes.use(authMiddleware);

/**
 * Module widget definitions
 * Each module defines its dashboard widgets here
 */
const MODULE_WIDGETS: Record<string, ModuleWidgetConfig> = {
  payroll: {
    moduleId: 'payroll',
    moduleName: 'Nóminas',
    widgets: [
      {
        id: 'payroll-active-risks',
        type: 'stat',
        title: 'Riesgos Activos',
        size: 'sm',
        priority: 1,
      },
      {
        id: 'payroll-compliance',
        type: 'stat',
        title: 'Cumplimiento',
        size: 'sm',
        priority: 2,
      },
      {
        id: 'payroll-trend',
        type: 'chart',
        title: 'Tendencia de Riesgos',
        description: 'Últimos 6 meses',
        size: 'lg',
        priority: 10,
      },
      {
        id: 'payroll-recent-risks',
        type: 'list',
        title: 'Riesgos Recientes',
        size: 'md',
        priority: 20,
      },
      {
        id: 'payroll-by-type',
        type: 'progress',
        title: 'Cumplimiento por Área',
        size: 'md',
        priority: 21,
      },
    ],
  },
  gdpr: {
    moduleId: 'gdpr',
    moduleName: 'GDPR',
    widgets: [
      {
        id: 'gdpr-consent-status',
        type: 'stat',
        title: 'Consentimientos Válidos',
        size: 'sm',
        priority: 3,
      },
      {
        id: 'gdpr-data-requests',
        type: 'stat',
        title: 'Solicitudes Pendientes',
        size: 'sm',
        priority: 4,
      },
      {
        id: 'gdpr-compliance-chart',
        type: 'chart',
        title: 'Estado de Cumplimiento GDPR',
        size: 'md',
        priority: 15,
      },
      {
        id: 'gdpr-recent-events',
        type: 'timeline',
        title: 'Actividad Reciente',
        size: 'md',
        priority: 25,
      },
    ],
  },
  fiscal: {
    moduleId: 'fiscal',
    moduleName: 'Fiscal',
    widgets: [
      {
        id: 'fiscal-pending',
        type: 'stat',
        title: 'Obligaciones Pendientes',
        size: 'sm',
        priority: 5,
      },
      {
        id: 'fiscal-next-deadline',
        type: 'stat',
        title: 'Próximo Vencimiento',
        size: 'sm',
        priority: 6,
      },
      {
        id: 'fiscal-calendar',
        type: 'table',
        title: 'Calendario Fiscal',
        size: 'lg',
        priority: 30,
      },
    ],
  },
  aml: {
    moduleId: 'aml',
    moduleName: 'Anti-Blanqueo',
    widgets: [
      {
        id: 'aml-alerts',
        type: 'stat',
        title: 'Alertas AML',
        size: 'sm',
        priority: 7,
      },
      {
        id: 'aml-transactions',
        type: 'chart',
        title: 'Transacciones Analizadas',
        size: 'md',
        priority: 18,
      },
    ],
  },
  banking: {
    moduleId: 'banking',
    moduleName: 'Control Bancario',
    widgets: [
      {
        id: 'banking-balance',
        type: 'stat',
        title: 'Saldo Total',
        size: 'sm',
        priority: 1,
      },
      {
        id: 'banking-alerts',
        type: 'stat',
        title: 'Alertas Activas',
        size: 'sm',
        priority: 2,
      },
      {
        id: 'banking-flagged',
        type: 'stat',
        title: 'Tx. Sospechosas',
        size: 'sm',
        priority: 3,
      },
      {
        id: 'banking-accounts',
        type: 'stat',
        title: 'Cuentas Conectadas',
        size: 'sm',
        priority: 4,
      },
      {
        id: 'banking-flow-chart',
        type: 'chart',
        title: 'Flujo de Caja',
        description: 'Entradas vs Salidas - Ultimos 30 dias',
        size: 'lg',
        priority: 10,
      },
      {
        id: 'banking-recent-alerts',
        type: 'list',
        title: 'Alertas Recientes',
        size: 'md',
        priority: 20,
      },
      {
        id: 'banking-anomaly-timeline',
        type: 'timeline',
        title: 'Actividad Sospechosa',
        size: 'md',
        priority: 25,
      },
    ],
  },
};

/**
 * Mock data generators for each widget type
 */
function generateWidgetData(widgetId: string, moduleId: string): WidgetData {
  // Stat widgets
  if (widgetId === 'payroll-active-risks') {
    return {
      type: 'stat',
      data: {
        value: 24,
        label: 'Riesgos Activos',
        change: -12,
        trend: 'down',
        icon: 'alert-triangle',
        color: 'amber',
      },
    };
  }

  if (widgetId === 'payroll-compliance') {
    return {
      type: 'stat',
      data: {
        value: 94,
        label: 'Cumplimiento',
        suffix: '%',
        change: 3,
        trend: 'up',
        icon: 'shield',
        color: 'green',
      },
    };
  }

  if (widgetId === 'gdpr-consent-status') {
    return {
      type: 'stat',
      data: {
        value: '12.5K',
        label: 'Consentimientos Válidos',
        change: 8,
        trend: 'up',
        icon: 'check-circle',
        color: 'green',
      },
    };
  }

  if (widgetId === 'gdpr-data-requests') {
    return {
      type: 'stat',
      data: {
        value: 7,
        label: 'Solicitudes Pendientes',
        change: 2,
        trend: 'up',
        icon: 'file-text',
        color: 'blue',
      },
    };
  }

  if (widgetId === 'fiscal-pending') {
    return {
      type: 'stat',
      data: {
        value: 3,
        label: 'Obligaciones Pendientes',
        icon: 'file-text',
        color: 'amber',
      },
    };
  }

  if (widgetId === 'fiscal-next-deadline') {
    return {
      type: 'stat',
      data: {
        value: '15',
        label: 'Días hasta vencimiento',
        suffix: ' días',
        icon: 'clock',
        color: 'purple',
      },
    };
  }

  if (widgetId === 'aml-alerts') {
    return {
      type: 'stat',
      data: {
        value: 12,
        label: 'Alertas Activas',
        change: -5,
        trend: 'down',
        icon: 'alert-triangle',
        color: 'red',
      },
    };
  }

  // Chart widgets
  if (widgetId === 'payroll-trend') {
    return {
      type: 'chart',
      data: {
        chartType: 'area',
        xAxisKey: 'month',
        showGrid: true,
        showLegend: true,
        stacked: true,
        series: [
          { key: 'critical', name: 'Crítico', color: '#ef4444' },
          { key: 'high', name: 'Alto', color: '#f97316' },
          { key: 'medium', name: 'Medio', color: '#eab308' },
        ],
        data: [
          { month: 'Ene', critical: 5, high: 12, medium: 28 },
          { month: 'Feb', critical: 4, high: 10, medium: 25 },
          { month: 'Mar', critical: 6, high: 14, medium: 30 },
          { month: 'Abr', critical: 3, high: 8, medium: 22 },
          { month: 'May', critical: 4, high: 11, medium: 26 },
          { month: 'Jun', critical: 2, high: 7, medium: 20 },
        ],
      },
    };
  }

  if (widgetId === 'gdpr-compliance-chart') {
    return {
      type: 'chart',
      data: {
        chartType: 'donut',
        xAxisKey: 'name',
        showLegend: true,
        series: [{ key: 'value', name: 'Valor' }],
        data: [
          { name: 'Cumple', value: 78 },
          { name: 'Parcial', value: 15 },
          { name: 'No Cumple', value: 7 },
        ],
      },
    };
  }

  if (widgetId === 'aml-transactions') {
    return {
      type: 'chart',
      data: {
        chartType: 'bar',
        xAxisKey: 'month',
        showGrid: true,
        series: [
          { key: 'analyzed', name: 'Analizadas', color: '#3b82f6' },
          { key: 'flagged', name: 'Marcadas', color: '#ef4444' },
        ],
        data: [
          { month: 'Ene', analyzed: 1200, flagged: 23 },
          { month: 'Feb', analyzed: 1350, flagged: 18 },
          { month: 'Mar', analyzed: 1100, flagged: 31 },
          { month: 'Abr', analyzed: 1450, flagged: 12 },
          { month: 'May', analyzed: 1300, flagged: 25 },
          { month: 'Jun', analyzed: 1500, flagged: 15 },
        ],
      },
    };
  }

  // List widgets
  if (widgetId === 'payroll-recent-risks') {
    return {
      type: 'list',
      data: {
        maxItems: 5,
        showViewAll: true,
        viewAllHref: '/risks?module=payroll',
        items: [
          {
            id: '1',
            title: 'Violación de horas extra',
            subtitle: 'María García · Hace 2h',
            severity: 'high',
            status: 'open',
            href: '/risks/1',
          },
          {
            id: '2',
            title: 'Contrato próximo a vencer',
            subtitle: 'Carlos López · Hace 5h',
            severity: 'medium',
            status: 'in_progress',
            href: '/risks/2',
          },
          {
            id: '3',
            title: 'Brecha salarial detectada',
            subtitle: 'Dpto. Ingeniería · Hace 1d',
            severity: 'critical',
            status: 'open',
            href: '/risks/3',
          },
          {
            id: '4',
            title: 'Ausencia no justificada',
            subtitle: 'Pedro Martínez · Hace 2d',
            severity: 'low',
            status: 'resolved',
            href: '/risks/4',
          },
        ],
      },
    };
  }

  // Progress widgets
  if (widgetId === 'payroll-by-type') {
    return {
      type: 'progress',
      data: {
        showPercentage: true,
        items: [
          { label: 'Horas Extra', value: 92 },
          { label: 'Contratos', value: 88 },
          { label: 'Salarios', value: 95 },
          { label: 'Vacaciones', value: 78 },
        ],
      },
    };
  }

  // Timeline widgets
  if (widgetId === 'gdpr-recent-events') {
    return {
      type: 'timeline',
      data: {
        maxEvents: 5,
        events: [
          {
            id: '1',
            title: 'Solicitud de acceso completada',
            description: 'Usuario #4521',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: 'success',
          },
          {
            id: '2',
            title: 'Nuevo consentimiento registrado',
            description: 'Marketing - Email',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            type: 'info',
          },
          {
            id: '3',
            title: 'Consentimiento expirado',
            description: 'Batch de 234 usuarios',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            type: 'warning',
          },
          {
            id: '4',
            title: 'Solicitud de eliminación recibida',
            description: 'Usuario #8932',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            type: 'info',
          },
        ],
      },
    };
  }

  // Table widgets
  if (widgetId === 'fiscal-calendar') {
    return {
      type: 'table',
      data: {
        columns: [
          { key: 'obligation', label: 'Obligación', type: 'text' },
          { key: 'deadline', label: 'Vencimiento', type: 'date' },
          { key: 'status', label: 'Estado', type: 'badge' },
          { key: 'progress', label: 'Progreso', type: 'progress' },
        ],
        rows: [
          { obligation: 'IVA Mensual', deadline: '2025-01-20', status: 'Pending', progress: 45 },
          { obligation: 'Retenciones IRPF', deadline: '2025-01-20', status: 'Pending', progress: 80 },
          { obligation: 'Modelo 347', deadline: '2025-02-28', status: 'Pending', progress: 10 },
          { obligation: 'Impuesto Sociedades', deadline: '2025-07-25', status: 'Active', progress: 0 },
        ],
      },
    };
  }

  // ==========================================================================
  // Banking Module Widgets
  // ==========================================================================

  if (widgetId === 'banking-balance') {
    return {
      type: 'stat',
      data: {
        value: '45.8K',
        label: 'Saldo Total',
        change: 12,
        trend: 'up',
        icon: 'wallet',
        color: 'green',
        prefix: '€',
      },
    };
  }

  if (widgetId === 'banking-alerts') {
    return {
      type: 'stat',
      data: {
        value: 7,
        label: 'Alertas Activas',
        change: 3,
        trend: 'up',
        icon: 'alert-triangle',
        color: 'red',
      },
    };
  }

  if (widgetId === 'banking-flagged') {
    return {
      type: 'stat',
      data: {
        value: 12,
        label: 'Tx. Sospechosas',
        change: -2,
        trend: 'down',
        icon: 'flag',
        color: 'amber',
      },
    };
  }

  if (widgetId === 'banking-accounts') {
    return {
      type: 'stat',
      data: {
        value: 3,
        label: 'Cuentas Conectadas',
        icon: 'building',
        color: 'blue',
      },
    };
  }

  if (widgetId === 'banking-flow-chart') {
    return {
      type: 'chart',
      data: {
        chartType: 'bar',
        xAxisKey: 'day',
        showGrid: true,
        showLegend: true,
        series: [
          { key: 'inflows', name: 'Entradas', color: '#22c55e' },
          { key: 'outflows', name: 'Salidas', color: '#ef4444' },
        ],
        data: [
          { day: '11 Dic', inflows: 12500, outflows: 8200 },
          { day: '12 Dic', inflows: 3200, outflows: 15800 },
          { day: '13 Dic', inflows: 8900, outflows: 4500 },
          { day: '14 Dic', inflows: 2100, outflows: 9800 },
          { day: '15 Dic', inflows: 18500, outflows: 6200 },
          { day: '16 Dic', inflows: 5400, outflows: 3100 },
        ],
      },
    };
  }

  if (widgetId === 'banking-recent-alerts') {
    return {
      type: 'list',
      data: {
        maxItems: 5,
        showViewAll: true,
        viewAllHref: '/banking/alerts',
        items: [
          {
            id: '1',
            title: 'Transaccion cercana al umbral de reporte',
            subtitle: '€9,850 · Hace 1h',
            severity: 'high',
            status: 'open',
            href: '/banking/alerts/1',
          },
          {
            id: '2',
            title: 'Contraparte desconocida detectada',
            subtitle: 'Tech Solutions Ltd · Hace 3h',
            severity: 'medium',
            status: 'investigating',
            href: '/banking/alerts/2',
          },
          {
            id: '3',
            title: 'Monto inusualmente alto',
            subtitle: '€24,500 · Hace 5h',
            severity: 'high',
            status: 'open',
            href: '/banking/alerts/3',
          },
          {
            id: '4',
            title: 'Transaccion a pais de alto riesgo',
            subtitle: 'Transferencia internacional · Hace 1d',
            severity: 'critical',
            status: 'open',
            href: '/banking/alerts/4',
          },
        ],
      },
    };
  }

  if (widgetId === 'banking-anomaly-timeline') {
    return {
      type: 'timeline',
      data: {
        maxEvents: 5,
        events: [
          {
            id: '1',
            title: 'Alerta de structuring resuelta',
            description: 'Marcada como falso positivo',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            type: 'success',
          },
          {
            id: '2',
            title: 'Nueva alerta de monto inusual',
            description: 'Transferencia de €15,200',
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            type: 'warning',
          },
          {
            id: '3',
            title: 'Sincronizacion completada',
            description: '47 nuevas transacciones',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            type: 'info',
          },
          {
            id: '4',
            title: 'Alerta critica detectada',
            description: 'Pais de alto riesgo - Revision requerida',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            type: 'error',
          },
        ],
      },
    };
  }

  // Default empty data
  return {
    type: 'stat',
    data: {
      value: 0,
      label: 'Sin datos',
      icon: 'activity',
      color: 'slate',
    },
  };
}

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  description?: string;
  size: string;
  priority: number;
}

interface ModuleWidgetConfig {
  moduleId: string;
  moduleName: string;
  widgets: WidgetConfig[];
}

interface WidgetData {
  type: string;
  data: unknown;
}

/**
 * GET /api/dashboard/config
 * Returns dashboard configuration including active modules and their widgets
 */
dashboardRoutes.get('/config', async (req, res) => {
  // No modules are currently active - all are in development
  const activeModules: string[] = [];

  const widgets = activeModules.flatMap((moduleId) => {
    const moduleConfig = MODULE_WIDGETS[moduleId];
    if (!moduleConfig) return [];

    return moduleConfig.widgets.map((widget) => ({
      ...widget,
      moduleId: moduleConfig.moduleId,
      moduleName: moduleConfig.moduleName,
    }));
  });

  // Sort by priority
  widgets.sort((a, b) => a.priority - b.priority);

  res.json({
    activeModules,
    widgets,
  });
});

/**
 * GET /api/dashboard/widgets
 * Returns all widgets with their data for the current tenant
 */
dashboardRoutes.get('/widgets', async (req, res) => {
  // No modules are currently active - all are in development
  const activeModules: string[] = [];

  const widgetsWithData = activeModules.flatMap((moduleId) => {
    const moduleConfig = MODULE_WIDGETS[moduleId];
    if (!moduleConfig) return [];

    return moduleConfig.widgets.map((widget) => ({
      ...widget,
      moduleId: moduleConfig.moduleId,
      moduleName: moduleConfig.moduleName,
      widgetData: generateWidgetData(widget.id, moduleId),
      lastUpdated: new Date().toISOString(),
    }));
  });

  // Sort by priority
  widgetsWithData.sort((a, b) => a.priority - b.priority);

  res.json({
    widgets: widgetsWithData,
    lastUpdated: new Date().toISOString(),
  });
});

/**
 * GET /api/dashboard/widgets/:widgetId
 * Returns data for a specific widget
 */
dashboardRoutes.get('/widgets/:widgetId', async (req, res) => {
  const { widgetId } = req.params;

  // Find the widget configuration
  let foundWidget: (WidgetConfig & { moduleId: string; moduleName: string }) | null = null;

  for (const moduleConfig of Object.values(MODULE_WIDGETS)) {
    const widget = moduleConfig.widgets.find((w) => w.id === widgetId);
    if (widget) {
      foundWidget = {
        ...widget,
        moduleId: moduleConfig.moduleId,
        moduleName: moduleConfig.moduleName,
      };
      break;
    }
  }

  if (!foundWidget) {
    return res.status(404).json({ error: 'Widget not found' });
  }

  const widgetData = generateWidgetData(widgetId, foundWidget.moduleId);

  res.json({
    ...foundWidget,
    widgetData,
    lastUpdated: new Date().toISOString(),
  });
});

/**
 * POST /api/dashboard/modules/:moduleId/enable
 * Enable a module for the current tenant
 */
dashboardRoutes.post('/modules/:moduleId/enable', async (req, res) => {
  const { moduleId } = req.params;

  if (!MODULE_WIDGETS[moduleId]) {
    return res.status(404).json({ error: 'Module not found' });
  }

  // TODO: Update tenant configuration in DB

  res.json({
    message: `Module ${moduleId} enabled`,
    moduleId,
  });
});

/**
 * POST /api/dashboard/modules/:moduleId/disable
 * Disable a module for the current tenant
 */
dashboardRoutes.post('/modules/:moduleId/disable', async (req, res) => {
  const { moduleId } = req.params;

  // TODO: Update tenant configuration in DB

  res.json({
    message: `Module ${moduleId} disabled`,
    moduleId,
  });
});
