import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, CheckSquare, CalendarDays, Upload, Bell, FileUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DeanLayout: React.FC = () => {
  const { t } = useTranslation();

  const deanNavItems: NavItem[] = [
    { to: '/dashboard/dean', icon: <LayoutDashboard size={20} />, label: t("dean.sidebar.dashboard") },
    { to: '/dashboard/dean/validations', icon: <CheckSquare size={20} />, label: t("dean.sidebar.validations") },
    { to: '/dashboard/dean/schedule', icon: <CalendarDays size={20} />, label: t("dean.sidebar.schedule") },
    { to: '/dashboard/dean/timetable-upload', icon: <Upload size={20} />, label: t("dean.sidebar.edition") },
    { to: '/dashboard/dean/import', icon: <FileUp size="{20}"/>, label: 'Import de données' },
  ];

  return (
    <DashboardLayout navItems={deanNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default DeanLayout;
