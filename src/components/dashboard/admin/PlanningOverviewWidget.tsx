import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const planningItems = [
  { type: 'Examen', name: 'Base de Données', date: '10 Jan 2026', time: '09:00 - 12:00', room: 'Amphi B' },
  { type: 'Cours', name: 'Réseaux', date: '12 Jan 2026', time: '14:00 - 16:00', room: 'Salle C103' },
  { type: 'Examen', name: 'Programmation Web', date: '15 Jan 2026', time: '10:00 - 13:00', room: 'Salle A205' },
];

const PlanningOverviewWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Aperçu Planification</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <ul className="space-y-4">
          {planningItems.map((item, index) => (
            <li key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {item.type === 'Cours' ? (
                  <BookOpen className="h-5 w-5 text-primary" />
                ) : (
                  <Calendar className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.date} | {item.time} | {item.room}
                </p>
              </div>
              <Badge variant={item.type === 'Examen' ? 'destructive' : 'default'}>
                {item.type}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PlanningOverviewWidget;
