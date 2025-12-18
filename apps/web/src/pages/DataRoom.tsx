/**
 * Data Room Page
 * Accessible only to users with data room access
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Lock,
  Folder,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

interface DataRoomDocument {
  id: string;
  name: string;
  description: string | null;
  category: string;
  fileSize: number | null;
  mimeType: string | null;
  version: string;
  createdAt: string;
  canDownload: boolean;
}

interface AccessInfo {
  hasAccess: boolean;
  isAdmin: boolean;
  accessLevel?: string;
  expiresAt?: string;
  reason?: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  financials: { label: 'Financieros', color: 'bg-emerald-500' },
  legal: { label: 'Legal', color: 'bg-purple-500' },
  corporate: { label: 'Corporativo', color: 'bg-blue-500' },
  technical: { label: 'Tecnico', color: 'bg-orange-500' },
  market: { label: 'Mercado', color: 'bg-cyan-500' },
  team: { label: 'Equipo', color: 'bg-pink-500' },
  other: { label: 'Otros', color: 'bg-slate-500' },
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DataRoom() {
  const { token } = useAuthStore();
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/data-room/check-access');
      setAccessInfo(response.data);

      if (response.data.hasAccess) {
        fetchDocuments();
      } else {
        setLoading(false);
      }
    } catch (err: unknown) {
      setError('Error al verificar el acceso');
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/data-room/documents');
      setDocuments(response.data.documents);
    } catch (err: unknown) {
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = async (doc: DataRoomDocument) => {
    try {
      setViewing(doc.id);
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.nexlify.io';
      const response = await fetch(`${baseUrl}/data-room/documents/${doc.id}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if response is JSON (error) or file
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al visualizar el documento');
      }

      if (!response.ok) {
        throw new Error('Error al visualizar el documento');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: unknown) {
      console.error('Error viewing document:', err);
      const message = err instanceof Error ? err.message : 'Error al visualizar el documento';
      setError(message);
    } finally {
      setViewing(null);
    }
  };

  const downloadDocument = async (doc: DataRoomDocument) => {
    if (!doc.canDownload) return;

    try {
      setDownloading(doc.id);
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.nexlify.io';
      const response = await fetch(`${baseUrl}/data-room/documents/${doc.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if response is JSON (error) or file
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al descargar el documento');
      }

      if (!response.ok) {
        throw new Error('Error al descargar el documento');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Get filename from Content-Disposition header or use doc name
      const disposition = response.headers.get('content-disposition');
      let filename = doc.name;
      if (disposition) {
        const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
        }
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Error downloading document:', err);
      const message = err instanceof Error ? err.message : 'Error al descargar el documento';
      setError(message);
    } finally {
      setDownloading(null);
    }
  };

  // Group documents by category
  const groupedDocuments = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, DataRoomDocument[]>
  );

  const filteredCategories =
    selectedCategory === 'all'
      ? Object.keys(groupedDocuments)
      : [selectedCategory].filter((c) => groupedDocuments[c]);

  // No access view
  if (!loading && (!accessInfo || !accessInfo.hasAccess)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Acceso Restringido
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {accessInfo?.reason === 'expired'
              ? 'Tu acceso al Data Room ha expirado. Contacta con el administrador para renovarlo.'
              : 'No tienes acceso al Data Room de Inversores. Si eres un inversor autorizado, contacta con el administrador.'}
          </p>
          <a
            href="mailto:lballanti.lb@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            Solicitar Acceso
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Room</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Documentos confidenciales para inversores
          </p>
        </div>
        <div className="flex items-center gap-3">
          {accessInfo?.expiresAt && (
            <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              Expira: {new Date(accessInfo.expiresAt).toLocaleDateString('es-ES')}
            </span>
          )}
          <span
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium',
              accessInfo?.accessLevel === 'full'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : accessInfo?.accessLevel === 'download'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            )}
          >
            {accessInfo?.accessLevel === 'full'
              ? 'Acceso completo'
              : accessInfo?.accessLevel === 'download'
                ? 'Ver y descargar'
                : 'Solo lectura'}
          </span>
          <button
            onClick={checkAccess}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={clsx('w-5 h-5 text-slate-500', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && accessInfo?.hasAccess && (
        <>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              )}
            >
              Todos ({documents.length})
            </button>
            {Object.entries(categoryLabels).map(([key, { label }]) =>
              groupedDocuments[key] ? (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    selectedCategory === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {label} ({groupedDocuments[key].length})
                </button>
              ) : null
            )}
          </div>

          {/* Documents by category */}
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={clsx('w-2 h-2 rounded-full', categoryLabels[category]?.color)} />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {categoryLabels[category]?.label || category}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedDocuments[category].map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </h3>
                          {doc.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>v{doc.version}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => viewDocument(doc)}
                          disabled={viewing === doc.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                        >
                          {viewing === doc.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          Ver
                        </button>
                        {doc.canDownload ? (
                          <button
                            onClick={() => downloadDocument(doc)}
                            disabled={downloading === doc.id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                          >
                            {downloading === doc.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Descargar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed"
                          >
                            <Lock className="w-4 h-4" />
                            Bloqueado
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {documents.length === 0 && (
            <div className="text-center py-20">
              <Folder className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Sin documentos
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Aun no hay documentos disponibles en el Data Room.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
