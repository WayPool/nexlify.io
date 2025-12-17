/**
 * Dashboard Widget System Types
 *
 * This module defines the contract for modular dashboard widgets.
 * Each module can register widgets that conform to these types.
 */
export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export declare const WIDGET_SIZE_COLS: Record<WidgetSize, number>;
export type WidgetType = 'stat' | 'chart' | 'list' | 'table' | 'progress' | 'timeline' | 'map' | 'custom';
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
export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radar' | 'scatter';
export interface ChartDataPoint {
    label: string;
    [key: string]: number | string;
}
export interface ChartSeries {
    key: string;
    name: string;
    color?: string;
    type?: 'line' | 'area' | 'bar';
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
export interface ProgressItem {
    label: string;
    value: number;
    target?: number;
    color?: string;
}
export interface ProgressWidgetData {
    items: ProgressItem[];
    showPercentage?: boolean;
    orientation?: 'horizontal' | 'vertical';
}
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
export interface CustomWidgetData {
    component: string;
    props?: Record<string, unknown>;
}
export type WidgetData = {
    type: 'stat';
    data: StatWidgetData;
} | {
    type: 'chart';
    data: ChartWidgetData;
} | {
    type: 'list';
    data: ListWidgetData;
} | {
    type: 'table';
    data: TableWidgetData;
} | {
    type: 'progress';
    data: ProgressWidgetData;
} | {
    type: 'timeline';
    data: TimelineWidgetData;
} | {
    type: 'custom';
    data: CustomWidgetData;
};
export interface DashboardWidget {
    id: string;
    moduleId: string;
    moduleName: string;
    type: WidgetType;
    title: string;
    description?: string;
    size: WidgetSize;
    priority: number;
    refreshInterval?: number;
    permissions?: string[];
    config?: Record<string, unknown>;
}
export interface DashboardWidgetWithData extends DashboardWidget {
    data: WidgetData;
    loading?: boolean;
    error?: string;
    lastUpdated?: string;
}
export interface DashboardSection {
    id: string;
    title?: string;
    widgets: string[];
    collapsed?: boolean;
}
export interface DashboardLayout {
    sections: DashboardSection[];
    columns?: number;
}
export interface ModuleWidgetDefinition {
    moduleId: string;
    widgets: Omit<DashboardWidget, 'moduleId' | 'moduleName'>[];
}
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
//# sourceMappingURL=dashboard.d.ts.map