import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Download,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  TrendingUp,
  Users,
  Box,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { billingApi } from '@/services/api';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly_eur: number;
  price_yearly_eur: number;
  features: string[];
}

interface Subscription {
  tenant_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

interface Invoice {
  id: string;
  number: string;
  amount_eur: number;
  status: string;
  period_start: string;
  period_end: string;
  paid_at: string | null;
  pdf_url: string | null;
  hosted_url: string | null;
}

interface UsageItem {
  used: number;
  limit: number;
  percentage: number;
  unlimited?: boolean;
}

interface Usage {
  plan: { id: string; name: string };
  users: UsageItem;
  modules: UsageItem;
  risks: UsageItem;
  companies?: UsageItem;
  features?: {
    apiAccess: boolean;
    aiAssistant: string;
    support: string;
  };
  canAddUser?: boolean;
  canAddModule?: boolean;
}

// Map plan IDs from landing to API plan IDs
const PLAN_ID_MAP: Record<string, string> = {
  starter: 'essential',
  essential: 'essential',
  business: 'professional',
  professional: 'professional',
  enterprise: 'enterprise',
};

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const upgradeProcessedRef = useRef(false);

  // Check for upgrade parameters from landing page
  const upgradePlanParam = searchParams.get('upgrade');
  const billingParam = searchParams.get('billing');

  useEffect(() => {
    loadBillingData();
  }, []);

  // Handle upgrade from landing page
  useEffect(() => {
    if (upgradePlanParam && !isLoading && plans.length > 0 && !upgradeProcessedRef.current) {
      upgradeProcessedRef.current = true;

      // Map the plan ID from landing to API plan ID
      const mappedPlanId = PLAN_ID_MAP[upgradePlanParam.toLowerCase()] || upgradePlanParam;

      // Set billing cycle from URL if provided
      if (billingParam === 'yearly' || billingParam === 'monthly') {
        setBillingCycle(billingParam);
      }

      // Find the plan
      const planToUpgrade = plans.find(p => p.id === mappedPlanId);

      if (planToUpgrade) {
        // Clear the URL parameters
        setSearchParams({});

        // Show toast and trigger upgrade
        toast.loading('Redirigiendo al checkout...', { id: 'upgrade-redirect' });

        // Small delay to ensure state is updated
        setTimeout(() => {
          handleUpgrade(mappedPlanId, billingParam === 'yearly' ? 'yearly' : billingParam === 'monthly' ? 'monthly' : billingCycle);
        }, 500);
      } else {
        toast.error(`Plan "${upgradePlanParam}" no encontrado`);
        setSearchParams({});
      }
    }
  }, [upgradePlanParam, billingParam, isLoading, plans]);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      // Load plans first (public endpoint)
      const plansRes = await billingApi.getPlans();
      setPlans(plansRes.data.data || []);

