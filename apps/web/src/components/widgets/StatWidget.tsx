/**
 * Stat Widget
 *
 * Displays a single KPI with optional trend indicator.
 */

import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  CreditCard,
  Activity,
  Wallet,
  Flag,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import type { StatWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
import WidgetContainer from './WidgetContainer';

interface StatWidgetProps extends BaseWidgetProps {
  data: StatWidgetData;
}

const ICONS: Record<string, LucideIcon> = {
  'alert-triangle': AlertTriangle,
  'shield': Shield,
  'clock': Clock,
  'check-circle': CheckCircle2,
  'users': Users,
  'file-text': FileText,
  'credit-card': CreditCard,
  'activity': Activity,
  'wallet': Wallet,
  'flag': Flag,
  'building': Building2,
};

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    icon: 'text-slate-600 dark:text-slate-400',
  },
};

export default function StatWidget({ widget, data, loading, error, onRefresh }: StatWidgetProps) {
  const Icon = (data.icon && ICONS[data.icon]) || Activity;
  const colors = COLOR_CLASSES[data.color || 'blue'];

  const TrendIcon =
    data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;

  const trendColorClass =
    data.trend === 'up'
      ? 'text-green-600 dark:text-green-400'
      : data.trend === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-slate-500';

  return (
    <WidgetContainer widget={widget} loading={loading} error={error} onRefresh={onRefresh}>
      <div className="flex items-start justify-between">
        <div className={clsx('p-3 rounded-xl', colors.bg)}>
          <Icon className={clsx('w-6 h-6', colors.icon)} />
        </div>
        {data.change !== undefined && (
          <div className={clsx('flex items-center gap-1 text-sm font-medium', trendColorClass)}>
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(data.change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {data.prefix}
          {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
          {data.suffix}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{data.label}</div>
        {data.changeLabel && (
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{data.changeLabel}</div>
        )}
      </div>
    </WidgetContainer>
  );
}
