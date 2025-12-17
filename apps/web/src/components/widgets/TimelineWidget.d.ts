/**
 * Timeline Widget
 *
 * Displays a chronological list of events.
 */
import type { TimelineWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
interface TimelineWidgetProps extends BaseWidgetProps {
    data: TimelineWidgetData;
}
export default function TimelineWidget({ widget, data, loading, error, onRefresh, }: TimelineWidgetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TimelineWidget.d.ts.map