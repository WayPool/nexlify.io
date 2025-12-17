import { AlertTriangle, CreditCard, RefreshCw } from 'lucide-react';
import { billingApi } from '@/services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface SubscriptionRequiredProps {
  status: 'suspended' | 'past_due' | 'unpaid' | 'cancelled';
  onRetry?: () => void;
}

export default function SubscriptionRequired({ status, onRetry }: SubscriptionRequiredProps) {
  const [isLoading, setIsLoading] = useState(false);

  const statusMessages = {
    suspended: {
      title: 'Cuenta suspendida',
      description: 'Tu cuenta ha sido suspendida debido a un problema con el pago. Por favor, actualiza tu método de pago para continuar.',
      action: 'Actualizar método de pago',
    },
    past_due: {
      title: 'Pago pendiente',
      description: 'Tienes un pago pendiente. Por favor, actualiza tu método de pago para evitar la suspensión de tu cuenta.',
      action: 'Realizar pago',
    },
    unpaid: {
      title: 'Factura sin pagar',
      description: 'Tienes facturas pendientes de pago. Por favor, actualiza tu método de pago para continuar usando la plataforma.',
      action: 'Pagar ahora',
    },
    cancelled: {
      title: 'Suscripción cancelada',
      description: 'Tu suscripción ha sido cancelada. Reactívala para continuar accediendo a todas las funcionalidades.',
      action: 'Reactivar suscripción',
    },
  };

  const message = statusMessages[status] || statusMessages.suspended;

  const handleOpenPortal = async () => {
    setIsLoading(true);
    try {
      const response = await billingApi.createPortalSession();
      if (response.data.portal_url) {
        window.location.href = response.data.portal_url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Error al abrir el portal de facturación. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      await billingApi.reactivateSubscription();
      toast.success('Suscripción reactivada correctamente');
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Reactivate error:', error);
      toast.error('Error al reactivar la suscripción. Por favor, contacta con soporte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {message.title}
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {message.description}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'cancelled' ? (
              <button
                onClick={handleReactivate}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {message.action}
              </button>
            ) : (
              <button
                onClick={handleOpenPortal}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {message.action}
              </button>
            )}

            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Verificar estado
              </button>
            )}
          </div>

          {/* Support link */}
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@nexlify.io"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
