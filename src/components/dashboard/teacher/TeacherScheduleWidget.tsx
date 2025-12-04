import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, BookOpen, Clock } from 'lucide-react';

const scheduleItems = [
  {
    type: 'Cours',
    name: 'Base de Données',
    date: '05 Jan 2026',
    time: '09:00 - 12:00',
    room: 'Amphi A',
    details: 'Cours Magistral',
  },
  {
    type: 'Examen',
    name: 'Algorithmique II',
    date: '10 Jan 2026',
    time: '14:00 - 16:00',
    room: 'Salle C201',
    details: 'Surveillance Examen',
  },
  {
    type: 'Cours',
    name: 'Développement Web',
    date: '12 Jan 2026',
    time: '10:00 - 13:00',
    room: 'Salle B102',
    details: 'Travaux Pratiques',
  },
];

const TeacherScheduleWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Mon Emploi du Temps / Examens</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <ul className="space-y-4">
          {scheduleItems.map((item, index) => (
            <li key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {item.type === 'Cours' ? (
                  <BookOpen className="h-5 w-5 text-primary" />
                ) : (
                  <CalendarIcon className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.date} | {item.time} | {item.room}
                </p>
                <Badge variant="outline" className="mt-1">{item.details}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TeacherScheduleWidget;
