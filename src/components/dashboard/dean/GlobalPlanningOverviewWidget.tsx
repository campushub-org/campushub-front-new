import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, AlertTriangle, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const planningStats = [
  { icon: <CalendarCheck className="h-6 w-6 text-blue-500" />, label: 'Examens Planifiés', value: '50' },
  { icon: <BookOpen className="h-6 w-6 text-green-500" />, label: 'Cours Actifs', value: '120' },
  { icon: <AlertTriangle className="h-6 w-6 text-red-500" />, label: 'Conflits Potentiels', value: '3' },
];

const GlobalPlanningOverviewWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Aperçu Planification Globale</CardTitle>
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
            <h3 className="text-md font-semibold mb-2">Prochaines Échéances</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span>Validation Emploi du Temps Sem. 2</span>
                    <Badge variant="secondary">15 Déc 2025</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span>Clôture des inscriptions examens</span>
                    <Badge variant="secondary">05 Jan 2026</Badge>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalPlanningOverviewWidget;
