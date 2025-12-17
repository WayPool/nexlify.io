/**
 * Dashboard Widget System Types
 *
 * This module defines the contract for modular dashboard widgets.
 * Each module can register widgets that conform to these types.
 */

// ============================================================================
// Widget Size & Layout
// ============================================================================

export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export const WIDGET_SIZE_COLS: Record<WidgetSize, number> = {
  sm: 1,   // 1/4 width
  md: 2,   // 1/2 width
  lg: 3,   // 3/4 width
  xl: 4,   // full width
  full: 4, // full width
};

// ============================================================================
// Widget Types
// ============================================================================

export type WidgetType =
  | 'stat'      // Single KPI with trend
  | 'chart'     // Various chart types
  | 'list'      // List of items
  | 'table'     // Tabular data
  | 'progress'  // Progress/compliance bars
  | 'timeline'  // Timeline of events
  | 'map'       // Geographic data
  | 'custom';   // Custom component

// ============================================================================
// Stat Widget
// ============================================================================

export interface StatWidgetData {
  value: number | string;
  label: string;
  change?: number;           // Percentage change
  changeLabel?: string;      // e.g., "vs last month"
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;           // e.g., "€", "$"
  suffix?: string;           // e.g., "%", "días"
  icon?: string;             // Icon name from lucide
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
}

// ============================================================================
// Chart Widget
// ============================================================================

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radar' | 'scatter';

export interface ChartDataPoint {
  label: string;
  [key: string]: number | string; // Allow multiple series
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
  type?: 'line' | 'area' | 'bar'; // For mixed charts
}

export interface ChartWidgetData {
  chartType: ChartType;
  data: ChartDataPoint[];
  series: ChartSeries[];
  xAxisKey: string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

// ============================================================================
// List Widget
// ============================================================================

export type ListItemSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ListItemStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  severity?: ListItemSeverity;
  status?: ListItemStatus;
  timestamp?: string;
  href?: string;
  metadata?: Record<string, string | number>;
}

export interface ListWidgetData {
  items: ListItem[];
  maxItems?: number;
  showViewAll?: boolean;
  viewAllHref?: string;
  emptyMessage?: string;
}

// ============================================================================
// Table Widget
// ============================================================================

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'progress' | 'link';
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
}

export interface TableWidgetData {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// ============================================================================
// Progress Widget
// ============================================================================

export interface ProgressItem {
  label: string;
  value: number;      // 0-100
  target?: number;    // Target value
  color?: string;
}

export interface ProgressWidgetData {
  items: ProgressItem[];
  showPercentage?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

// ============================================================================
// Timeline Widget
// ============================================================================

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface TimelineWidgetData {
  events: TimelineEvent[];
  maxEvents?: number;
}

// ============================================================================
// Custom Widget
// ============================================================================

export interface CustomWidgetData {
  component: string;  // Component name in registry
  props?: Record<string, unknown>;
}

// ============================================================================
// Union Type for Widget Data
// ============================================================================

export type WidgetData =
  | { type: 'stat'; data: StatWidgetData }
  | { type: 'chart'; data: ChartWidgetData }
  | { type: 'list'; data: ListWidgetData }
  | { type: 'table'; data: TableWidgetData }
  | { type: 'progress'; data: ProgressWidgetData }
  | { type: 'timeline'; data: TimelineWidgetData }
  | { type: 'custom'; data: CustomWidgetData };

// ============================================================================
// Widget Definition (what modules register)
// ============================================================================

export interface DashboardWidget {
  id: string;
  moduleId: string;
  moduleName: string;
  type: WidgetType;
  title: string;
  description?: string;
  size: WidgetSize;
  priority: number;        // Lower = higher priority (shown first)
  refreshInterval?: number; // Auto-refresh in ms
  permissions?: string[];   // Required permissions to view
  config?: Record<string, unknown>; // Module-specific config
}

export interface DashboardWidgetWithData extends DashboardWidget {
  data: WidgetData;
  loading?: boolean;
  error?: string;
  lastUpdated?: string;
}

// ============================================================================
// Dashboard Layout Configuration
// ============================================================================

export interface DashboardSection {
  id: string;
  title?: string;
  widgets: string[]; // Widget IDs
  collapsed?: boolean;
}

export interface DashboardLayout {
  sections: DashboardSection[];
  columns?: number; // Default grid columns (4)
}

// ============================================================================
// Module Widget Registration
// ============================================================================

export interface ModuleWidgetDefinition {
  moduleId: string;
  widgets: Omit<DashboardWidget, 'moduleId' | 'moduleName'>[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DashboardConfigResponse {
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  activeModules: string[];
}

export interface WidgetDataResponse {
  widgetId: string;
  data: WidgetData;
  lastUpdated: string;
}
