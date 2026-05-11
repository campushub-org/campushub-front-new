import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { NavItem } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, BookOpen, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StudentLayout: React.FC = () => {
  const { t } = useTranslation();

  const studentNavItems: NavItem[] = [
    { to: '/dashboard/student', icon: <LayoutDashboard size={20} />, label: t("common.dashboard") },
    { to: '/dashboard/student/courses', icon: <BookOpen size={20} />, label: t("academic.materials") },
    { to: '/dashboard/student/schedule-courses', icon: <CalendarDays size={20} />, label: `${t("academic.schedule")} - ${t("academic.courses")}` },
    { to: '/dashboard/student/schedule-exams', icon: <CalendarDays size={20} />, label: `${t("academic.schedule")} - ${t("academic.exams")}` },
  ];

  return (
    <DashboardLayout navItems={studentNavItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentLayout;
