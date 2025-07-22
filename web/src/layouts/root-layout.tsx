import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';

export default function Layout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1">
        <header className="flex items-center h-10 p-2 border-b">
          <SidebarTrigger />
        </header>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
