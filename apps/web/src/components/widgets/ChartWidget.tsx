/**
 * Chart Widget
 *
 * Renders various chart types using Recharts.
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartWidgetData, BaseWidgetProps } from '@/lib/widgets/types';
import WidgetContainer from './WidgetContainer';

interface ChartWidgetProps extends BaseWidgetProps {
  data: ChartWidgetData;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
];

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '12px',
  color: '#f1f5f9',
};

export default function ChartWidget({ widget, data, loading, error, onRefresh }: ChartWidgetProps) {
  const { chartType, data: chartData, series, xAxisKey, showLegend, showGrid, stacked } = data;

  const getSeriesColor = (index: number, seriesItem?: { color?: string }) => {
    return seriesItem?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
            {series.map((s, i) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stackId={stacked ? '1' : undefined}
                stroke={getSeriesColor(i, s)}
                fill={getSeriesColor(i, s)}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stackId={stacked ? '1' : undefined}
                fill={getSeriesColor(i, s)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={getSeriesColor(i, s)}
                strokeWidth={2}
                dot={{ fill: getSeriesColor(i, s), strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={series[0]?.key || 'value'}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? 50 : 0}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  const chart = renderChart();

  return (
    <WidgetContainer widget={widget} loading={loading} error={error} onRefresh={onRefresh}>
      <div className="h-64">
        {chart ? (
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Tipo de gráfico no soportado
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
