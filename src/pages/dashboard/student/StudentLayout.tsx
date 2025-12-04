import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, BookOpen, CalendarDays, Bell, User } from 'lucide-react';

const studentNavItems: NavItem[] = [
  { to: '/dashboard/student', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
  { to: '/dashboard/student/courses', icon: <BookOpen size={20} />, label: 'Supports de cours' },
  { to: '/dashboard/student/schedule-courses', icon: <CalendarDays size={20} />, label: 'Emploi du temps - Cours' },
  { to: '/dashboard/student/schedule-exams', icon: <CalendarDays size={20} />, label: 'Emploi du temps - Examens' },
  { to: '/dashboard/student/notifications', icon: <Bell size={20} />, label: 'Notifications' },
  { to: '/dashboard/student/profile', icon: <User size={20} />, label: 'Profil' },
];

const StudentLayout: React.FC = () => {
  return (
    <DashboardLayout navItems={studentNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentLayout;
