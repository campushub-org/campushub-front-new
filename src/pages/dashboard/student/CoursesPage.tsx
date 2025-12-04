import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const validatedCourses = [
  { course: 'Mathématiques I', title: 'Algèbre Linéaire - Chap. 1', date: '25 Nov 2025' },
  { course: 'Mathématiques I', title: 'Algèbre Linéaire - Chap. 2', date: '01 Déc 2025' },
  { course: 'Chimie Organique', title: 'Réactions Acido-Basiques', date: '28 Nov 2025' },
  { course: 'Physique des Ondes', title: 'Notes de cours - Ondes', date: '30 Nov 2025' },
];

const CoursesPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supports de Cours Validés</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Cours</TableHead>
              <TableHead>Titre du Support</TableHead>
              <TableHead>Date de publication</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validatedCourses.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.course}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CoursesPage;
