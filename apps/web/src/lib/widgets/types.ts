/**
 * Dashboard Widget Types for Frontend
 */

import type { ComponentType } from 'react';

// ============================================================================
// Widget Sizes
// ============================================================================

export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export const WIDGET_SIZE_CLASSES: Record<WidgetSize, string> = {
  sm: 'col-span-1',
  md: 'col-span-1 lg:col-span-2',
  lg: 'col-span-1 lg:col-span-3',
  xl: 'col-span-1 lg:col-span-4',
  full: 'col-span-full',
};

// ============================================================================
// Widget Types
// ============================================================================

export type WidgetType = 'stat' | 'chart' | 'list' | 'table' | 'progress' | 'timeline' | 'custom';

// ============================================================================
// Stat Widget
// ============================================================================

export interface StatWidgetData {
  value: number | string;
  label: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
}

// ============================================================================
// Chart Widget
// ============================================================================

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut';

export interface ChartDataPoint {
  label: string;
  [key: string]: number | string;
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
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
// Progress Widget
// ============================================================================

export interface ProgressItem {
  label: string;
  value: number;
  target?: number;
  color?: string;
}

export interface ProgressWidgetData {
  items: ProgressItem[];
  showPercentage?: boolean;
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
}

export interface TimelineWidgetData {
  events: TimelineEvent[];
  maxEvents?: number;
}

// ============================================================================
// Table Widget
// ============================================================================

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'progress';
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableWidgetData {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}

// ============================================================================
// Custom Widget
// ============================================================================

export interface CustomWidgetData {
  component: string;
  props?: Record<string, unknown>;
}

// ============================================================================
// Widget Data Union
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
// Widget Definition
// ============================================================================

export interface Widget {
  id: string;
  moduleId: string;
  moduleName: string;
  type: WidgetType;
  title: string;
  description?: string;
  size: WidgetSize;
  priority: number;
  refreshInterval?: number;
}

export interface WidgetWithData extends Widget {
  widgetData: WidgetData;
  loading?: boolean;
  error?: string;
  lastUpdated?: string;
}

// ============================================================================
// Widget Component Props
// ============================================================================

export interface BaseWidgetProps {
  widget: Widget;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

export interface StatWidgetProps extends BaseWidgetProps {
  data: StatWidgetData;
}

export interface ChartWidgetProps extends BaseWidgetProps {
  data: ChartWidgetData;
}

export interface ListWidgetProps extends BaseWidgetProps {
  data: ListWidgetData;
}

export interface ProgressWidgetProps extends BaseWidgetProps {
  data: ProgressWidgetData;
}

export interface TimelineWidgetProps extends BaseWidgetProps {
  data: TimelineWidgetData;
}

export interface TableWidgetProps extends BaseWidgetProps {
  data: TableWidgetData;
}

export interface CustomWidgetProps extends BaseWidgetProps {
  data: CustomWidgetData;
}

// ============================================================================
// Widget Registry Types
// ============================================================================

export type WidgetComponent<T = unknown> = ComponentType<BaseWidgetProps & { data: T }>;

export interface WidgetRegistry {
  stat: WidgetComponent<StatWidgetData>;
  chart: WidgetComponent<ChartWidgetData>;
  list: WidgetComponent<ListWidgetData>;
  table: WidgetComponent<TableWidgetData>;
  progress: WidgetComponent<ProgressWidgetData>;
  timeline: WidgetComponent<TimelineWidgetData>;
  custom: Record<string, WidgetComponent<unknown>>;
}
