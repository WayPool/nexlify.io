import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Shield, Users, BarChart3 } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [showContent, setShowContent] = useState(false);

  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');

  useEffect(() => {
    // Show content after a brief delay
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const getPlanName = () => {
    const names: Record<string, string> = {
      essential: 'Essential',
      professional: 'Professional',
      enterprise: 'Enterprise',
    };
    return names[plan || ''] || 'seleccionado';
  };

  const nextSteps = [
    {
      icon: Users,
      title: 'Invita a tu equipo',
      description: 'Añade usuarios y asigna roles para colaborar',
      link: '/users',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Configura módulos',
      description: 'Activa los módulos de compliance que necesitas',
      link: '/modules',
      color: 'purple',
    },
    {
      icon: BarChart3,
      title: 'Explora el dashboard',
      description: 'Visualiza métricas y detecta riesgos',
      link: '/dashboard',
      color: 'teal',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        {/* Success Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 p-8 text-center relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative z-10"
            >
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Pago completado!
              </h1>
              <p className="text-white/90 text-lg">
                Bienvenido al plan {getPlanName()}
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Confirmation message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Tu suscripción está activa
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Hemos enviado un email de confirmación con los detalles de tu suscripción.
                {billing === 'yearly' && (
                  <span className="block mt-2 text-green-600 dark:text-green-400 font-medium">
                    ¡Gracias por elegir el plan anual! Ahorras 2 meses.
                  </span>
                )}
              </p>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Próximos pasos
              </h2>
              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Link
                      to={step.link}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          step.color === 'blue'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : step.color === 'purple'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                        }`}
                      >
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {step.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-8"
            >
              <Link
                to="/dashboard"
                className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Ir al Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Support info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6"
            >
              ¿Necesitas ayuda?{' '}
              <a href="mailto:soporte@nexlify.io" className="text-primary-500 hover:underline">
                Contacta con soporte
              </a>
            </motion.p>
          </div>
        </div>

        {/* Session ID (for debugging/reference) */}
        {sessionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center text-xs text-slate-400 mt-4"
          >
            ID de sesión: {sessionId.slice(0, 20)}...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
