/**
 * About Page (Public)
 *
 * Professional presentation of Nexlify's mission, team, and investment opportunity.
 * Designed for institutional investors and strategic partners.
 * This is a standalone public page with its own layout.
 */

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Globe,
  Users,
  TrendingUp,
  Award,
  Lock,
  Cpu,
  Building2,
  Target,
  Briefcase,
  Landmark,
  ChevronRight,
  ExternalLink,
  Moon,
  Sun,
  Monitor,
  X,
  Check,
  Loader2,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useThemeStore } from '@/stores/theme';
import { api } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Lead investor (VC fund) statistics - NOT Nexlify stats
const vcFundStats = [
  { value: '429,393+', label: 'Miembros en su Red', icon: Users },
  { value: '263K+', label: 'Inversiones Realizadas', icon: TrendingUp },
  { value: '256M+', label: 'Capital Desplegado', suffix: '\u20AC', icon: Landmark },
  { value: '327+', label: 'Rondas Exitosas', icon: Award },
];

// Founding team
const founders = [
  {
    id: 1,
    role: 'Defensa y Estrategia',
    expertise: 'Sector Militar',
    description: 'Experiencia con contratistas de defensa internacionales. Especializado en operaciones estrategicas y seguridad nacional.',
    origin: 'Israel',
    flag: '\uD83C\uDDEE\uD83C\uDDF1',
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
  },
  {
    id: 2,
    role: 'Tecnologia e Innovacion',
    expertise: 'Software & AI',
    description: '30+ anos en desarrollo de software, 10 anos en blockchain, 5 anos en inteligencia artificial. Arquitecto de sistemas enterprise.',
    origin: 'Italia',
    flag: '\uD83C\uDDEE\uD83C\uDDF9',
    icon: Cpu,
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 3,
    role: 'Finanzas y Operaciones',
    expertise: 'DeFi & Business',
    description: '10+ anos en finanzas tradicionales y descentralizadas. Especialista en administracion empresarial y estructuracion de capital.',
    origin: 'Espana',
    flag: '\uD83C\uDDEA\uD83C\uDDF8',
    icon: Briefcase,
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    id: 4,
    role: 'Ciberseguridad',
    expertise: 'Security Systems',
    description: '5+ anos en ciberseguridad ofensiva y defensiva. Desarrollo de sistemas de proteccion de infraestructura critica.',
    origin: 'EAU',
    flag: '\uD83C\uDDE6\uD83C\uDDEA',
    icon: Lock,
    color: 'from-purple-600 to-purple-800',
  },
  {
    id: 5,
    role: 'Capital e Inversiones',
    expertise: 'Venture Capital',
    description: 'Fondo de capital riesgo Top 1 en Europa. Track record excepcional en inversiones tecnologicas y fintech.',
    origin: 'Reino Unido',
    flag: '\uD83C\uDDEC\uD83C\uDDE7',
    icon: Landmark,
    color: 'from-amber-600 to-amber-800',
  },
];

// Investment highlights
const investmentHighlights = [
  {
    title: 'Ronda Inicial',
    value: '2.5M',
    suffix: '\u20AC',
    description: 'Seed round para desarrollo de producto y expansion inicial',
  },
  {
    title: 'Capitalizacion Objetivo',
    value: '12.5M',
    suffix: '\u20AC',
    description: 'Valoracion total proyectada al cierre del proyecto',
  },
  {
    title: 'ROI Proyectado',
    value: '5x',
    description: 'Retorno esperado para inversores de la ronda seed',
  },
];

// Core values
const coreValues = [
  {
    icon: Shield,
    title: 'Seguridad Soberana',
    description: 'Tecnologia desarrollada en Europa, para Europa. Sin dependencias de terceros paises.',
  },
  {
    icon: Lock,
    title: 'Privacidad por Diseno',
    description: 'Arquitectura zero-trust con encriptacion end-to-end en todas las comunicaciones.',
  },
  {
    icon: Globe,
    title: 'Alcance Global',
    description: 'Infraestructura distribuida con cumplimiento normativo en multiples jurisdicciones.',
  },
  {
    icon: Target,
    title: 'Precision Militar',
    description: 'Estandares de calidad y seguridad derivados del sector defensa.',
  },
];

