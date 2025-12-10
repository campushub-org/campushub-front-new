import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, CheckSquare, CalendarDays, Upload } from 'lucide-react';

const deanNavItems: NavItem[] = [
  { to: '/dashboard/dean', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
  { to: '/dashboard/dean/validations', icon: <CheckSquare size={20} />, label: 'Validation Supports' },
  { to: '/dashboard/dean/timetable-upload', icon: <Upload size={20} />, label: 'Emplois de temps' },
  { to: '/dashboard/dean/schedule-courses', icon: <CalendarDays size={20} />, label: 'Emploi du temps - Cours' },
  { to: '/dashboard/dean/schedule-exams', icon: <CalendarDays size={20} />, label: 'Emploi du temps - Examens' },
];

const DeanLayout: React.FC = () => {
  return (
    <DashboardLayout navItems={deanNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default DeanLayout;
