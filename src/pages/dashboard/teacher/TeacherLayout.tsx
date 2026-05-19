import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
<<<<<<< HEAD
import { LayoutDashboard, BookOpen, CalendarDays, CalendarCheck } from 'lucide-react';
=======
import { LayoutDashboard, BookOpen, CalendarDays, Clock } from 'lucide-react';
>>>>>>> 1a26bd7a9e6b1db4839011cdc36523b46c44cd23
import { useTranslation } from 'react-i18next';

const TeacherLayout: React.FC = () => {
  const { t } = useTranslation();
<<<<<<< HEAD
=======

>>>>>>> 1a26bd7a9e6b1db4839011cdc36523b46c44cd23
  const teacherNavItems: NavItem[] = [
    { to: '/dashboard/teacher', icon: <LayoutDashboard size={20} />, label: t('common.dashboard') },
    { to: '/dashboard/teacher/support', icon: <BookOpen size={20} />, label: t('academic.materials') },
    { to: '/dashboard/teacher/schedule-unified', icon: <CalendarDays size={20} />, label: t('academic.schedule') },
<<<<<<< HEAD
    { to: '/dashboard/teacher/my-reservations', icon: <CalendarCheck size={20} />, label: "Mes réservations" },
  ];
=======
  ];

>>>>>>> 1a26bd7a9e6b1db4839011cdc36523b46c44cd23
  return (
    <DashboardLayout navItems={teacherNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

<<<<<<< HEAD
export default TeacherLayout;
=======
export default TeacherLayout;

>>>>>>> 1a26bd7a9e6b1db4839011cdc36523b46c44cd23
