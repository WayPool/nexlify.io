import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Shield,
  Bell,
  Monitor,
  Globe,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Copy,
  LogOut,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  Mail,
  MessageSquare,
  FileText,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { settingsApi } from '@/services/api';

type SettingsSection = 'security' | 'notifications' | 'appearance' | 'privacy' | 'data';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export default function Settings() {
  const { logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [activeSection, setActiveSection] = useState<SettingsSection>('security');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'Madrid, Spain',
      lastActive: 'Ahora',
      current: true,
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari',
      location: 'Madrid, Spain',
      lastActive: 'Hace 2 horas',
      current: false,
    },
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: {
      riskAlerts: true,
      weeklyDigest: true,
      securityAlerts: true,
      productUpdates: false,
    },
    push: {
      riskAlerts: true,
      mentions: true,
      reminders: true,
    },
  });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'team',
    activityStatus: true,
    analyticsSharing: false,
  });

  // Calculate password strength
  useEffect(() => {
    const password = passwordData.newPassword;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    setPasswordStrength(strength);
  }, [passwordData.newPassword]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      await settingsApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await settingsApi.setup2FA();
      setQrCode(response.data.qr_code);
      setBackupCodes(response.data.backup_codes || []);
      setIs2FASetupOpen(true);
    } catch (error) {
      console.error('2FA setup error:', error);
      toast.error('Error al configurar 2FA');
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Introduce el código de 6 dígitos');
      return;
    }

    setIsVerifying2FA(true);
    try {
      await settingsApi.verify2FA({ code: verificationCode });
      setIs2FAEnabled(true);
      setIs2FASetupOpen(false);
      setVerificationCode('');
      toast.success('Autenticación de dos factores activada');
    } catch (error) {
      console.error('2FA verify error:', error);
      toast.error('Código incorrecto');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('¿Estás seguro de que quieres desactivar la autenticación de dos factores?')) {
      return;
    }

    try {
      await settingsApi.disable2FA();
      setIs2FAEnabled(false);
      toast.success('Autenticación de dos factores desactivada');
    } catch (error) {
      console.error('2FA disable error:', error);
      toast.error('Error al desactivar 2FA');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await settingsApi.revokeSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Sesión revocada');
    } catch (error) {
      console.error('Revoke session error:', error);
      toast.error('Error al revocar sesión');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('¿Estás seguro? Se cerrarán todas las sesiones excepto la actual.')) {
      return;
    }

    try {
      await settingsApi.revokeAllSessions();
      setSessions(sessions.filter(s => s.current));
      toast.success('Todas las sesiones han sido revocadas');
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      toast.error('Error al revocar sesiones');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await settingsApi.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexlify-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Datos exportados correctamente');
    } catch (error) {
      console.error('Export data error:', error);
      toast.error('Error al exportar datos');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Escribe "ELIMINAR" para confirmar la eliminación de tu cuenta:');
    if (confirmation !== 'ELIMINAR') {
      toast.error('Confirmación incorrecta');
      return;
    }

    try {
      await settingsApi.deleteAccount();
      logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Error al eliminar la cuenta');
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Débil';
    if (passwordStrength < 70) return 'Media';
    return 'Fuerte';
  };

  const sections = [
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Monitor },
    { id: 'privacy', label: 'Privacidad', icon: Eye },
    { id: 'data', label: 'Datos', icon: FileText },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gestiona la seguridad, notificaciones y preferencias de tu cuenta
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 lg:sticky lg:top-24">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as SettingsSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-6">
          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Change Password */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cambiar Contraseña</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Actualiza tu contraseña regularmente</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        placeholder="Introduce tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        placeholder="Introduce tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPasswordStrengthColor()} transition-all`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength < 40 ? 'text-red-500' : passwordStrength < 70 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                          <li className={`flex items-center gap-1 ${passwordData.newPassword.length >= 8 ? 'text-green-500' : ''}`}>
                            {passwordData.newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Mínimo 8 caracteres
                          </li>
                          <li className={`flex items-center gap-1 ${/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) ? 'text-green-500' : ''}`}>
                            {/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Mayúsculas y minúsculas
                          </li>
                          <li className={`flex items-center gap-1 ${/\d/.test(passwordData.newPassword) ? 'text-green-500' : ''}`}>
                            {/\d/.test(passwordData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Al menos un número
                          </li>
                          <li className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? 'text-green-500' : ''}`}>
                            {/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Un carácter especial
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'
                        }`}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
                    )}
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                    className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white disabled:text-slate-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Autenticación de Dos Factores</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    is2FAEnabled
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {is2FAEnabled ? 'Activado' : 'Desactivado'}
                  </div>
                </div>

                {!is2FASetupOpen ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${is2FAEnabled ? 'bg-green-500' : 'bg-slate-400'}`} />
                      <span className="text-slate-700 dark:text-slate-300">
                        {is2FAEnabled ? 'Tu cuenta está protegida con 2FA' : 'Protege tu cuenta con 2FA'}
                      </span>
                    </div>
                    <button
                      onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
                      className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                        is2FAEnabled
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                          : 'bg-primary-500 hover:bg-primary-600 text-white'
                      }`}
                    >
                      {is2FAEnabled ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center">
                        Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)
                      </p>
                      {qrCode ? (
                        <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-xl bg-white p-2" />
                      ) : (
                        <div className="w-48 h-48 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    {backupCodes.length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <span className="font-medium text-amber-700 dark:text-amber-300">Códigos de respaldo</span>
                        </div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                          Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu dispositivo.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {backupCodes.map((code, index) => (
                            <div key={index} className="font-mono text-sm bg-white dark:bg-slate-800 px-3 py-2 rounded-lg text-center">
                              {code}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(backupCodes.join('\n'));
                            toast.success('Códigos copiados');
                          }}
                          className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-300 hover:underline"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar códigos
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Código de verificación
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIs2FASetupOpen(false);
                          setVerificationCode('');
                        }}
                        className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleVerify2FA}
                        disabled={isVerifying2FA || verificationCode.length !== 6}
                        className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white disabled:text-slate-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {isVerifying2FA ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Verificar y Activar'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Sessions */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sesiones Activas</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Dispositivos donde has iniciado sesión</p>
                    </div>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={handleRevokeAllSessions}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                    >
                      Cerrar todas
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        session.current
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'bg-slate-50 dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          session.current
                            ? 'bg-primary-100 dark:bg-primary-900/30'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}>
                          {session.device.includes('iPhone') || session.device.includes('Android') ? (
                            <Smartphone className={`w-5 h-5 ${session.current ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'}`} />
                          ) : (
                            <Monitor className={`w-5 h-5 ${session.current ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'}`} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">{session.device}</span>
                            {session.current && (
                              <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {session.browser} • {session.location} • {session.lastActive}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Email Notifications */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notificaciones por Email</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configura qué emails quieres recibir</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'riskAlerts', label: 'Alertas de riesgo', description: 'Notificaciones cuando se detecten nuevos riesgos' },
                    { key: 'weeklyDigest', label: 'Resumen semanal', description: 'Un resumen de la actividad de la semana' },
                    { key: 'securityAlerts', label: 'Alertas de seguridad', description: 'Notificaciones de seguridad importantes' },
                    { key: 'productUpdates', label: 'Actualizaciones del producto', description: 'Nuevas funcionalidades y mejoras' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({
                          ...notifications,
                          email: { ...notifications.email, [item.key]: !notifications.email[item.key as keyof typeof notifications.email] }
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notifications.email[item.key as keyof typeof notifications.email]
                            ? 'bg-primary-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          notifications.email[item.key as keyof typeof notifications.email] ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notificaciones Push</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Notificaciones en tiempo real</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'riskAlerts', label: 'Alertas de riesgo', description: 'Notificaciones instantáneas de riesgos' },
                    { key: 'mentions', label: 'Menciones', description: 'Cuando alguien te menciona' },
                    { key: 'reminders', label: 'Recordatorios', description: 'Tareas y plazos pendientes' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({
                          ...notifications,
                          push: { ...notifications.push, [item.key]: !notifications.push[item.key as keyof typeof notifications.push] }
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notifications.push[item.key as keyof typeof notifications.push]
                            ? 'bg-primary-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          notifications.push[item.key as keyof typeof notifications.push] ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tema</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Personaliza la apariencia de la aplicación</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Claro', icon: Sun },
                    { value: 'dark', label: 'Oscuro', icon: Moon },
                    { value: 'system', label: 'Sistema', icon: Laptop },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                        className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                          theme === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          theme === option.value
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`font-medium ${
                          theme === option.value
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Idioma</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona tu idioma preferido</p>
                  </div>
                </div>

                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Configuración de Privacidad</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Controla quién puede ver tu información</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Visibilidad del perfil
                    </label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    >
                      <option value="everyone">Todos en la organización</option>
                      <option value="team">Solo mi equipo</option>
                      <option value="private">Solo yo</option>
                    </select>
                  </div>

                  {/* Activity Status */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Mostrar estado de actividad</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Permite que otros vean cuando estás conectado</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, activityStatus: !privacy.activityStatus })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.activityStatus ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        privacy.activityStatus ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Analytics Sharing */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Compartir datos de uso</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Ayúdanos a mejorar compartiendo datos anónimos</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, analyticsSharing: !privacy.analyticsSharing })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.analyticsSharing ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        privacy.analyticsSharing ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Data Section */}
          {activeSection === 'data' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Export Data */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Exportar Datos</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Descarga una copia de todos tus datos</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Puedes descargar todos tus datos personales y de actividad en formato JSON. Este archivo incluye tu perfil, configuraciones y actividad en la plataforma.
                </p>

                <button
                  onClick={handleExportData}
                  className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar mis datos
                </button>
              </div>

              {/* Delete Account */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Eliminar Cuenta</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Esta acción es permanente e irreversible</p>
                  </div>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-600 dark:text-red-400">
                      <p className="font-medium mb-1">Al eliminar tu cuenta:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-500 dark:text-red-400">
                        <li>Se eliminarán todos tus datos personales</li>
                        <li>Perderás acceso a la plataforma</li>
                        <li>No podrás recuperar tu cuenta</li>
                        <li>Las suscripciones activas se cancelarán</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar mi cuenta permanentemente
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
