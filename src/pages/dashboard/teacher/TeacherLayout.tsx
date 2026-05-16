import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, BookOpen, CalendarDays, CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TeacherLayout: React.FC = () => {
  const { t } = useTranslation();
  const teacherNavItems: NavItem[] = [
    { to: '/dashboard/teacher', icon: <LayoutDashboard size={20} />, label: t('common.dashboard') },
    { to: '/dashboard/teacher/support', icon: <BookOpen size={20} />, label: t('academic.materials') },
    { to: '/dashboard/teacher/schedule-unified', icon: <CalendarDays size={20} />, label: t('academic.schedule') },
    { to: '/dashboard/teacher/my-reservations', icon: <CalendarCheck size={20} />, label: "Mes réservations" },
  ];
  return (
    <DashboardLayout navItems={teacherNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default TeacherLayout;