/**
 * Widget Container
 *
 * Wrapper component for all widgets. Provides consistent styling,
 * loading states, error handling, and refresh functionality.
 */
import type { Widget } from '@/lib/widgets/types';
interface WidgetContainerProps {
    widget: Widget;
    loading?: boolean;
    error?: string;
    onRefresh?: () => void;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}
export default function WidgetContainer({ widget, loading, error, onRefresh, children, className, noPadding, }: WidgetContainerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=WidgetContainer.d.ts.map