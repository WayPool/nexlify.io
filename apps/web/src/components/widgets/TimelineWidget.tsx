/**
 * Timeline Widget
 *
 * Displays a chronological list of events.
 */

import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimelineWidgetData, TimelineEvent, BaseWidgetProps } from '@/lib/widgets/types';
import WidgetContainer from './WidgetContainer';

interface TimelineWidgetProps extends BaseWidgetProps {
  data: TimelineWidgetData;
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800',
  },
};

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
      )}

      {/* Icon */}
      <div
        className={clsx(
          'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          config.bg
        )}
      >
        <Icon className={clsx('w-4 h-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {event.title}
            </p>
            {event.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {event.description}
              </p>
            )}
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: es })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TimelineWidget({
  widget,
  data,
  loading,
  error,
  onRefresh,
}: TimelineWidgetProps) {
  const { events, maxEvents = 5 } = data;
  const displayEvents = events.slice(0, maxEvents);

  return (
    <WidgetContainer widget={widget} loading={loading} error={error} onRefresh={onRefresh}>
      {displayEvents.length > 0 ? (
        <div className="space-y-0">
          {displayEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={index === displayEvents.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay eventos recientes
          </p>
        </div>
      )}
    </WidgetContainer>
  );
}
