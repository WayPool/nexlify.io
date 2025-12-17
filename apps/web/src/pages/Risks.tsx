/**
 * Risks Page
 *
 * Displays all risks/alerts detected by active modules.
 * When no modules are active, shows an empty state inviting users to activate modules.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  AlertTriangle,
  Clock,
  User,
  Building2,
  ChevronRight,
  X,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Shield,
  FileText,
  ExternalLink,
  Boxes,
  ArrowRight,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface Risk {
  id: string;
  title: string;
  description: string;
  module: string;
  moduleId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  entity: { type: string; name: string; id?: string };
  detectedAt: string;
  impact: number;
  likelihood: number;
  actions: string[];
  evidence?: { type: string; label: string; ref: string }[];
}

// Empty array - risks will come from active modules via API
const risks: Risk[] = [];

const severityConfig = {
  critical: { label: 'Crítico', color: 'red', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-500' },
  high: { label: 'Alto', color: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500' },
  medium: { label: 'Medio', color: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500' },
  low: { label: 'Bajo', color: 'green', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-500' },
};

const statusConfig = {
  open: { label: 'Abierto', icon: AlertTriangle, color: 'text-amber-500' },
  in_progress: { label: 'En Progreso', icon: Clock, color: 'text-blue-500' },
  resolved: { label: 'Resuelto', icon: CheckCircle2, color: 'text-green-500' },
  dismissed: { label: 'Descartado', icon: XCircle, color: 'text-slate-500' },
};

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full border-2 border-slate-200 dark:border-slate-700">
          <Shield className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
        Sin riesgos detectados
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed">
        Actualmente no hay módulos activos detectando riesgos. Activa módulos para comenzar a monitorear
        riesgos y recibir alertas en tiempo real.
      </p>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">40</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Módulos disponibles</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">395+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Detectores de riesgo</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">24/7</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Monitoreo continuo</div>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        to="/modules"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
      >
        <Boxes className="w-5 h-5" />
        Activar Módulos
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Feature Preview */}
      <div className="mt-12 w-full max-w-3xl">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 text-center">
          Cuando los módulos estén activos, podrás:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: AlertTriangle, title: 'Ver riesgos detectados', description: 'Lista completa de alertas por severidad y módulo' },
            { icon: Bell, title: 'Recibir notificaciones', description: 'Alertas en tiempo real de nuevos riesgos' },
            { icon: CheckCircle2, title: 'Gestionar resolución', description: 'Flujos de trabajo para resolver incidencias' },
            { icon: Shield, title: 'Trazabilidad blockchain', description: 'Evidencia inmutable de cada detección' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <feature.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">{feature.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RiskCard({ risk, isSelected, onClick }: { risk: Risk; isSelected: boolean; onClick: () => void }) {
  const severity = severityConfig[risk.severity];
  const status = statusConfig[risk.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={clsx(
        'p-4 bg-white dark:bg-slate-900 rounded-xl border cursor-pointer transition-all',
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={clsx(
            'w-1 h-full min-h-[60px] rounded-full flex-shrink-0',
            risk.severity === 'critical' && 'bg-red-500',
            risk.severity === 'high' && 'bg-orange-500',
            risk.severity === 'medium' && 'bg-amber-500',
            risk.severity === 'low' && 'bg-green-500'
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {risk.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {risk.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium', severity.bg, severity.text)}>
              {severity.label}
            </span>
            <div className={clsx('flex items-center gap-1.5 text-sm', status.color)}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {risk.module}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {risk.entity.name}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RiskDetailPanel({ risk, onClose }: { risk: Risk; onClose: () => void }) {
  const severity = severityConfig[risk.severity];

  return (
    <motion.div
      initial={{ x: 450, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 450, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-16 bottom-0 w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto z-30"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-medium',
                  severity.bg,
                  severity.text
                )}
              >
                {severity.label}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                #{risk.id}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {risk.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4 mb-6">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = risk.status === key;
            return (
              <button
                key={key}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Descripción
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {risk.description}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Impacto Estimado</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              €{risk.impact.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Probabilidad</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {Math.round(risk.likelihood * 100)}%
            </p>
          </div>
        </div>

        {/* Entity */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Entidad Afectada
          </h3>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            {risk.entity.type === 'employee' ? (
              <User className="w-5 h-5 text-slate-400" />
            ) : (
              <Building2 className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {risk.entity.name}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {risk.entity.type}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Acciones Recomendadas
          </h3>
          <div className="space-y-2">
            {risk.actions.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Resolver
          </button>
          <button className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors">
            <FileText className="w-5 h-5" />
          </button>
        </div>

        {/* Blockchain Proof */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
              Trazabilidad Blockchain
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Este riesgo está anclado en blockchain para garantizar su inmutabilidad.
          </p>
          <button className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:underline">
            Ver prueba <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Risks() {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.entity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || risk.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    const matchesModule = moduleFilter === 'all' || risk.module === moduleFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesModule;
  });

  const modules = [...new Set(risks.map((r) => r.module))];
  const hasRisks = risks.length > 0;

  // If no risks, show empty state
  if (!hasRisks) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Riesgos
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Monitoreo y gestión de alertas detectadas por los módulos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl opacity-50 cursor-not-allowed"
              title="Sin datos para actualizar"
            >
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Summary Cards - All zeros */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Críticos', value: 0, color: 'red' },
            { label: 'Altos', value: 0, color: 'orange' },
            { label: 'Medios', value: 0, color: 'amber' },
            { label: 'Bajos', value: 0, color: 'green' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-3 h-3 rounded-full',
                  stat.color === 'red' && 'bg-red-500',
                  stat.color === 'orange' && 'bg-orange-500',
                  stat.color === 'amber' && 'bg-amber-500',
                  stat.color === 'green' && 'bg-green-500'
                )} />
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Main List */}
      <div className={clsx('flex-1 flex flex-col', selectedRisk && 'lg:mr-[450px]')}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Gestión de Riesgos
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {filteredRisks.length} riesgos encontrados
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar riesgos..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Todas las severidades</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Medio</option>
              <option value="low">Bajo</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="open">Abierto</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resuelto</option>
              <option value="dismissed">Descartado</option>
            </select>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Todos los módulos</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Risk List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {filteredRisks.map((risk) => (
            <RiskCard
              key={risk.id}
              risk={risk}
              isSelected={selectedRisk?.id === risk.id}
              onClick={() => setSelectedRisk(risk)}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedRisk && (
          <RiskDetailPanel
            risk={selectedRisk}
            onClose={() => setSelectedRisk(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
