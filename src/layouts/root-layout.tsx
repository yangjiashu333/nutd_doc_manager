import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Outlet } from 'react-router';
import { Suspense } from 'react';
import LoadingFallback from './loading-fallback';
import ErrorBoundary from './error-boundary';

export default function Layout() {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col flex-1">
          <header className="flex items-center h-12 p-2 border-b">
            <SidebarTrigger />
          </header>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
