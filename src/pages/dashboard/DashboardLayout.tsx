import React from 'react';
import Sidebar, { NavItem } from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useSocketNotifications } from '@/hooks/useSocketNotifications';
import { ScheduleProvider } from '@/lib/schedule-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navItems }) => {
  useSocketNotifications();
  return (
    <ScheduleProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar navItems={navItems} />
          <SidebarInset className="flex flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50/50">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ScheduleProvider>
  );
};

export default DashboardLayout;