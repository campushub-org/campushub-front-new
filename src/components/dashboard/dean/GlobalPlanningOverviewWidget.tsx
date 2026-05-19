import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, AlertTriangle, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const GlobalPlanningOverviewWidget: React.FC = () => {
  const { t, i18n } = useTranslation();

  const planningStats = [
    { icon: <CalendarCheck className="h-6 w-6 text-blue-500" />, label: t("dean.dashboard.widgets.planning.stats.planned_exams"), value: '50' },
    { icon: <BookOpen className="h-6 w-6 text-green-500" />, label: t("dean.dashboard.widgets.planning.stats.active_courses"), value: '120' },
    { icon: <AlertTriangle className="h-6 w-6 text-red-500" />, label: t("dean.dashboard.widgets.planning.stats.potential_conflicts"), value: '3' },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t("dean.dashboard.widgets.planning.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {planningStats.map((item, index) => (
          <div key={index} className="flex items-center space-x-4 rounded-md border p-4">
            {item.icon}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
        <div className="lg:col-span-3 mt-4">
            <h3 className="text-md font-semibold mb-2">{t("dean.dashboard.widgets.planning.upcoming.title")}</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span>{t("dean.dashboard.widgets.planning.upcoming.list.timetable_validation")}</span>
                    <Badge variant="secondary">15 {i18n.language === 'fr' ? 'Déc' : 'Dec'} 2025</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span>{t("dean.dashboard.widgets.planning.upcoming.list.exam_registration_closure")}</span>
                    <Badge variant="secondary">05 {i18n.language === 'fr' ? 'Jan' : 'Jan'} 2026</Badge>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalPlanningOverviewWidget;