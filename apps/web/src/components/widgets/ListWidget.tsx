/**
 * List Widget
 *
 * Displays a list of items with optional severity and status indicators.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Clock, CheckCircle2, XCircle, Info } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ListWidgetData, ListItem, BaseWidgetProps } from '@/lib/widgets/types';
import WidgetContainer from './WidgetContainer';

interface ListWidgetProps extends BaseWidgetProps {
  data: ListWidgetData;
}

const SEVERITY_STYLES = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
  info: 'bg-blue-500',
};

const SEVERITY_BADGES = {
  critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
};

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  open: AlertCircle,
  in_progress: Clock,
  investigating: Clock,
  resolved: CheckCircle2,
  dismissed: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  open: 'text-amber-500',
  in_progress: 'text-blue-500',
  investigating: 'text-blue-500',
  resolved: 'text-green-500',
  dismissed: 'text-slate-400',
};

function ListItemRow({ item }: { item: ListItem }) {
  const StatusIcon = (item.status && STATUS_ICONS[item.status]) || Info;
  const statusColor = (item.status && STATUS_COLORS[item.status]) || 'text-slate-400';

  const content = (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
      {item.severity && (
        <div
          className={clsx(
            'w-2 h-2 rounded-full flex-shrink-0',
            SEVERITY_STYLES[item.severity]
          )}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {item.subtitle}
          </p>
        )}
      </div>
      {item.severity && (
        <span
          className={clsx(
            'px-2 py-0.5 rounded-md text-xs font-medium hidden sm:inline-flex',
            SEVERITY_BADGES[item.severity]
          )}
        >
          {item.severity === 'critical' ? 'Crítico' :
           item.severity === 'high' ? 'Alto' :
           item.severity === 'medium' ? 'Medio' :
           item.severity === 'low' ? 'Bajo' : 'Info'}
        </span>
      )}
      {item.status && (
        <StatusIcon className={clsx('w-4 h-4 flex-shrink-0', statusColor)} />
      )}
      {item.timestamp && (
        <span className="text-xs text-slate-400 flex-shrink-0 hidden lg:inline">
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: es })}
        </span>
      )}
    </div>
  );

  if (item.href) {
    return <Link to={item.href}>{content}</Link>;
  }

  return content;
}

export default function ListWidget({ widget, data, loading, error, onRefresh }: ListWidgetProps) {
  const { items, maxItems = 5, showViewAll, viewAllHref, emptyMessage } = data;
  const displayItems = items.slice(0, maxItems);

  return (
    <WidgetContainer widget={widget} loading={loading} error={error} onRefresh={onRefresh} noPadding>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {displayItems.length > 0 ? (
          displayItems.map((item) => <ListItemRow key={item.id} item={item} />)
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {emptyMessage || 'No hay elementos para mostrar'}
            </p>
          </div>
        )}
      </div>
      {showViewAll && viewAllHref && items.length > maxItems && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            to={viewAllHref}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
          >
            Ver todos ({items.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </WidgetContainer>
  );
}
