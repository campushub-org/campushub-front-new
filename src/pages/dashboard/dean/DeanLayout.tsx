import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, CheckSquare, CalendarDays, Upload, Bell } from 'lucide-react';

const deanNavItems: NavItem[] = [
  { to: '/dashboard/dean', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
  { to: '/dashboard/dean/validations', icon: <CheckSquare size={20} />, label: 'Validation Supports' },

  { to: '/dashboard/dean/schedule', icon: <CalendarDays size={20} />, label: 'Planning Global' },
  { to: '/dashboard/dean/timetable-upload', icon: <Upload size={20} />, label: 'Édition' },
];

const DeanLayout: React.FC = () => {
  return (
    <DashboardLayout navItems={deanNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default DeanLayout;
