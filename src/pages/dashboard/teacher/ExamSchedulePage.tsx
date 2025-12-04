import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Edit } from 'lucide-react';

const teacherExamSchedule = [
  { date: '15 Déc 2025', time: '10:00 - 12:00', course: 'Mathématiques I', room: 'Amphi A', supervision: 'Oui' },
  { date: '17 Déc 2025', time: '14:00 - 16:00', course: 'Physique des Ondes', room: 'Salle B203', supervision: 'Non' },
  { date: '19 Déc 2025', time: '09:00 - 11:00', course: 'Informatique', room: 'Salle C305', supervision: 'Oui' },
];

const TeacherExamSchedulePage: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emploi du Temps - Mes Examens</CardTitle>
        <div className="flex space-x-2">
            <Button size="sm" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Modifier
            </Button>
            <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Salle</TableHead>
              <TableHead className="text-center">Surveillance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teacherExamSchedule.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.date}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.course}</TableCell>
                <TableCell>{item.room}</TableCell>
                <TableCell className="text-center">{item.supervision}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeacherExamSchedulePage;
