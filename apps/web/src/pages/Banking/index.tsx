/**
 * Banking Module - Main Page
 *
 * Overview of connected bank accounts, transactions, and alerts.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Flag,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { api } from '@/services/api';

interface BankConnection {
  id: string;
  institutionName: string;
  status: string;
  accounts: BankAccount[];
  lastSyncAt: string | null;
}

interface BankAccount {
  id: string;
  iban: string;
  name: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  description: string;
  counterpartyName: string | null;
  bookingDate: string;
  anomalyScore: number;
  flags: { type: string; severity: string; message: string }[];
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Summary {
  connectedAccounts: number;
  totalBalance: number;
  totalTransactions: number;
  totalInflows: number;
  totalOutflows: number;
  openAlerts: number;
  flaggedTransactions: number;
}

export default function BankingPage() {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [connectionsRes, transactionsRes, alertsRes, summaryRes] = await Promise.all([
        api.get('/banking/connections'),
        api.get('/banking/transactions?limit=10&flagged=true'),
        api.get('/banking/alerts?status=open&limit=5'),
        api.get('/banking/analytics/summary'),
      ]);

      setConnections(connectionsRes.data.connections || []);
      setTransactions(transactionsRes.data.transactions || []);
      setAlerts(alertsRes.data.alerts || []);
      setSummary(summaryRes.data.summary || null);
    } catch (error) {
      console.error('Error fetching banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(true);
    try {
      await api.post(`/banking/connections/${connectionId}/sync`);
      await fetchData();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">Cargando datos bancarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Control Bancario</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitoreo de transacciones y deteccion de anomalias
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/banking/connect"
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Conectar Banco
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Wallet className="w-5 h-5" />}
            label="Saldo Total"
            value={`€${summary.totalBalance.toLocaleString('es-ES')}`}
            color="green"
          />
          <StatCard
            icon={<ArrowUpRight className="w-5 h-5" />}
            label="Entradas (30d)"
            value={`€${summary.totalInflows.toLocaleString('es-ES')}`}
            color="blue"
          />
          <StatCard
            icon={<ArrowDownLeft className="w-5 h-5" />}
            label="Salidas (30d)"
            value={`€${summary.totalOutflows.toLocaleString('es-ES')}`}
            color="purple"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Alertas Activas"
            value={summary.openAlerts.toString()}
            color="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Accounts */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Cuentas Conectadas
              </h2>
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {connections.length} cuentas
              </span>
            </div>

            {connections.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  No hay cuentas conectadas
                </p>
                <Link
                  to="/banking/connect"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  Conectar primera cuenta
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {conn.institutionName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {conn.accounts.length} cuenta(s)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSync(conn.id)}
                        disabled={syncing}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <RefreshCw
                          className={`w-4 h-4 text-slate-500 ${syncing ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                    {conn.accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500 font-mono">{acc.iban}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            €{acc.balance.toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {conn.lastSyncAt && (
                      <p className="text-xs text-slate-400 mt-2">
                        Ultima sync: {new Date(conn.lastSyncAt).toLocaleString('es-ES')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flagged Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Transacciones Sospechosas
              </h2>
              <Link
                to="/banking/transactions"
                className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
              >
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Flag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No hay transacciones sospechosas
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Alertas Recientes</h2>
          <Link
            to="/banking/alerts"
            className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No hay alertas activas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'green' | 'blue' | 'purple' | 'red';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isDebit = transaction.direction === 'debit';
  const severityColor = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    critical: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  const highestSeverity = transaction.flags.reduce(
    (max, flag) => {
      const order = ['low', 'medium', 'high', 'critical'];
      return order.indexOf(flag.severity) > order.indexOf(max) ? flag.severity : max;
    },
    'low'
  );

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDebit
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          }`}
        >
          {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white text-sm">
            {transaction.description}
          </p>
          <p className="text-xs text-slate-500">
            {transaction.counterpartyName || 'Desconocido'} ·{' '}
            {new Date(transaction.bookingDate).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {transaction.flags.length > 0 && (
          <span
            className={`text-xs px-2 py-1 rounded-lg font-medium ${severityColor[highestSeverity as keyof typeof severityColor]}`}
          >
            {transaction.flags.length} alerta(s)
          </span>
        )}
        <p
          className={`font-semibold ${
            isDebit ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}
        >
          {isDebit ? '-' : '+'}€{transaction.amount.toLocaleString('es-ES')}
        </p>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const severityConfig = {
    low: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-500',
    },
    high: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500',
    },
    critical: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-300 dark:border-red-700',
      icon: 'text-red-600',
    },
  };

  const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.medium;

  return (
    <Link
      to={`/banking/alerts/${alert.id}`}
      className={`block p-4 rounded-xl border ${config.bg} ${config.border} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 ${config.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
            {alert.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {alert.description}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(alert.createdAt).toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </Link>
  );
}
