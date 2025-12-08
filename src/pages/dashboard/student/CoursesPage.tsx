import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
        <div className="flex space-x-4 mb-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="l1">Licence 1</SelectItem>
              <SelectItem value="l2">Licence 2</SelectItem>
              <SelectItem value="l3">Licence 3</SelectItem>
              <SelectItem value="m1">Master 1</SelectItem>
              <SelectItem value="m2">Master 2</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Informatique</SelectItem>
              <SelectItem value="maths">Mathématiques</SelectItem>
              <SelectItem value="physique">Physique</SelectItem>
              <SelectItem value="chimie">Chimie</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
