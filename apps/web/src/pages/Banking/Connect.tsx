/**
 * Banking Connect Page
 *
 * Allows users to connect their bank accounts via Nordigen.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Search,
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { api } from '@/services/api';

interface Institution {
  id: string;
  name: string;
  bic: string;
  logo: string;
  countries: string[];
  transactionTotalDays: number;
}

export default function BankingConnectPage() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'redirect'>('select');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/banking/institutions?country=ES');
      setInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    setStep('confirm');
  };

  const handleConnect = async () => {
    if (!selectedInstitution) return;

    setStep('redirect');

    try {
      const response = await api.post('/banking/connections', {
        institutionId: selectedInstitution.id,
        redirectUrl: `${window.location.origin}/banking/callback`,
      });

      // In production, redirect to bank authorization URL
      // For demo, simulate successful connection
      setTimeout(async () => {
        // Simulate callback
        await api.post(`/banking/connections/${response.data.connection.id}/callback`);
        navigate('/banking');
      }, 2000);
    } catch (error) {
      console.error('Error connecting:', error);
      setStep('select');
    }
  };

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">Cargando bancos disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => (step === 'select' ? navigate('/banking') : setStep('select'))}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver</span>
      </button>

      {/* Step: Select Institution */}
      {step === 'select' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Conectar Cuenta Bancaria
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Selecciona tu banco para conectar tu cuenta de forma segura
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Conexion segura con PSD2
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Usamos Open Banking (PSD2) para conectar de forma segura. Nunca almacenamos tus
                  credenciales bancarias.
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar banco..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Institution Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredInstitutions.map((institution) => (
              <button
                key={institution.id}
                onClick={() => handleSelectInstitution(institution)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-primary-500 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {institution.logo ? (
                    <img
                      src={institution.logo}
                      alt={institution.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-primary-500">
                  {institution.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">{institution.bic}</p>
              </button>
            ))}
          </div>

          {filteredInstitutions.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No se encontraron bancos con "{searchQuery}"
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Step: Confirm Connection */}
      {step === 'confirm' && selectedInstitution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {selectedInstitution.logo ? (
                <img
                  src={selectedInstitution.logo}
                  alt={selectedInstitution.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Building2 className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Conectar con {selectedInstitution.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Seras redirigido a {selectedInstitution.name} para autorizar el acceso
            </p>
          </div>

          {/* What we'll access */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Acceso que solicitamos:
            </h3>
            <div className="space-y-3">
              <AccessItem
                icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                title="Informacion de cuenta"
                description="Saldos, IBAN, titular"
              />
              <AccessItem
                icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                title="Historial de transacciones"
                description={`Ultimos ${selectedInstitution.transactionTotalDays} dias`}
              />
              <AccessItem
                icon={<Lock className="w-5 h-5 text-slate-400" />}
                title="Sin acceso a pagos"
                description="Solo lectura, no podemos mover dinero"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Al continuar, aceptas que procesemos tus datos bancarios segun nuestra{' '}
              <a href="#" className="text-primary-500 hover:underline">
                politica de privacidad
              </a>
              . Puedes revocar el acceso en cualquier momento.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConnect}
              className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              Continuar a {selectedInstitution.name}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step: Redirecting */}
      {step === 'redirect' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Conectando con tu banco...
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Por favor, espera mientras establecemos la conexion segura
          </p>
        </motion.div>
      )}
    </div>
  );
}

function AccessItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-medium text-slate-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
