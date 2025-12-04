import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, Activity, Bell, User } from 'lucide-react';

const adminNavItems: NavItem[] = [
  { to: '/dashboard/admin', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
  { to: '/dashboard/admin/activity', icon: <Activity size={20} />, label: 'Suivi Activité' },
  { to: '/dashboard/admin/notifications', icon: <Bell size={20} />, label: 'Notifications' },
  { to: '/dashboard/admin/profile', icon: <User size={20} />, label: 'Profil' },
];

const AdminLayout: React.FC = () => {
  return (
    <DashboardLayout navItems={adminNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminLayout;
