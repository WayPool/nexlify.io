/**
 * Stat Widget
 *
 * Displays a single KPI with optional trend indicator.
 */
import type { StatWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
interface StatWidgetProps extends BaseWidgetProps {
    data: StatWidgetData;
}
export default function StatWidget({ widget, data, loading, error, onRefresh }: StatWidgetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StatWidget.d.ts.map