      // Load authenticated data separately
      try {
        const [subRes, invoicesRes, usageRes] = await Promise.all([
          billingApi.getSubscription(),
          billingApi.getInvoices(10),
          billingApi.getUsage(),
        ]);

        setSubscription(subRes.data);
        setInvoices(invoicesRes.data.data || []);
        setUsage(usageRes.data);

        if (subRes.data?.billing_cycle) {
          setBillingCycle(subRes.data.billing_cycle as 'monthly' | 'yearly');
        }
      } catch (authError) {
        console.error('Error loading authenticated data:', authError);
        // Don't show error toast - user might not be subscribed yet
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar planes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string, overrideBillingCycle?: 'monthly' | 'yearly') => {
    setIsUpgrading(true);
    toast.dismiss('upgrade-redirect');
    try {
      const response = await billingApi.createSubscription({
        plan_id: planId,
        billing_cycle: overrideBillingCycle || billingCycle,
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        toast.success('Plan actualizado correctamente');
        loadBillingData();
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Error al actualizar el plan');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const response = await billingApi.createPortalSession();
      if (response.data.portal_url) {
        window.open(response.data.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Error al abrir el portal de facturación');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción? Seguirás teniendo acceso hasta el final del período de facturación.')) {
      return;
    }

    try {
      await billingApi.cancelSubscription();
      toast.success('Suscripción cancelada. Tendrás acceso hasta el final del período.');
      loadBillingData();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Error al cancelar la suscripción');
    }
  };

  const handleReactivate = async () => {
    try {
      await billingApi.reactivateSubscription();
      toast.success('Suscripción reactivada');
      loadBillingData();
    } catch (error) {
      console.error('Reactivate error:', error);
      toast.error('Error al reactivar la suscripción');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      active: { color: 'green', label: 'Activa' },
      canceled: { color: 'red', label: 'Cancelada' },
      past_due: { color: 'yellow', label: 'Pago pendiente' },
      trialing: { color: 'blue', label: 'Prueba' },
      no_subscription: { color: 'gray', label: 'Sin suscripción' },
    };

    const config = statusConfig[status] || { color: 'gray', label: status };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          config.color === 'green'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : config.color === 'red'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : config.color === 'yellow'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : config.color === 'blue'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            config.color === 'green'
              ? 'bg-green-500'
              : config.color === 'red'
              ? 'bg-red-500'
              : config.color === 'yellow'
              ? 'bg-yellow-500'
              : config.color === 'blue'
              ? 'bg-blue-500'
              : 'bg-slate-500'
          }`}
        />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">Cargando facturación...</p>
        </div>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.id === subscription?.plan_id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Facturación</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gestiona tu suscripción, planes y facturas
        </p>
      </div>

      {/* Current Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Plan {currentPlan?.name || 'Gratuito'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {subscription?.billing_cycle === 'yearly' ? 'Facturación anual' : 'Facturación mensual'}
                </p>
              </div>
            </div>
            {getStatusBadge(subscription?.status || 'no_subscription')}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Próximo pago</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {subscription?.current_period_end
                ? formatDate(subscription.current_period_end)
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Precio</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {currentPlan
                ? `${(subscription?.billing_cycle === 'yearly'
                    ? currentPlan.price_yearly_eur / 12
                    : currentPlan.price_monthly_eur
                  ).toLocaleString('es-ES')}€/mes`
                : 'Gratis'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenPortal}
              disabled={isOpeningPortal || !subscription?.stripe_customer_id}
              className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isOpeningPortal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Portal de pago
            </button>
            {subscription?.cancel_at_period_end ? (
              <button
                onClick={handleReactivate}
                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
              >
                Reactivar
              </button>
            ) : subscription?.stripe_subscription_id ? (
              <button
                onClick={handleCancelSubscription}
                className="flex-1 py-2 px-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>

        {subscription?.cancel_at_period_end && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Tu suscripción se cancelará el {formatDate(subscription.current_period_end)}.
                Puedes reactivarla en cualquier momento antes de esa fecha.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Usage */}
      {usage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Uso actual</h2>
            {usage.plan && (
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium rounded-full">
                Plan {usage.plan.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuarios</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {usage.users.used} / {usage.users.unlimited ? '∞' : usage.users.limit}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usage.users.unlimited ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-blue-500'
                  }`}
                  style={{ width: usage.users.unlimited ? '100%' : `${usage.users.percentage}%` }}
                />
              </div>
              {!usage.canAddUser && !usage.users.unlimited && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Límite alcanzado</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Módulos activos</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {usage.modules.used} / {usage.modules.unlimited ? '∞' : usage.modules.limit}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usage.modules.unlimited ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-purple-500'
                  }`}
                  style={{ width: usage.modules.unlimited ? '100%' : `${usage.modules.percentage}%` }}
                />
              </div>
              {!usage.canAddModule && !usage.modules.unlimited && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Límite alcanzado - Actualiza tu plan</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Detectores de riesgo</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {usage.risks.used} / {usage.risks.unlimited ? '∞' : usage.risks.limit}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usage.risks.unlimited ? 'bg-gradient-to-r from-teal-400 to-teal-600' : 'bg-teal-500'
                  }`}
                  style={{ width: usage.risks.unlimited ? '100%' : `${Math.min(usage.risks.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Features section */}
          {usage.features && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Características del plan</h3>
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-sm ${
                  usage.features.apiAccess
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  API {usage.features.apiAccess ? 'Habilitada' : 'No disponible'}
                </span>
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                  IA: {usage.features.aiAssistant === 'full' ? 'Completa' : usage.features.aiAssistant === 'advanced' ? 'Avanzada' : 'Básica'}
                </span>
                <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm">
                  Soporte: {usage.features.support === 'dedicated' ? 'Dedicado' : usage.features.support === 'priority' ? 'Prioritario' : 'Email'}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Planes disponibles</h2>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Anual
              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id;
            const price = billingCycle === 'yearly' ? plan.price_yearly_eur / 12 : plan.price_monthly_eur;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 transition-all flex flex-col ${
                  isCurrentPlan
                    ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {isCurrentPlan && (
                  <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">
                    Plan actual
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {price.toLocaleString('es-ES')}€
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">/mes</span>
                </div>

                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || isUpgrading}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30'
                  }`}
                >
                  {isUpgrading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCurrentPlan ? (
                    'Plan actual'
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      {subscription?.plan_id ? 'Cambiar plan' : 'Seleccionar'}
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Facturas</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{invoice.number || 'Factura'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {invoice.amount_eur.toLocaleString('es-ES')}€
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                  </span>
                  {invoice.pdf_url && (
                    <a
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
