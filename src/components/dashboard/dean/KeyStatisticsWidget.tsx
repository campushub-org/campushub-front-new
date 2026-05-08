import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building, Users } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

const KeyStatisticsWidget: React.FC = () => {
  const { t } = useTranslation();

  const statsData = [
    { name: t("dean.dashboard.widgets.stats.chart.validated"), value: 85 },
    { name: t("dean.dashboard.widgets.stats.chart.pending"), value: 15 },
    { name: t("dean.dashboard.widgets.stats.chart.rejected"), value: 5 },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t("dean.dashboard.widgets.stats.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">{t("dean.dashboard.widgets.stats.validated_courses")}</p>
              <p className="text-xl font-bold">120</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">{t("dean.dashboard.widgets.stats.room_occupancy")}</p>
              <p className="text-xl font-bold">75%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">{t("dean.dashboard.widgets.stats.active_teachers")}</p>
              <p className="text-xl font-bold">80</p>
            </div>
          </div>
        </div>

        <h3 className="text-md font-semibold mb-2">{t("dean.dashboard.widgets.stats.materials_status")}</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={statsData}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default KeyStatisticsWidget;