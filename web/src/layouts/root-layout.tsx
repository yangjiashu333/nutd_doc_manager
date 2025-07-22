import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/app-sidebar';
import { Outlet } from 'react-router';

export default function Layout() {
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
