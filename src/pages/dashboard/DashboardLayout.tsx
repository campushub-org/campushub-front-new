import React from 'react';
import Sidebar, { NavItem } from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navItems }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
