/**
 * List Widget
 *
 * Displays a list of items with optional severity and status indicators.
 */
import type { ListWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
interface ListWidgetProps extends BaseWidgetProps {
    data: ListWidgetData;
}
export default function ListWidget({ widget, data, loading, error, onRefresh }: ListWidgetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ListWidget.d.ts.map