/**
 * Users Page
 *
 * Complete user management panel with role-based permissions per module.
 * Allows admins to invite users, assign roles, and grant module-specific access.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  ShieldCheck,
  Eye,
  Edit3,
  Trash2,
  X,
  Check,
  Clock,
  Users as UsersIcon,
  KeyRound,
  Boxes,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Crown,
  UserCog,
  Download,
} from 'lucide-react';
import clsx from 'clsx';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'auditor' | 'module_operator' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  mfaEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  modulePermissions: ModulePermission[];
}

interface ModulePermission {
  moduleId: string;
  moduleName: string;
  permissions: ('read' | 'write' | 'manage' | 'admin')[];
}

// Module categories with their modules
const MODULE_CATEGORIES = [
  {
    name: 'Compliance & Legal',
    modules: [
      { id: 'aml', name: 'Anti-Blanqueo (AML)' },
      { id: 'gdpr', name: 'GDPR & Privacidad' },
      { id: 'contracts', name: 'Gestión de Contratos' },
      { id: 'corporate', name: 'Gobierno Corporativo' },
      { id: 'whistleblowing', name: 'Canal de Denuncias' },
      { id: 'esg', name: 'ESG & Sostenibilidad' },
    ],
  },
  {
    name: 'Finanzas & Tesorería',
    modules: [
      { id: 'banking', name: 'Control Bancario' },
      { id: 'fraud', name: 'Detección de Fraude' },
      { id: 'budget', name: 'Control Presupuestario' },
      { id: 'expenses', name: 'Gestión de Gastos' },
      { id: 'treasury', name: 'Tesorería Avanzada' },
      { id: 'einvoicing', name: 'Facturación Electrónica' },
    ],
  },
  {
    name: 'Ciberseguridad & Accesos',
    modules: [
      { id: 'iam', name: 'Control de Accesos (IAM)' },
      { id: 'siem', name: 'SIEM & Logs' },
      { id: 'vulnerabilities', name: 'Vulnerabilidades' },
      { id: 'incident-response', name: 'Respuesta a Incidentes' },
      { id: 'secrets', name: 'Gestión de Secretos' },
      { id: 'mdm', name: 'MDM & Endpoints' },
    ],
  },
  {
    name: 'Recursos Humanos',
    modules: [
      { id: 'payroll', name: 'Nóminas & Contratos' },
      { id: 'time-tracking', name: 'Control Horario' },
      { id: 'training', name: 'Formación & Certificaciones' },
      { id: 'prl', name: 'Prevención de Riesgos (PRL)' },
      { id: 'equality', name: 'Plan de Igualdad' },
      { id: 'onboarding', name: 'Onboarding & Offboarding' },
    ],
  },
  {
    name: 'Operaciones & Cadena de Suministro',
    modules: [
      { id: 'suppliers', name: 'Gestión de Proveedores' },
      { id: 'inventory', name: 'Control de Inventario' },
      { id: 'logistics', name: 'Logística & Transporte' },
      { id: 'maintenance', name: 'Mantenimiento (CMMS)' },
      { id: 'quality', name: 'Calidad (QMS)' },
      { id: 'bcp', name: 'Continuidad de Negocio' },
    ],
  },
  {
    name: 'Datos, IA & Automatización',
    modules: [
      { id: 'document-ai', name: 'Análisis Documental' },
      { id: 'blockchain', name: 'Blockchain & Trazabilidad' },
      { id: 'ai-assistant', name: 'Asistente IA' },
      { id: 'bi', name: 'Business Intelligence' },
      { id: 'rpa', name: 'Automatización (RPA)' },
      { id: 'api', name: 'API & Integraciones' },
    ],
  },
  {
    name: 'Defensa & Seguridad Nacional',
    modules: [
      { id: 'threat-intelligence', name: 'Inteligencia de Amenazas' },
      { id: 'cyber-defense', name: 'Ciberdefensa Avanzada' },
      { id: 'data-fusion', name: 'Fusión de Datos Nacional' },
      { id: 'strategic-ai', name: 'IA Estratégica & Decisión' },
    ],
    isGovernment: true,
  },
];

const roleConfig = {
  admin: {
    label: 'Administrador',
    description: 'Acceso total a la plataforma y gestión de usuarios',
    icon: Crown,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  manager: {
    label: 'Gestor',
    description: 'Puede gestionar módulos asignados y ver reportes',
    icon: UserCog,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  auditor: {
    label: 'Auditor',
    description: 'Acceso de lectura completo para auditoría',
    icon: Eye,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  module_operator: {
    label: 'Operador',
    description: 'Acceso limitado a módulos específicos',
    icon: Boxes,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  viewer: {
    label: 'Visor',
    description: 'Solo puede ver información, sin editar',
    icon: Eye,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
  },
};

const statusConfig = {
  active: {
    label: 'Activo',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  inactive: {
    label: 'Inactivo',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
};

// Initial empty users array - managed via state

// Empty state component
function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full border-2 border-slate-200 dark:border-slate-700">
          <UsersIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
        Gestiona tu equipo
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed">
        Invita a usuarios a tu organización y asígnales permisos específicos para cada módulo de la plataforma.
      </p>

      <button
        onClick={onInvite}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
      >
        <UserPlus className="w-5 h-5" />
        Invitar Usuario
      </button>

      <div className="mt-12 w-full max-w-2xl">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 text-center">
          Roles disponibles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(roleConfig).map(([key, config]) => (
            <div
              key={key}
              className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className={clsx('p-2 rounded-lg', config.bg)}>
                <config.icon className={clsx('w-4 h-4', config.color)} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">{config.label}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// User card component
function UserCard({
  user,
  onEdit,
  onManagePermissions,
  onDelete,
}: {
  user: User;
  onEdit: () => void;
  onManagePermissions: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const role = roleConfig[user.role];
  const status = statusConfig[user.status];
  const StatusIcon = status.icon;
  const RoleIcon = role.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={clsx(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900',
            user.status === 'active' && 'bg-emerald-500',
            user.status === 'pending' && 'bg-amber-500',
            user.status === 'inactive' && 'bg-red-500'
          )} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {user.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => { onEdit(); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar usuario
                      </button>
                      <button
                        onClick={() => { onManagePermissions(); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                        Gestionar permisos
                      </button>
                      <button
                        onClick={() => { setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Reenviar invitación
                      </button>
                      <div className="border-t border-slate-200 dark:border-slate-700" />
                      <button
                        onClick={() => { onDelete(); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Desactivar usuario
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Role & Status badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', role.bg, role.color)}>
              <RoleIcon className="w-3 h-3" />
              {role.label}
            </span>
            <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', status.bg, status.color)}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            {user.mfaEnabled && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                MFA
              </span>
            )}
          </div>

          {/* Module permissions summary */}
          {user.modulePermissions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Acceso a {user.modulePermissions.length} módulos
              </p>
              <div className="flex flex-wrap gap-1">
                {user.modulePermissions.slice(0, 4).map((mp) => (
                  <span
                    key={mp.moduleId}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs"
                  >
                    {mp.moduleName}
                  </span>
                ))}
                {user.modulePermissions.length > 4 && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                    +{user.modulePermissions.length - 4} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Last login */}
          {user.lastLogin && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Último acceso: {new Date(user.lastLogin).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Invite User Modal
function InviteUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('viewer');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const modulePermissions = selectedModules.map((moduleId) => {
        const module = MODULE_CATEGORIES.flatMap((c) => c.modules).find((m) => m.id === moduleId);
        return {
          moduleId,
          moduleName: module?.name || moduleId,
          permissions: ['read', 'write'] as ('read' | 'write' | 'manage' | 'admin')[],
        };
      });

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          role,
          modulePermissions: modulePermissions.map(({ moduleId, permissions }) => ({
            moduleId,
            permissions,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al enviar la invitación');
      }

      const newUser = await response.json();

      // Create full user object for local state
      const createdUser: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: 'pending',
        mfaEnabled: false,
        createdAt: newUser.created_at,
        modulePermissions,
      };

      setSuccess(true);

      // Wait a moment to show success state, then close
      setTimeout(() => {
        onSuccess(createdUser);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectAllInCategory = (modules: { id: string }[]) => {
    const moduleIds = modules.map((m) => m.id);
    const allSelected = moduleIds.every((id) => selectedModules.includes(id));
    if (allSelected) {
      setSelectedModules((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      setSelectedModules((prev) => [...new Set([...prev, ...moduleIds])]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Invitar Usuario
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {step === 1 ? 'Información básica' : 'Permisos por módulo'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className={clsx(
              'flex items-center gap-2',
              step === 1 ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'
            )}>
              <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                step === 1 ? 'bg-primary-500 text-white' : 'bg-emerald-500 text-white'
              )}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Datos del usuario</span>
            </div>
            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600" />
            <div className={clsx(
              'flex items-center gap-2',
              step === 2 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'
            )}>
              <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                step === 2 ? 'bg-primary-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
              )}>
                2
              </div>
              <span className="text-sm font-medium">Permisos</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan García"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Rol del usuario *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(key as User['role'])}
                      className={clsx(
                        'flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left',
                        role === key
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      )}
                    >
                      <div className={clsx('p-2 rounded-lg', config.bg)}>
                        <config.icon className={clsx('w-4 h-4', config.color)} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {config.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Selecciona los módulos a los que tendrá acceso este usuario
                </p>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {selectedModules.length} seleccionados
                </span>
              </div>

              {MODULE_CATEGORIES.map((category) => (
                <div
                  key={category.name}
                  className={clsx(
                    'border rounded-xl overflow-hidden',
                    category.isGovernment
                      ? 'border-red-200 dark:border-red-900/50'
                      : 'border-slate-200 dark:border-slate-700'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className={clsx(
                      'w-full flex items-center justify-between p-4 transition-colors',
                      category.isGovernment
                        ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {expandedCategories.includes(category.name) ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={clsx(
                        'font-medium',
                        category.isGovernment
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      )}>
                        {category.name}
                      </span>
                      {category.isGovernment && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium">
                          Gobierno
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllInCategory(category.modules);
                      }}
                      className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    >
                      {category.modules.every((m) => selectedModules.includes(m.id))
                        ? 'Deseleccionar todos'
                        : 'Seleccionar todos'}
                    </button>
                  </button>

                  <AnimatePresence>
                    {expandedCategories.includes(category.name) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {category.modules.map((module) => (
                            <label
                              key={module.id}
                              className={clsx(
                                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                                selectedModules.includes(module.id)
                                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selectedModules.includes(module.id)}
                                onChange={() => toggleModule(module.id)}
                                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {module.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              ¡Invitación enviada correctamente!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!email || !name}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                disabled={isSubmitting || success}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || success}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Enviada!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Enviar Invitación
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Manage Permissions Modal
function ManagePermissionsModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [selectedModules, setSelectedModules] = useState<string[]>(
    user.modulePermissions.map((mp) => mp.moduleId)
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Permisos de {user.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Módulos con acceso habilitado
            </p>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {selectedModules.length} módulos
            </span>
          </div>

          <div className="space-y-3">
            {MODULE_CATEGORIES.map((category) => (
              <div
                key={category.name}
                className={clsx(
                  'border rounded-xl overflow-hidden',
                  category.isGovernment
                    ? 'border-red-200 dark:border-red-900/50'
                    : 'border-slate-200 dark:border-slate-700'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className={clsx(
                    'w-full flex items-center justify-between p-4 transition-colors',
                    category.isGovernment
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : 'bg-slate-50 dark:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {expandedCategories.includes(category.name) ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className={clsx(
                      'font-medium',
                      category.isGovernment
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-slate-900 dark:text-white'
                    )}>
                      {category.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({category.modules.filter((m) => selectedModules.includes(m.id)).length}/{category.modules.length})
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCategories.includes(category.name) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-2">
                        {category.modules.map((module) => (
                          <div
                            key={module.id}
                            className={clsx(
                              'flex items-center justify-between p-3 rounded-lg border',
                              selectedModules.includes(module.id)
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                            )}
                          >
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={selectedModules.includes(module.id)}
                                onChange={() => toggleModule(module.id)}
                                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {module.name}
                              </span>
                            </label>
                            {selectedModules.includes(module.id) && (
                              <select className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400">
                                <option value="read">Solo lectura</option>
                                <option value="write">Lectura/Escritura</option>
                                <option value="manage">Gestión</option>
                                <option value="admin">Administrador</option>
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const handleUserCreated = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const hasUsers = users.length > 0;

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  if (!hasUsers) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Administra usuarios y permisos de tu organización
            </p>
          </div>
        </div>

        {/* Summary Cards - All zeros */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total usuarios', value: 0, icon: UsersIcon, color: 'blue' },
            { label: 'Activos', value: 0, icon: CheckCircle2, color: 'green' },
            { label: 'Pendientes', value: 0, icon: Clock, color: 'amber' },
            { label: 'Administradores', value: 0, icon: Crown, color: 'purple' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'p-2 rounded-lg',
                  stat.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
                  stat.color === 'green' && 'bg-emerald-100 dark:bg-emerald-900/30',
                  stat.color === 'amber' && 'bg-amber-100 dark:bg-amber-900/30',
                  stat.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30'
                )}>
                  <stat.icon className={clsx(
                    'w-5 h-5',
                    stat.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                    stat.color === 'green' && 'text-emerald-600 dark:text-emerald-400',
                    stat.color === 'amber' && 'text-amber-600 dark:text-amber-400',
                    stat.color === 'purple' && 'text-purple-600 dark:text-purple-400'
                  )} />
                </div>
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
          <EmptyState onInvite={() => setShowInviteModal(true)} />
        </div>

        {/* Invite Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <InviteUserModal
              onClose={() => setShowInviteModal(false)}
              onSuccess={handleUserCreated}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {filteredUsers.length} usuarios en tu organización
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Invitar Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total usuarios', value: stats.total, icon: UsersIcon, color: 'blue' },
          { label: 'Activos', value: stats.active, icon: CheckCircle2, color: 'green' },
          { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Administradores', value: stats.admins, icon: Crown, color: 'purple' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                'p-2 rounded-lg',
                stat.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
                stat.color === 'green' && 'bg-emerald-100 dark:bg-emerald-900/30',
                stat.color === 'amber' && 'bg-amber-100 dark:bg-amber-900/30',
                stat.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30'
              )}>
                <stat.icon className={clsx(
                  'w-5 h-5',
                  stat.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                  stat.color === 'green' && 'text-emerald-600 dark:text-emerald-400',
                  stat.color === 'amber' && 'text-amber-600 dark:text-amber-400',
                  stat.color === 'purple' && 'text-purple-600 dark:text-purple-400'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">Todos los roles</option>
            {Object.entries(roleConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={() => {}}
            onManagePermissions={() => {
              setSelectedUser(user);
              setShowPermissionsModal(true);
            }}
            onDelete={() => {}}
          />
        ))}
      </div>

      {/* Empty search results */}
      {filteredUsers.length === 0 && users.length > 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteUserModal
            onClose={() => setShowInviteModal(false)}
            onSuccess={handleUserCreated}
          />
        )}
        {showPermissionsModal && selectedUser && (
          <ManagePermissionsModal
            user={selectedUser}
            onClose={() => {
              setShowPermissionsModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
