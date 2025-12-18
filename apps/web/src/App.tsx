import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Layout } from '@/components/layout';
import { Login, Register, Dashboard, Risks, Modules, Users, Billing, CheckoutSuccess, Profile, Settings, InvestorInquiries, DataRoom, About } from '@/pages';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

// Lazy load Banking module
const BankingPage = lazy(() => import('@/pages/Banking'));
const BankingConnectPage = lazy(() => import('@/pages/Banking/Connect'));

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public route wrapper (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Page loader for lazy-loaded components
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}

// Placeholder pages for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400">Esta página está en desarrollo</p>
      </div>
    </div>
  );
}

export default function App() {
  const { setLoading } = useAuthStore();
  const { theme } = useThemeStore();

  // Initialize auth state
  useEffect(() => {
    // Check if we have stored auth state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [setLoading]);

  // Apply theme on mount
  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (theme === 'system' && systemDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/risks" element={<Risks />} />
        <Route path="/modules" element={<Modules />} />
        <Route
          path="/banking"
          element={
            <Suspense fallback={<PageLoader />}>
              <BankingPage />
            </Suspense>
          }
        />
        <Route
          path="/banking/connect"
          element={
            <Suspense fallback={<PageLoader />}>
              <BankingConnectPage />
            </Suspense>
          }
        />
        <Route path="/users" element={<Users />} />
        <Route path="/audit" element={<PlaceholderPage title="Auditoría" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reportes" />} />
        <Route path="/compliance" element={<PlaceholderPage title="Cumplimiento" />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<PlaceholderPage title="Ayuda" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/investor-inquiries" element={<InvestorInquiries />} />
        <Route path="/data-room" element={<DataRoom />} />
      </Route>

      {/* Public About Page - No auth required */}
      <Route path="/about" element={<About />} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Página no encontrada</p>
              <a
                href="/dashboard"
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
              >
                Volver al Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
