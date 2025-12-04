import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';

const examSchedule = [
  { date: '15 Déc 2025', time: '10:00 - 12:00', course: 'Mathématiques I', room: 'Amphi A' },
  { date: '17 Déc 2025', time: '14:00 - 16:00', course: 'Physique des Ondes', room: 'Salle B203' },
  { date: '19 Déc 2025', time: '09:00 - 11:00', course: 'Informatique', room: 'Salle C305' },
];

const ExamSchedulePage: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emploi du Temps - Examens</CardTitle>
        <Button size="sm">
          <Download className="mr-2 h-4 w-4" />
          Télécharger l'emploi du temps
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Salle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examSchedule.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.date}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.course}</TableCell>
                <TableCell>{item.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExamSchedulePage;
