/**
 * Chart Widget
 *
 * Renders various chart types using Recharts.
 */
import type { ChartWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
interface ChartWidgetProps extends BaseWidgetProps {
    data: ChartWidgetData;
}
export default function ChartWidget({ widget, data, loading, error, onRefresh }: ChartWidgetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ChartWidget.d.ts.map