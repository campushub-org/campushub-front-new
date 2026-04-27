import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, BookOpen, CalendarDays, Search, Clock } from 'lucide-react';


const teacherNavItems: NavItem[] = [
  { to: '/dashboard/teacher', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
  { to: '/dashboard/teacher/support', icon: <BookOpen size={20} />, label: 'Support' },
  { to: '/dashboard/teacher/schedule-unified', icon: <CalendarDays size={20} />, label: 'Mon Planning Unifié' },
  { to: '/dashboard/teacher/schedule-exams', icon: <CalendarDays size={20} />, label: 'Emploi du temps - Examens' },
  { to: '/dashboard/teacher/schedule-filter', icon: <Search size={20} />, label: 'Filtrage du planning par ressource' },

];

const TeacherLayout: React.FC = () => {
  return (
    <DashboardLayout navItems={teacherNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default TeacherLayout;
