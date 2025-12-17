/**
 * Widget Renderer
 *
 * Dynamically renders the appropriate widget component based on type.
 */

import type { WidgetWithData } from '@/lib/widgets/types';
import { getCustomWidget, getWidgetTypeOverride } from '@/lib/widgets/registry';
import StatWidget from './StatWidget';
import ChartWidget from './ChartWidget';
import ListWidget from './ListWidget';
import ProgressWidget from './ProgressWidget';
import TableWidget from './TableWidget';
import TimelineWidget from './TimelineWidget';
import WidgetContainer from './WidgetContainer';

interface WidgetRendererProps {
  widget: WidgetWithData;
  onRefresh?: () => void;
}

export default function WidgetRenderer({ widget, onRefresh }: WidgetRendererProps) {
  const { widgetData, loading, error, ...widgetConfig } = widget;

  // Guard against missing widgetData
  if (!widgetData || !widgetData.type) {
    return (
      <WidgetContainer widget={widgetConfig as any} error="Datos del widget no disponibles">
        <div />
      </WidgetContainer>
    );
  }

  // Check for module-specific override
  const OverrideComponent = getWidgetTypeOverride(widget.moduleId, widget.type);
  if (OverrideComponent) {
    return (
      <OverrideComponent
        widget={widgetConfig}
        data={widgetData.data}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
      />
    );
  }

  // Render based on widget type
  switch (widgetData.type) {
    case 'stat':
      return (
        <StatWidget
          widget={widgetConfig}
          data={widgetData.data}
          loading={loading}
          error={error}
          onRefresh={onRefresh}
        />
      );

    case 'chart':
      return (
        <ChartWidget
          widget={widgetConfig}
          data={widgetData.data}
          loading={loading}
          error={error}
          onRefresh={onRefresh}
        />
      );

    case 'list':
      return (
        <ListWidget
          widget={widgetConfig}
          data={widgetData.data}
          loading={loading}
          error={error}
          onRefresh={onRefresh}
        />
      );

    case 'progress':
      return (
        <ProgressWidget
          widget={widgetConfig}
          data={widgetData.data}
          loading={loading}
          error={error}
          onRefresh={onRefresh}
        />
      );

    case 'table':
      return (
        <TableWidget
          widget={widgetConfig}
          data={widgetData.data}
          loading={loading}
          error={error}
          onRefresh={onRefresh}
        />
      );

    case 'timeline':
      return (
        <TimelineWidget
          widget={widgetConfig}
          data={widgetData.data}
          loading={loading}
          error={error}
          onRefresh={onRefresh}
        />
      );

    case 'custom':
      const CustomComponent = getCustomWidget(widgetData.data.component);
      if (CustomComponent) {
        return (
          <CustomComponent
            widget={widgetConfig}
            data={widgetData.data.props}
            loading={loading}
            error={error}
            onRefresh={onRefresh}
          />
        );
      }
      return (
        <WidgetContainer widget={widgetConfig} error={`Componente no encontrado: ${widgetData.data.component}`}>
          <div />
        </WidgetContainer>
      );

    default:
      return (
        <WidgetContainer widget={widgetConfig} error="Tipo de widget no soportado">
          <div />
        </WidgetContainer>
      );
  }
}
