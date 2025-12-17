import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import clsx from 'clsx';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import SubscriptionRequired from '@/components/SubscriptionRequired';
import { Loader2 } from 'lucide-react';

// Routes that are always accessible regardless of subscription status
const ALWAYS_ACCESSIBLE_ROUTES = ['/billing', '/settings', '/logout'];

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isBlocked, blockReason, isLoading, refetch } = useSubscriptionStatus();

  // Check if current route should bypass subscription check
  const isAccessibleRoute = ALWAYS_ACCESSIBLE_ROUTES.some(route =>
    location.pathname.endsWith(route) || location.pathname.includes('/billing')
  );

  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">Verificando suscripción...</p>
        </div>
      </div>
    );
  }

  // Show subscription required screen if blocked and not on an accessible route
  if (isBlocked && blockReason && !isAccessibleRoute) {
    return <SubscriptionRequired status={blockReason} onRetry={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={clsx(
          'lg:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar isCollapsed={false} onToggle={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div
        className={clsx(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'
        )}
      >
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
