/**
 * Widget Renderer
 *
 * Dynamically renders the appropriate widget component based on type.
 */
import type { WidgetWithData } from '@/lib/widgets/types';
interface WidgetRendererProps {
    widget: WidgetWithData;
    onRefresh?: () => void;
}
export default function WidgetRenderer({ widget, onRefresh }: WidgetRendererProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=WidgetRenderer.d.ts.map