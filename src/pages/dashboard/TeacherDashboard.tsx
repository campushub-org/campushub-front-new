import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

// Widgets for Teacher Dashboard
import CourseMaterialsWidget from '@/components/dashboard/teacher/CourseMaterialsWidget';
import TeacherScheduleWidget from '@/components/dashboard/teacher/TeacherScheduleWidget';
import ValidationStatusWidget from '@/components/dashboard/teacher/ValidationStatusWidget';
import DepositMaterialDrawer from '@/components/dashboard/teacher/DepositMaterialDrawer';

const StatsCard = ({ title, value, icon: Icon, description, trend }: any) => (
  <Card className="overflow-hidden transition-all hover:shadow-md border-border/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        {trend && <TrendingUp className="h-3 w-3 text-emerald-500" />}
        {description}
      </p>
    </CardContent>
  </Card>
);

const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('teacher.dashboard.welcome')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('teacher.dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title={t('teacher.dashboard.stats.materials')} 
          value="12" 
          icon={BookOpen} 
          description={t('teacher.dashboard.stats.weekly_trend', { count: 2 })} 
          trend={true}
        />
        <StatsCard 
          title={t('teacher.dashboard.stats.upcoming_courses')} 
          value="4" 
          icon={Clock} 
          description={t('teacher.dashboard.stats.today')} 
        />
        <StatsCard 
          title={t('teacher.dashboard.stats.validated')} 
          value="8" 
          icon={CheckCircle2} 
          description={t('teacher.dashboard.stats.success_rate', { percent: 92 })} 
        />
        <StatsCard 
          title={t('teacher.dashboard.stats.pending')} 
          value="3" 
          icon={AlertCircle} 
          description={t('teacher.dashboard.stats.attention_required')} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-4 space-y-6">
          <CourseMaterialsWidget />
          <ValidationStatusWidget />
        </div>

        {/* Sidebar Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <TeacherScheduleWidget />
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{t('teacher.dashboard.quick_actions.title')}</CardTitle>
              <CardDescription>{t('teacher.dashboard.quick_actions.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <button 
                onClick={() => setIsDepositDrawerOpen(true)}
                className="flex items-center gap-3 w-full p-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left"
              >
                <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                {t('teacher.dashboard.quick_actions.deposit')}
              </button>
              <button className="flex items-center gap-3 w-full p-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left">
                <div className="h-8 w-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                {t('teacher.dashboard.quick_actions.availability')}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drawers */}
      <DepositMaterialDrawer 
        open={isDepositDrawerOpen} 
        onOpenChange={setIsDepositDrawerOpen}
        onSuccess={() => {
          // You could refresh data here if needed
          console.log("Upload success, refreshing data...");
        }}
      />
    </div>
  );
};

export default TeacherDashboard;

