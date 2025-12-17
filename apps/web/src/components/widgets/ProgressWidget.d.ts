/**
 * Progress Widget
 *
 * Displays progress bars for compliance or completion metrics.
 */
import type { ProgressWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
interface ProgressWidgetProps extends BaseWidgetProps {
    data: ProgressWidgetData;
}
export default function ProgressWidget({ widget, data, loading, error, onRefresh, }: ProgressWidgetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ProgressWidget.d.ts.map