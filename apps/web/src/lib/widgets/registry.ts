/**
 * Widget Registry
 *
 * Central registry for widget components. Modules can register custom
 * widgets here, and the dashboard will render them dynamically.
 */

import type { ComponentType } from 'react';
import type { BaseWidgetProps } from './types';

type WidgetComponentType = ComponentType<BaseWidgetProps & { data: unknown }>;

// Registry for custom widgets (module-specific)
const customWidgetRegistry = new Map<string, WidgetComponentType>();

// Registry for widget type overrides (if modules want custom renderers)
const widgetTypeOverrides = new Map<string, Map<string, WidgetComponentType>>();

/**
 * Register a custom widget component
 */
export function registerCustomWidget(
  componentName: string,
  component: WidgetComponentType
): void {
  customWidgetRegistry.set(componentName, component);
}

/**
 * Get a custom widget component
 */
export function getCustomWidget(componentName: string): WidgetComponentType | undefined {
  return customWidgetRegistry.get(componentName);
}

/**
 * Register a module-specific widget type override
 * e.g., Payroll module might want a custom 'stat' renderer
 */
export function registerWidgetTypeOverride(
  moduleId: string,
  widgetType: string,
  component: WidgetComponentType
): void {
  if (!widgetTypeOverrides.has(moduleId)) {
    widgetTypeOverrides.set(moduleId, new Map());
  }
  widgetTypeOverrides.get(moduleId)!.set(widgetType, component);
}

/**
 * Get a module-specific widget type override
 */
export function getWidgetTypeOverride(
  moduleId: string,
  widgetType: string
): WidgetComponentType | undefined {
  return widgetTypeOverrides.get(moduleId)?.get(widgetType);
}

/**
 * Check if a custom widget is registered
 */
export function hasCustomWidget(componentName: string): boolean {
  return customWidgetRegistry.has(componentName);
}

/**
 * Get all registered custom widget names
 */
export function getRegisteredCustomWidgets(): string[] {
  return Array.from(customWidgetRegistry.keys());
}

/**
 * Clear registry (useful for testing)
 */
export function clearRegistry(): void {
  customWidgetRegistry.clear();
  widgetTypeOverrides.clear();
}