// Investor types for the modal (matching backend schema)
const investorTypes = [
  { value: 'institutional', label: 'Inversor Institucional' },
  { value: 'professional', label: 'Inversor Profesional' },
  { value: 'experienced', label: 'Inversor Experimentado' },
  { value: 'high_net_worth', label: 'Alto Patrimonio' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'other', label: 'Otro' },
];

// Investment ranges (matching backend schema)
const investmentRanges = [
  { value: '100k-250k', label: '€100,000 - €250,000' },
  { value: '250k-500k', label: '€250,000 - €500,000' },
  { value: '500k-1m', label: '€500,000 - €1,000,000' },
  { value: '1m+', label: '€1,000,000+' },
];

// Countries list (ISO 2 codes for backend)
const countries = [
  { code: 'ES', name: 'Espana' },
  { code: 'DE', name: 'Alemania' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Paises Bajos' },
  { code: 'BE', name: 'Belgica' },
  { code: 'CH', name: 'Suiza' },
  { code: 'AT', name: 'Austria' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'AE', name: 'Emiratos Arabes Unidos' },
  { code: 'IL', name: 'Israel' },
  { code: 'SG', name: 'Singapur' },
];

// Investor Modal Component
interface InvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function InvestorModal({ isOpen, onClose }: InvestorModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    investorType: '',
    investmentRange: '',
    message: '',
  });
  const [confirmations, setConfirmations] = useState({
    isQualified: false,
    understandsRisks: false,
    understandsStructure: false,
    acceptsPrivacy: false,
    acceptsContact: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Anti-spam: simple math validation
  const [spamCheck, setSpamCheck] = useState({ a: 0, b: 0, answer: '' });

  useEffect(() => {
    if (isOpen) {
      setSpamCheck({
        a: Math.floor(Math.random() * 10) + 1,
        b: Math.floor(Math.random() * 10) + 1,
        answer: '',
      });
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmationChange = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const requiredConfirmed = confirmations.isQualified && confirmations.understandsRisks &&
                            confirmations.understandsStructure && confirmations.acceptsPrivacy;
  const spamValid = parseInt(spamCheck.answer) === spamCheck.a + spamCheck.b;
  const formValid = formData.firstName && formData.lastName && formData.email && formData.phone &&
                    formData.country && formData.investorType &&
                    requiredConfirmed && spamValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.post('/investor-inquiries', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || undefined,
        country: formData.country,
        investorType: formData.investorType,
        investmentRange: formData.investmentRange || undefined,
        message: formData.message || undefined,
        isQualified: confirmations.isQualified,
        understandsRisks: confirmations.understandsRisks,
        understandsStructure: confirmations.understandsStructure,
        acceptsPrivacy: confirmations.acceptsPrivacy,
        acceptsContact: confirmations.acceptsContact,
      });
      setSubmitStatus('success');
    } catch (error: unknown) {
      setSubmitStatus('error');
      const err = error as { response?: { data?: { message?: string } } };
      setErrorMessage(err?.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      country: '',
      investorType: '',
      investmentRange: '',
      message: '',
    });
    setConfirmations({
      isQualified: false,
      understandsRisks: false,
      understandsStructure: false,
      acceptsPrivacy: false,
      acceptsContact: false,
    });
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Solicita Acceso al Data Room
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Completa el formulario para acceder a la documentacion de inversion
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {submitStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Solicitud Enviada
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Hemos recibido tu solicitud. Nuestro equipo revisara tu perfil y te contactara en las proximas 24-48 horas.
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cerrar
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email corporativo *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                      placeholder="tu@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Empresa/Fondo
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pais *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    >
                      <option value="">Selecciona un pais</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tipo de inversor *
                    </label>
                    <select
                      name="investorType"
                      value={formData.investorType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    >
                      <option value="">Selecciona tipo</option>
                      {investorTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rango de inversion
                    </label>
                    <select
                      name="investmentRange"
                      value={formData.investmentRange}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    >
                      <option value="">Selecciona rango (opcional)</option>
                      {investmentRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white resize-none"
                    placeholder="Cuentanos sobre tu interes en Nexlify..."
                  />
                </div>

                {/* Confirmations */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Declaraciones requeridas:
                  </p>
                  {[
                    { key: 'isQualified', text: 'Confirmo que soy un inversor acreditado o cualificado segun la normativa aplicable en mi jurisdiccion', required: true },
                    { key: 'understandsRisks', text: 'Entiendo que las inversiones en startups conllevan riesgos significativos, incluyendo la posible perdida total del capital', required: true },
                    { key: 'understandsStructure', text: 'Comprendo la estructura de la inversion y he tenido la oportunidad de revisar la documentacion disponible', required: true },
                    { key: 'acceptsPrivacy', text: 'He leido y acepto la politica de privacidad de Nexlify', required: true },
                    { key: 'acceptsContact', text: 'Autorizo a Nexlify a contactarme con informacion sobre oportunidades de inversion (opcional)', required: false },
                  ].map(item => (
                    <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={confirmations[item.key as keyof typeof confirmations]}
                          onChange={() => handleConfirmationChange(item.key as keyof typeof confirmations)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                          confirmations[item.key as keyof typeof confirmations]
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-400'
                        }`}>
                          {confirmations[item.key as keyof typeof confirmations] && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <span className={`text-sm ${item.required ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Anti-spam */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <label className="block text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    Verificacion de seguridad: ¿Cuanto es {spamCheck.a} + {spamCheck.b}?
                  </label>
                  <input
                    type="number"
                    value={spamCheck.answer}
                    onChange={(e) => setSpamCheck(prev => ({ ...prev, answer: e.target.value }))}
                    className="w-24 px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    placeholder="?"
                  />
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!formValid || isSubmitting}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white disabled:text-slate-500 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Solicitar Acceso
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Tu informacion sera tratada de forma confidencial y solo sera utilizada para evaluar tu solicitud de acceso.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatCard({ stat, index }: { stat: typeof vcFundStats[0]; index: number }) {
  const Icon = stat.icon;

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 text-center hover:border-primary-500/30 transition-colors">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500/10 rounded-xl mb-4">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
          {stat.suffix && <span className="text-2xl">{stat.suffix}</span>}
          {stat.value}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
      </div>
    </motion.div>
  );
}

function FounderCard({ founder, index }: { founder: typeof founders[0]; index: number }) {
  const Icon = founder.icon;

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${founder.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${founder.color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="text-lg">{founder.flag}</span>
            <span>{founder.origin}</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {founder.role}
          </h3>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {founder.expertise}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {founder.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ValueCard({ value, index }: { value: typeof coreValues[0]; index: number }) {
  const Icon = value.icon;

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{value.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{value.description}</p>
      </div>
    </motion.div>
  );
}

export default function About() {
  const { theme, setTheme } = useThemeStore();
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (theme === 'system' && systemDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Close theme menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Oscuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Investor Modal */}
      <InvestorModal isOpen={showInvestorModal} onClose={() => setShowInvestorModal(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="https://nexlify.io" className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-2">
                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Nexlify
              </span>
            </a>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Theme Toggle */}
              <div ref={themeMenuRef} className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Cambiar tema"
                >
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  ) : theme === 'light' ? (
                    <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Monitor className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {showThemeMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                    >
                      {themeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                            theme === option.value
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Login - icon only on mobile */}
              <Link
                to="/login"
                className="p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Iniciar Sesion"
              >
                <LogIn className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:inline">Iniciar Sesion</span>
              </Link>

              {/* Register - icon only on mobile */}
              <Link
                to="/register"
                className="p-2 sm:px-4 sm:py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                aria-label="Registrarse"
              >
                <UserPlus className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:inline">Registrarse</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-20">
          {/* Hero Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl" />

            <div className="relative pt-8 pb-12">
              <motion.div variants={itemVariants} className="max-w-4xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                  <Building2 className="w-4 h-4" />
                  Plataforma de Inversion Europea
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  El Palantir
                  <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"> Europeo</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-3xl">
                  Nexlify nace de la vision de crear una plataforma de ciberseguridad, blockchain e inteligencia artificial de nivel gubernamental, militar y estrategico.
                  <span className="text-slate-900 dark:text-white font-semibold"> Construida en Europa, para el mundo.</span>
                </p>

                <div className="flex flex-wrap gap-3">
                  {[
                    { flag: '\uD83C\uDDEE\uD83C\uDDF1', country: 'Israel' },
                    { flag: '\uD83C\uDDEA\uD83C\uDDF8', country: 'Espana' },
                    { flag: '\uD83C\uDDEE\uD83C\uDDF9', country: 'Italia' },
                    { flag: '\uD83C\uDDEC\uD83C\uDDE7', country: 'Reino Unido' },
                    { flag: '\uD83C\uDDE6\uD83C\uDDEA', country: 'EAU' },
                  ].map((loc) => (
                    <span
                      key={loc.country}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400"
                    >
                      <span className="text-base">{loc.flag}</span>
                      {loc.country}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Lead Investor VC Fund Statistics */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold mb-4">
                <Landmark className="w-5 h-5" />
                Nuestro Socio Inversor Principal
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Fondo de Capital Riesgo Top 1 en Europa
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Contamos con el respaldo de uno de los fondos de inversion mas importantes de Europa, con sede en Reino Unido y presencia global. El fondo participa con el 25% del capital de Nexlify.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {vcFundStats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
            </div>

            <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              * Estadisticas del fondo inversor, no de Nexlify
            </motion.p>
          </motion.section>

          {/* Mission Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold mb-4">
                  <Target className="w-5 h-5" />
                  Nuestra Mision
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Soberania Tecnologica para Europa
                </h2>
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <p>
                    En un mundo donde la dependencia tecnologica se ha convertido en una vulnerabilidad estrategica, Nexlify emerge como la respuesta europea a la necesidad de infraestructura de seguridad y datos soberana.
                  </p>
                  <p>
                    Combinamos lo mejor del conocimiento militar israeli, la ingenieria de software italiana, la tradicion financiera espanola, la excelencia en ciberseguridad de Emiratos Arabes y el capital estrategico britanico.
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    No somos una startup mas. Somos la infraestructura critica del futuro europeo.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                {coreValues.map((value, index) => (
                  <ValueCard key={value.title} value={value} index={index} />
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Founding Team */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold mb-4">
                <Users className="w-5 h-5" />
                Equipo Fundador
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                Liderazgo de Clase Mundial
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Un equipo multidisciplinar con decadas de experiencia combinada en defensa, tecnologia, finanzas y ciberseguridad.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {founders.map((founder, index) => (
                <FounderCard key={founder.id} founder={founder} index={index} />
              ))}
            </div>
          </motion.section>

          {/* Investment Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl" />

            <div className="relative px-6 md:px-12 py-12 md:py-16">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 text-primary-400 font-semibold mb-4">
                  <Landmark className="w-5 h-5" />
                  Oportunidad de Inversion
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Unete a la Ronda Seed
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Una oportunidad unica de participar en la construccion de la infraestructura tecnologica europea del futuro.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {investmentHighlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
                  >
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      {item.value}
                      {item.suffix && <span className="text-2xl text-primary-400">{item.suffix}</span>}
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">{item.title}</div>
                    <div className="text-sm text-slate-400">{item.description}</div>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={itemVariants} className="text-center">
                <button
                  onClick={() => setShowInvestorModal(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
                >
                  Solicitar Informacion
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-slate-500 text-sm mt-4">
                  Acceso exclusivo para inversores cualificados
                </p>
              </motion.div>
            </div>
          </motion.section>

          {/* Compliance & Trust */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Cumplimiento y Confianza
              </h3>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-slate-500 dark:text-slate-400">
                {[
                  'GDPR Compliant',
                  'ISO 27001',
                  'SOC 2 Type II',
                  'PCI DSS',
                  'DORA Ready',
                ].map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium"
                  >
                    <Shield className="w-4 h-4 text-primary-500" />
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          {/* Contact CTA */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Construyamos el Futuro Juntos
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                Ya seas inversor, partner estrategico o talento excepcional buscando un proyecto ambicioso, queremos conocerte.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:contact@nexlify.io"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Contactar
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://nexlify.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
                >
                  Visitar Web
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-1.5">
                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Nexlify. Todos los derechos reservados.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="https://nexlify.io/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Privacidad
              </a>
              <a href="https://nexlify.io/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Terminos
              </a>
              <a href="mailto:contact@nexlify.io" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
