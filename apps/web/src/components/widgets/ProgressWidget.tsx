/**
 * Progress Widget
 *
 * Displays progress bars for compliance or completion metrics.
 */

import clsx from 'clsx';
import type { ProgressWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
import WidgetContainer from './WidgetContainer';

interface ProgressWidgetProps extends BaseWidgetProps {
  data: ProgressWidgetData;
}

function getProgressColor(value: number, target?: number): string {
  const threshold = target || 100;
  const percentage = (value / threshold) * 100;

  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function ProgressWidget({
  widget,
  data,
  loading,
  error,
  onRefresh,
}: ProgressWidgetProps) {
  const { items, showPercentage = true } = data;

  return (
    <WidgetContainer widget={widget} loading={loading} error={error} onRefresh={onRefresh}>
      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = Math.min(100, Math.max(0, item.value));
          const color = item.color || getProgressColor(item.value, item.target);

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                {showPercentage && (
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.value}%
                    {item.target && item.target !== 100 && (
                      <span className="text-slate-400 font-normal"> / {item.target}%</span>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-500', color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {item.target && item.target !== 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500"
                    style={{ left: `${item.target}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetContainer>
  );
}
