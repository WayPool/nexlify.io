import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, ArrowRight, Check, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, billingApi } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  password: string;
  confirmPassword: string;
}

interface Plan {
  id: string;
  name: string;
  price_monthly_eur: number;
  price_yearly_eur: number;
}

const PLAN_NAMES: Record<string, string> = {
  essential: 'Essential',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Get plan info from URL params
  const planId = searchParams.get('plan');
  const billingCycle = searchParams.get('billing') || 'monthly';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  // Fetch plan details if plan is specified
  useEffect(() => {
    if (planId) {
      billingApi.getPlans().then((response) => {
        const plan = response.data.data.find((p: Plan) => p.id === planId);
        if (plan) {
          setSelectedPlan(plan);
        }
      }).catch(console.error);
    }
  }, [planId]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Register the user
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
      });

      // Step 2: Log the user in
      login(response.data.user, response.data.token);
      toast.success('¡Cuenta creada exitosamente!');

      // Step 3: If there's a plan selected, redirect to Stripe checkout
      if (planId && selectedPlan) {
        setIsRedirectingToCheckout(true);
        try {
          // Use authenticated endpoint - token is already set via login()
          const checkoutResponse = await billingApi.createSubscription({
            plan_id: planId,
            billing_cycle: billingCycle,
          });

          if (checkoutResponse.data.checkout_url) {
            toast.success('Redirigiendo al pago...', { duration: 2000 });
            // Small delay to show the message
            setTimeout(() => {
              window.location.href = checkoutResponse.data.checkout_url;
            }, 1000);
            return;
          }
        } catch (checkoutError) {
          console.error('Checkout error:', checkoutError);
          toast.error('Error al iniciar el pago. Puedes completarlo desde Facturación.');
          navigate('/billing');
        }
      } else {
        // No plan selected, go directly to dashboard
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Detección automática de riesgos',
    'Trazabilidad blockchain inmutable',
    'Análisis en tiempo real',
    'Cumplimiento normativo',
    'Módulos extensibles',
    'Soporte multi-idioma',
  ];

  const getPlanPrice = () => {
    if (!selectedPlan) return null;
    return billingCycle === 'yearly'
      ? selectedPlan.price_yearly_eur / 12
      : selectedPlan.price_monthly_eur;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Comienza a gestionar tus riesgos hoy
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Únete a empresas que confían en nuestra plataforma para detectar y mitigar riesgos de cumplimiento.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Selected Plan Info */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Plan {selectedPlan.name}</div>
                    <div className="text-sm text-white/70">
                      {billingCycle === 'yearly' ? 'Facturación anual' : 'Facturación mensual'}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{getPlanPrice()?.toLocaleString('es-ES')}€</span>
                  <span className="text-white/70">/mes</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                    Ahorras 2 meses al año
                  </div>
                )}
              </motion.div>
            )}

            {!selectedPlan && (
              <div className="mt-12 p-6 bg-white/10 backdrop-blur-xl rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">María García</div>
                    <div className="text-sm text-white/70">CFO, TechCorp España</div>
                  </div>
                </div>
                <p className="text-white/90 italic">
                  "Nexlify nos ha permitido reducir el tiempo de detección de riesgos en un 70%. La trazabilidad blockchain nos da la confianza que necesitamos."
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-2">
                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Nexlify
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">
                  Donde el riesgo se convierte en decisión
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Crear Cuenta
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {selectedPlan
              ? `Regístrate para comenzar con el plan ${PLAN_NAMES[planId || ''] || selectedPlan.name}`
              : 'Comienza tu prueba gratuita de 14 días'
            }
          </p>

          {/* Plan Badge */}
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      Plan {PLAN_NAMES[planId || ''] || selectedPlan.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {getPlanPrice()?.toLocaleString('es-ES')}€/mes
                      {billingCycle === 'yearly' && ' (facturación anual)'}
                    </div>
                  </div>
                </div>
                <Link
                  to="/#precios"
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                >
                  Cambiar
                </Link>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    {...register('firstName', { required: 'Requerido' })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="Juan"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Requerido' })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="Pérez"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="juan@empresa.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre de la empresa
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  {...register('companyName', { required: 'El nombre de empresa es requerido' })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="Mi Empresa S.L."
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Debe incluir mayúscula, minúscula y número',
                    },
                  })}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: (value) => value === password || 'Las contraseñas no coinciden',
                  })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Acepto los{' '}
                <Link to="/terms" className="text-primary-500 hover:underline">
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link to="/privacy" className="text-primary-500 hover:underline">
                  Política de Privacidad
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || isRedirectingToCheckout}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading || isRedirectingToCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRedirectingToCheckout ? 'Redirigiendo al pago...' : 'Creando cuenta...'}
                </>
              ) : (
                <>
                  {selectedPlan ? 'Crear Cuenta y Pagar' : 'Crear Cuenta'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Security badges */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>GDPR</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>ISO 27001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
