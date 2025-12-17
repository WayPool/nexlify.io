/**
 * Table Widget
 *
 * Displays tabular data with support for various column types.
 */

import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TableWidgetData, TableColumn, BaseWidgetProps } from '@/lib/widgets/types';
import WidgetContainer from './WidgetContainer';

interface TableWidgetProps extends BaseWidgetProps {
  data: TableWidgetData;
}

function CellContent({ column, value }: { column: TableColumn; value: unknown }) {
  const stringValue = String(value ?? '');

  switch (column.type) {
    case 'number':
      return (
        <span className="font-mono">
          {typeof value === 'number' ? value.toLocaleString() : stringValue}
        </span>
      );

    case 'date':
      try {
        return (
          <span>
            {format(new Date(stringValue), 'dd MMM yyyy', { locale: es })}
          </span>
        );
      } catch {
        return <span>{stringValue}</span>;
      }

    case 'badge':
      const badgeColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      };
      const colorClass = badgeColors[stringValue.toLowerCase()] || badgeColors.inactive;
      return (
        <span className={clsx('px-2 py-0.5 rounded-md text-xs font-medium', colorClass)}>
          {stringValue}
        </span>
      );

    case 'progress':
      const progressValue = typeof value === 'number' ? value : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full',
                progressValue >= 80 ? 'bg-green-500' : progressValue >= 50 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-8">
            {progressValue}%
          </span>
        </div>
      );

    default:
      return <span>{stringValue}</span>;
  }
}

export default function TableWidget({
  widget,
  data,
  loading,
  error,
  onRefresh,
}: TableWidgetProps) {
  const { columns, rows } = data;

  return (
    <WidgetContainer widget={widget} loading={loading} error={error} onRefresh={onRefresh} noPadding>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    !column.align && 'text-left'
                  )}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={clsx(
                        'px-4 py-3 text-sm text-slate-700 dark:text-slate-300',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      <CellContent column={column} value={row[column.key]} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </WidgetContainer>
  );
}
