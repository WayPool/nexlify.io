/**
 * Investor Inquiries Admin Page
 * Only accessible to authorized admin email
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  FolderLock,
  UserPlus,
  Key,
  Eye,
  Download,
  Shield,
  FileText,
  Plus,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';

interface InvestorInquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string | null;
  country: string;
  investorType: string;
  investmentRange: string | null;
  message: string | null;
  isQualified: boolean;
  understandsRisks: boolean;
  understandsStructure: boolean;
  acceptsPrivacy: boolean;
  acceptsContact: boolean;
  status: 'new' | 'contacted' | 'qualified' | 'rejected' | 'converted';
  notes: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DataRoomAccess {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  accessLevel: 'view' | 'download' | 'full';
  status: 'pending' | 'active' | 'revoked' | 'expired';
  invitedBy: string;
  lastAccess: string | null;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface DataRoomDocument {
  id: string;
  name: string;
  description: string | null;
  category: 'financials' | 'legal' | 'corporate' | 'technical' | 'market' | 'team' | 'other';
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  version: string;
  sortOrder: number;
  uploadedBy: string;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Nuevo' },
  contacted: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'Contactado' },
  qualified: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Cualificado' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Rechazado' },
  converted: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Convertido' },
};

const investorTypeLabels: Record<string, string> = {
  institutional: 'Institucional',
  professional: 'Profesional',
  experienced: 'Experimentado',
  high_net_worth: 'Alto Patrimonio',
  family_office: 'Family Office',
  other: 'Otro',
};

const investmentRangeLabels: Record<string, string> = {
  '100k-250k': '100K - 250K',
  '250k-500k': '250K - 500K',
  '500k-1m': '500K - 1M',
  '1m+': '+1M',
};

const accessLevelLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  view: { label: 'Solo ver', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', icon: <Eye className="w-4 h-4" /> },
  download: { label: 'Ver y descargar', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', icon: <Download className="w-4 h-4" /> },
  full: { label: 'Acceso completo', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', icon: <Shield className="w-4 h-4" /> },
};

const accessStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  active: { label: 'Activo', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  revoked: { label: 'Revocado', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  expired: { label: 'Expirado', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
};

const documentCategoryLabels: Record<string, { label: string; color: string }> = {
  financials: { label: 'Financieros', color: 'bg-emerald-500' },
  legal: { label: 'Legal', color: 'bg-purple-500' },
  corporate: { label: 'Corporativo', color: 'bg-blue-500' },
  technical: { label: 'Técnico', color: 'bg-orange-500' },
  market: { label: 'Mercado', color: 'bg-cyan-500' },
  team: { label: 'Equipo', color: 'bg-pink-500' },
  other: { label: 'Otros', color: 'bg-slate-500' },
};

export default function InvestorInquiries() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'inquiries' | 'dataroom' | 'documents'>('inquiries');
  const [inquiries, setInquiries] = useState<InvestorInquiry[]>([]);
  const [dataRoomAccess, setDataRoomAccess] = useState<DataRoomAccess[]>([]);
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  // Data Room form state
  const [showAddAccess, setShowAddAccess] = useState(false);
  const [newAccessEmail, setNewAccessEmail] = useState('');
  const [newAccessName, setNewAccessName] = useState('');
  const [newAccessCompany, setNewAccessCompany] = useState('');
  const [newAccessLevel, setNewAccessLevel] = useState<'view' | 'download' | 'full'>('view');
  const [newAccessNotes, setNewAccessNotes] = useState('');
  const [submittingAccess, setSubmittingAccess] = useState(false);

  // Document form state
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DataRoomDocument['category']>('other');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocVersion, setNewDocVersion] = useState('1.0');
  const [submittingDocument, setSubmittingDocument] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check authorization
  const isAuthorized = user?.email === 'lballanti.lb@gmail.com';

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/investor-inquiries');
      setInquiries(response.data.inquiries);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar consultas';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataRoomAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/data-room/admin/access');
      setDataRoomAccess(response.data.access);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar accesos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const grantDataRoomAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccessEmail.trim()) return;

    try {
      setSubmittingAccess(true);
      setError(null);
      const response = await api.post('/data-room/admin/access', {
        email: newAccessEmail.trim(),
        name: newAccessName.trim() || null,
        company: newAccessCompany.trim() || null,
        accessLevel: newAccessLevel,
        notes: newAccessNotes.trim() || null,
      });
      setDataRoomAccess((prev) => [response.data.access, ...prev]);
      setNewAccessEmail('');
      setNewAccessName('');
      setNewAccessCompany('');
      setNewAccessLevel('view');
      setNewAccessNotes('');
      setShowAddAccess(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al conceder acceso';
      setError(errorMsg);
    } finally {
      setSubmittingAccess(false);
    }
  };

  const updateAccessStatus = async (id: string, status: string) => {
    try {
      setUpdating(id);
      await api.patch(`/data-room/admin/access/${id}`, { status });
      setDataRoomAccess((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as DataRoomAccess['status'] } : a))
      );
    } catch (err) {
      console.error('Error updating access:', err);
    } finally {
      setUpdating(null);
    }
  };

  const revokeAccess = async (id: string) => {
    if (!confirm('¿Estás seguro de revocar este acceso?')) return;
    try {
      await api.delete(`/data-room/admin/access/${id}`);
      setDataRoomAccess((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error revoking access:', err);
    }
  };

  // Document management functions
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/data-room/admin/documents');
      setDocuments(response.data.documents);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar documentos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocFile) return;

    try {
      setSubmittingDocument(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('file', newDocFile);
      formData.append('name', newDocName.trim());
      formData.append('description', newDocDescription.trim() || '');
      formData.append('category', newDocCategory);
      formData.append('version', newDocVersion.trim() || '1.0');

      const response = await api.post('/data-room/admin/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(percent);
        },
      });
      setDocuments((prev) => [response.data.document, ...prev]);
      setNewDocName('');
      setNewDocDescription('');
      setNewDocCategory('other');
      setNewDocFile(null);
      setNewDocVersion('1.0');
      setUploadProgress(0);
      setShowAddDocument(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al subir documento';
      setError(errorMsg);
    } finally {
      setSubmittingDocument(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setNewDocFile(file);
      // Auto-fill name from filename if empty
      if (!newDocName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setNewDocName(nameWithoutExt);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewDocFile(file);
      // Auto-fill name from filename if empty
      if (!newDocName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setNewDocName(nameWithoutExt);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;
    try {
      await api.delete(`/data-room/admin/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchInquiries();
      fetchDataRoomAccess();
      fetchDocuments();
    }
  }, [isAuthorized]);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    try {
      setUpdating(id);
      await api.patch(`/investor-inquiries/${id}`, { status, notes });
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: status as InvestorInquiry['status'], notes: notes || i.notes } : i))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;
    try {
      await api.delete(`/investor-inquiries/${id}`);
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      searchTerm === '' ||
      `${inquiry.firstName} ${inquiry.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-500 dark:text-slate-400">No tienes permisos para ver esta pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Inversores</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'inquiries'
              ? `${inquiries.length} consultas recibidas`
              : activeTab === 'dataroom'
                ? `${dataRoomAccess.length} accesos al Data Room`
                : `${documents.length} documentos en el Data Room`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'dataroom' && (
            <button
              onClick={() => setShowAddAccess(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Añadir Acceso
            </button>
          )}
          {activeTab === 'documents' && (
            <button
              onClick={() => setShowAddDocument(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir Documento
            </button>
          )}
          <button
            onClick={activeTab === 'inquiries' ? fetchInquiries : activeTab === 'dataroom' ? fetchDataRoomAccess : fetchDocuments}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'inquiries'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Users className="w-5 h-5" />
          Consultas
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {inquiries.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('dataroom')}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'dataroom'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <FolderLock className="w-5 h-5" />
          Accesos
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {dataRoomAccess.filter((a) => a.status === 'active').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'documents'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <FileText className="w-5 h-5" />
          Documentos
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {documents.length}
          </span>
        </button>
      </div>

      {/* Add Access Modal */}
      <AnimatePresence>
        {showAddAccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddAccess(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Key className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Conceder Acceso al Data Room
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Añade un nuevo usuario autorizado
                  </p>
                </div>
              </div>
              <form onSubmit={grantDataRoomAccess} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAccessEmail}
                    onChange={(e) => setNewAccessEmail(e.target.value)}
                    placeholder="inversor@ejemplo.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newAccessName}
                      onChange={(e) => setNewAccessName(e.target.value)}
                      placeholder="Juan García"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={newAccessCompany}
                      onChange={(e) => setNewAccessCompany(e.target.value)}
                      placeholder="Inversiones S.L."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nivel de Acceso
                  </label>
                  <div className="flex gap-2">
                    {(['view', 'download', 'full'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setNewAccessLevel(level)}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border',
                          newAccessLevel === level
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        )}
                      >
                        {accessLevelLabels[level].icon}
                        <span className="hidden sm:inline">{accessLevelLabels[level].label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={newAccessNotes}
                    onChange={(e) => setNewAccessNotes(e.target.value)}
                    placeholder="Información adicional sobre este acceso..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAccess(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAccess || !newAccessEmail.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {submittingAccess ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Conceder Acceso
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Document Modal */}
      <AnimatePresence>
        {showAddDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddDocument(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Subir Documento
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Arrastra o selecciona un archivo
                  </p>
                </div>
              </div>
              <form onSubmit={createDocument} className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={clsx(
                    'relative border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer',
                    dragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : newDocFile
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  )}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv,.zip"
                    onChange={handleFileSelect}
                  />
                  {newDocFile ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {newDocFile.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatFileSize(newDocFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewDocFile(null);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Arrastra un archivo aquí
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        PDF, Word, Excel, PowerPoint, imágenes (máx. 100MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload progress */}
                {submittingDocument && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Subiendo...</span>
                      <span className="text-slate-900 dark:text-white font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="Informe financiero Q4 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value as DataRoomDocument['category'])}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {Object.entries(documentCategoryLabels).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Versión
                    </label>
                    <input
                      type="text"
                      value={newDocVersion}
                      onChange={(e) => setNewDocVersion(e.target.value)}
                      placeholder="1.0"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={newDocDescription}
                    onChange={(e) => setNewDocDescription(e.target.value)}
                    placeholder="Descripción del documento..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDocument(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDocument || !newDocName.trim() || !newDocFile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {submittingDocument ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {submittingDocument ? 'Subiendo...' : 'Subir Documento'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'inquiries' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="new">Nuevos</option>
                <option value="contacted">Contactados</option>
                <option value="qualified">Cualificados</option>
                <option value="rejected">Rechazados</option>
                <option value="converted">Convertidos</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Inquiries Tab Content */}
      {activeTab === 'inquiries' && (
        <>
          {/* Empty state */}
          {!loading && filteredInquiries.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No hay consultas que mostrar</p>
            </div>
          )}

          {/* Inquiries list */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredInquiries.map((inquiry) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Header row */}
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                      {inquiry.firstName[0]}
                      {inquiry.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {inquiry.firstName} {inquiry.lastName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {inquiry.email}
                        </span>
                        {inquiry.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {inquiry.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        statusColors[inquiry.status].bg,
                        statusColors[inquiry.status].text
                      )}
                    >
                      {statusColors[inquiry.status].label}
                    </span>
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                      {investorTypeLabels[inquiry.investorType]}
                    </span>
                    {inquiry.investmentRange && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
                        {investmentRangeLabels[inquiry.investmentRange]}
                      </span>
                    )}
                    {expandedId === inquiry.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedId === inquiry.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-slate-900 dark:text-white">Datos de contacto</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <a href={`mailto:${inquiry.email}`} className="hover:text-primary-500">
                              {inquiry.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${inquiry.phone}`} className="hover:text-primary-500">
                              {inquiry.phone}
                            </a>
                          </div>
                          {inquiry.company && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              {inquiry.company}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Globe className="w-4 h-4 text-slate-400" />
                            {inquiry.country}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(inquiry.createdAt).toLocaleString('es-ES')}
                          </div>
                        </div>
                      </div>

                      {/* Declarations */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-slate-900 dark:text-white">Declaraciones</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            {inquiry.isQualified ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300">Inversor cualificado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {inquiry.understandsRisks ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300">Comprende los riesgos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {inquiry.understandsStructure ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300">Comprende la estructura</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {inquiry.acceptsPrivacy ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300">Acepta privacidad</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {inquiry.acceptsContact ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-slate-600 dark:text-slate-300">Acepta comunicaciones</span>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {inquiry.message && (
                        <div className="md:col-span-2 space-y-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Mensaje
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                            {inquiry.message}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                          Cambiar estado:
                        </span>
                        {['new', 'contacted', 'qualified', 'rejected', 'converted'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(inquiry.id, status)}
                            disabled={updating === inquiry.id || inquiry.status === status}
                            className={clsx(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50',
                              inquiry.status === status
                                ? `${statusColors[status].bg} ${statusColors[status].text}`
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            )}
                          >
                            {updating === inquiry.id ? (
                              <Clock className="w-4 h-4 animate-spin" />
                            ) : (
                              statusColors[status].label
                            )}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteInquiry(inquiry.id)}
                          className="ml-auto p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Data Room Tab Content */}
      {activeTab === 'dataroom' && (
        <>
          {/* Empty state */}
          {!loading && dataRoomAccess.length === 0 && (
            <div className="text-center py-12">
              <FolderLock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No hay accesos al Data Room configurados
              </p>
              <button
                onClick={() => setShowAddAccess(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Añadir primer acceso
              </button>
            </div>
          )}

          {/* Access list */}
          {dataRoomAccess.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Nivel
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Último acceso
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Concedido
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {dataRoomAccess.map((access) => (
                      <tr key={access.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                              {access.name ? access.name.charAt(0).toUpperCase() : access.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {access.name || 'Sin nombre'}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {access.email}
                              </p>
                              {access.company && (
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                  {access.company}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={clsx(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                            accessLevelLabels[access.accessLevel].color
                          )}>
                            {accessLevelLabels[access.accessLevel].icon}
                            {accessLevelLabels[access.accessLevel].label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={clsx(
                            'px-2.5 py-1 rounded-lg text-xs font-medium',
                            accessStatusLabels[access.status].color
                          )}>
                            {accessStatusLabels[access.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {access.lastAccess
                            ? new Date(access.lastAccess).toLocaleDateString('es-ES')
                            : 'Nunca'}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(access.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {access.status === 'pending' && (
                              <button
                                onClick={() => updateAccessStatus(access.id, 'active')}
                                disabled={updating === access.id}
                                className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Activar"
                              >
                                {updating === access.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {access.status === 'active' && (
                              <button
                                onClick={() => updateAccessStatus(access.id, 'revoked')}
                                disabled={updating === access.id}
                                className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                title="Revocar"
                              >
                                {updating === access.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {access.status === 'revoked' && (
                              <button
                                onClick={() => updateAccessStatus(access.id, 'active')}
                                disabled={updating === access.id}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Reactivar"
                              >
                                {updating === access.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => revokeAccess(access.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Documents Tab Content */}
      {activeTab === 'documents' && (
        <>
          {/* Empty state */}
          {!loading && documents.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No hay documentos en el Data Room
              </p>
              <button
                onClick={() => setShowAddDocument(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Añadir primer documento
              </button>
            </div>
          )}

          {/* Documents list */}
          {documents.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Versión
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {doc.name}
                              </p>
                              {doc.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {doc.description}
                                </p>
                              )}
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {doc.filePath}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            <span className={clsx('w-2 h-2 rounded-full', documentCategoryLabels[doc.category]?.color || 'bg-slate-400')} />
                            {documentCategoryLabels[doc.category]?.label || doc.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                          v{doc.version}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
