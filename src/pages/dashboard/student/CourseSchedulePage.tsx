import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const courseSchedule = [
  { day: 'Lundi', time: '08:00 - 10:00', course: 'Mathématiques I', room: 'Amphi A' },
  { day: 'Mardi', time: '10:00 - 12:00', course: 'Physique des Ondes', room: 'Salle B102' },
  { day: 'Mercredi', time: '14:00 - 16:00', course: 'Chimie Organique', room: 'Labo C1' },
  { day: 'Jeudi', time: '08:00 - 10:00', course: 'Mathématiques I', room: 'Salle A101' },
];

const CourseSchedulePage: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emploi du Temps - Cours</CardTitle>
        <Button size="sm">
          <Download className="mr-2 h-4 w-4" />
          Télécharger l'emploi du temps
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jour</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Cours</TableHead>
              <TableHead>Salle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseSchedule.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.day}</TableCell>
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

export default CourseSchedulePage;
