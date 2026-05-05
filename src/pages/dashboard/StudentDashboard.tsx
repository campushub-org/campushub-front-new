import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Trophy,
  Activity,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

// Widgets for Student Dashboard
import UpcomingExamsWidget from '@/components/dashboard/student/UpcomingExamsWidget';
import OverallProgressWidget from '@/components/dashboard/student/OverallProgressWidget';
import QuickInfoWidget from '@/components/dashboard/student/QuickInfoWidget';

const StatsCard = ({ title, value, icon: Icon, description, color }: any) => (
  <Card className="overflow-hidden transition-all hover:shadow-md border-border/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
    </CardContent>
  </Card>
);

const StudentDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("student.welcome")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("student.subtitle")}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title={t("student.stats.courses")} 
          value="6" 
          icon={BookOpen} 
          description={t("student.stats.courses_desc")}
          color="bg-blue-100 text-blue-600"
        />
        <StatsCard 
          title={t("student.stats.gpa")} 
          value="14.5" 
          icon={Trophy} 
          description={t("student.stats.gpa_desc")}
          color="bg-amber-100 text-amber-600"
        />
        <StatsCard 
          title={t("student.stats.attendance")} 
          value="95%" 
          icon={Activity} 
          description={t("student.stats.attendance_desc")}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatsCard 
          title={t("student.stats.exams")} 
          value="3" 
          icon={Calendar} 
          description={t("student.stats.exams_desc")}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-4 space-y-6">
          <UpcomingExamsWidget />
          <QuickInfoWidget />
        </div>

        {/* Sidebar Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <OverallProgressWidget />
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{t("student.quick_access.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <button className="flex items-center gap-3 w-full p-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left">
                <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                {t("student.quick_access.view_materials")}
              </button>
              <button className="flex items-center gap-3 w-full p-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left">
                <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                {t("student.quick_access.view_schedule")}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
