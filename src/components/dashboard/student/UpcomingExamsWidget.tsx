import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';

const exams = [
  {
    subject: 'Mathématiques',
    date: '15 Déc 2025',
    time: '10:00 - 12:00',
    room: 'Salle A101',
  },
  {
    subject: 'Physique',
    date: '17 Déc 2025',
    time: '14:00 - 16:00',
    room: 'Salle B203',
  },
  {
    subject: 'Informatique',
    date: '19 Déc 2025',
    time: '09:00 - 11:00',
    room: 'Salle C305',
  },
];

const UpcomingExamsWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Examens à Venir</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {exams.map((exam) => (
            <li key={exam.subject} className="flex items-start space-x-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{exam.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {exam.date} | {exam.time}
                </p>
              </div>
              <Badge variant="outline">{exam.room}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UpcomingExamsWidget;
