import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, FileDown } from 'lucide-react';

const materialsToValidate = [
  { course: 'Algèbre I', teacher: 'Dr. Dupont', date: '01 Déc 2025', title: 'Algèbre Linéaire - Chap. 1' },
  { course: 'Analyse II', teacher: 'Pr. Martin', date: '02 Déc 2025', title: 'Calcul Différentiel' },
  { course: 'Physique Quantique', teacher: 'Dr. Lefevre', date: '28 Nov 2025', title: 'Notes de cours - Mécanique Quantique' },
];

const ValidationPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation des Supports de Cours</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cours</TableHead>
              <TableHead>Enseignant</TableHead>
              <TableHead>Titre du Support</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materialsToValidate.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.course}</TableCell>
                <TableCell>{item.teacher}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <X className="h-4 w-4" />
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

export default ValidationPage;
