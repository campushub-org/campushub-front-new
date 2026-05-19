import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const DeanReportsWidget: React.FC = () => {
  const { t } = useTranslation();

  const reports = [
    { name: t("dean.dashboard.widgets.reports.list.annual_validation"), icon: <FileText className="h-5 w-5" />, action: t("dean.dashboard.widgets.reports.actions.generate") },
    { name: t("dean.dashboard.widgets.reports.list.student_attendance"), icon: <BarChart2 className="h-5 w-5" />, action: t("dean.dashboard.widgets.reports.actions.view") },
    { name: t("dean.dashboard.widgets.reports.list.planning_conflicts"), icon: <FileText className="h-5 w-5" />, action: t("dean.dashboard.widgets.reports.actions.download") },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t("dean.dashboard.widgets.reports.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {reports.map((report, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center space-x-3">
              {report.icon}
              <span className="font-medium">{report.name}</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> {report.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DeanReportsWidget;