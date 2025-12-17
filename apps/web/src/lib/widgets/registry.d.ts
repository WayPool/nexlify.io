/**
 * Widget Registry
 *
 * Central registry for widget components. Modules can register custom
 * widgets here, and the dashboard will render them dynamically.
 */
import type { ComponentType } from 'react';
import type { BaseWidgetProps } from './types';
type WidgetComponentType = ComponentType<BaseWidgetProps & {
    data: unknown;
}>;
/**
 * Register a custom widget component
 */
export declare function registerCustomWidget(componentName: string, component: WidgetComponentType): void;
/**
 * Get a custom widget component
 */
export declare function getCustomWidget(componentName: string): WidgetComponentType | undefined;
/**
 * Register a module-specific widget type override
 * e.g., Payroll module might want a custom 'stat' renderer
 */
export declare function registerWidgetTypeOverride(moduleId: string, widgetType: string, component: WidgetComponentType): void;
/**
 * Get a module-specific widget type override
 */
export declare function getWidgetTypeOverride(moduleId: string, widgetType: string): WidgetComponentType | undefined;
/**
 * Check if a custom widget is registered
 */
export declare function hasCustomWidget(componentName: string): boolean;
/**
 * Get all registered custom widget names
 */
export declare function getRegisteredCustomWidgets(): string[];
/**
 * Clear registry (useful for testing)
 */
export declare function clearRegistry(): void;
export {};
//# sourceMappingURL=registry.d.ts.map