/**
 * Widget Container
 *
 * Wrapper component for all widgets. Provides consistent styling,
 * loading states, error handling, and refresh functionality.
 */

import { RefreshCw, AlertCircle, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { Widget } from '@/lib/widgets/types';
import { WIDGET_SIZE_CLASSES } from '@/lib/widgets/types';

interface WidgetContainerProps {
  widget: Widget;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function WidgetContainer({
  widget,
  loading,
  error,
  onRefresh,
  children,
  className,
  noPadding,
}: WidgetContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800',
        'hover:shadow-lg transition-shadow duration-200',
        WIDGET_SIZE_CLASSES[widget.size],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {widget.title}
          </h3>
          {widget.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {widget.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-3">
          {/* Module Badge */}
          <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
            {widget.moduleName}
          </span>
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw
                className={clsx(
                  'w-4 h-4 text-slate-400',
                  loading && 'animate-spin'
                )}
              />
            </button>
          )}
          {/* More Options */}
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Más opciones"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={clsx(!noPadding && 'p-5')}>
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Reintentar
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
