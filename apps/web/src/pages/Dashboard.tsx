/**
 * Dashboard Page
 *
 * Central command center showing key metrics.
 * When no modules are active, displays base metrics at 0.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Boxes,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  BarChart3,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  suffix?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    accent: 'bg-blue-500',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    accent: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    accent: 'bg-amber-500',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    accent: 'bg-red-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    accent: 'bg-purple-500',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    icon: 'text-slate-600 dark:text-slate-400',
    accent: 'bg-slate-500',
  },
};

// Base metrics - these will show 0 when no modules are connected
const baseMetrics: MetricCard[] = [
  {
    id: 'total-risks',
    title: 'Riesgos Totales',
    value: 0,
    description: 'Riesgos detectados activos',
    icon: AlertTriangle,
    color: 'amber',
    trend: 'neutral',
  },
  {
    id: 'compliance-score',
    title: 'Cumplimiento Global',
    value: 0,
    suffix: '%',
    description: 'Índice de cumplimiento',
    icon: Shield,
    color: 'green',
    trend: 'neutral',
  },
  {
    id: 'active-modules',
    title: 'Módulos Activos',
    value: 0,
    description: 'De 36 disponibles',
    icon: Boxes,
    color: 'blue',
    trend: 'neutral',
  },
  {
    id: 'detectors-running',
    title: 'Detectores Activos',
    value: 0,
    description: 'Analizando en tiempo real',
    icon: Activity,
    color: 'purple',
    trend: 'neutral',
  },
];

function TrendIndicator({ trend, value }: { trend?: 'up' | 'down' | 'neutral'; value?: number }) {
  if (!trend || trend === 'neutral' || !value) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <Minus className="w-3 h-3" />
        Sin cambios
      </span>
    );
  }

  const isPositive = trend === 'up';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(value)}%
    </span>
  );
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const colors = colorClasses[metric.color];
  const Icon = metric.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden"
    >
      {/* Accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent} opacity-80`} />

      {/* Background glow on hover */}
      <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <TrendIndicator trend={metric.trend} value={metric.trendValue} />
        </div>

        {/* Value */}
        <div className="mb-2">
          <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {metric.value}
          </span>
          {metric.suffix && (
            <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500 ml-1">
              {metric.suffix}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {metric.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {metric.description}
        </p>
      </div>
    </motion.div>
  );
}

function EmptyStateCard() {
  return (
    <motion.div
      variants={itemVariants}
      className="col-span-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg shadow-primary-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Bienvenido a Nexlify
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Tu plataforma de gestión de riesgos y cumplimiento está lista.
          Activa módulos para comenzar a detectar riesgos y monitorear el cumplimiento de tu organización.
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">40</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Módulos</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">395+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Detectores</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Monitoreo</div>
          </div>
        </div>

        <Link
          to="/modules"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
        >
          <Boxes className="w-5 h-5" />
          Explorar Módulos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function QuickActionsCard() {
  const actions = [
    {
      icon: Boxes,
      title: 'Activar Módulos',
      description: 'Configura los módulos de detección',
      href: '/modules',
      color: 'blue',
    },
    {
      icon: BarChart3,
      title: 'Ver Reportes',
      description: 'Analiza tendencias y métricas',
      href: '/reports',
      color: 'green',
    },
    {
      icon: Zap,
      title: 'Configuración',
      description: 'Personaliza tu experiencia',
      href: '/settings',
      color: 'purple',
    },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Acciones Rápidas
      </h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color as keyof typeof colorClasses];

          return (
            <Link
              key={action.title}
              to={action.href}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

function SystemStatusCard() {
  const statuses = [
    { label: 'API', status: 'operational', icon: CheckCircle2 },
    { label: 'Base de Datos', status: 'operational', icon: CheckCircle2 },
    { label: 'Detectores', status: 'standby', icon: Clock },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Estado del Sistema
      </h3>
      <div className="space-y-3">
        {statuses.map((item) => {
          const Icon = item.icon;
          const isOperational = item.status === 'operational';

          return (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-4 h-4 ${
                    isOperational
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isOperational
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isOperational ? 'Operativo' : 'En espera'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Panel de Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Visión general de riesgos y cumplimiento
            <span className="text-xs ml-2">
              · Actualizado {lastUpdated.toLocaleTimeString('es-ES')}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw
              className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {baseMetrics.map((metric) => (
          <MetricCardComponent key={metric.id} metric={metric} />
        ))}
      </motion.div>

      {/* Empty State + Side Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Empty State */}
        <div className="lg:col-span-2">
          <EmptyStateCard />
        </div>

        {/* Side Cards */}
        <div className="space-y-6">
          <QuickActionsCard />
          <SystemStatusCard />
        </div>
      </motion.div>
    </div>
  );
}
