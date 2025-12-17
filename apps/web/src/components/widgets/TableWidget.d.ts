/**
 * Table Widget
 *
 * Displays tabular data with support for various column types.
 */
import type { TableWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
interface TableWidgetProps extends BaseWidgetProps {
    data: TableWidgetData;
}
export default function TableWidget({ widget, data, loading, error, onRefresh, }: TableWidgetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TableWidget.d.ts.map