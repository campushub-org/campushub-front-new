import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock } from 'lucide-react';

const materialsToValidate = [
  { course: 'Algèbre I', teacher: 'Dr. Dupont', date: '01 Déc 2025', status: 'En attente' },
  { course: 'Analyse II', teacher: 'Pr. Martin', date: '02 Déc 2025', status: 'En attente' },
  { course: 'Physique Quantique', teacher: 'Dr. Lefevre', date: '28 Nov 2025', status: 'En attente' },
];

const MaterialsToValidateWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Supports à Valider</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cours</TableHead>
              <TableHead>Enseignant</TableHead>
              <TableHead className="text-center">Date Soumission</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materialsToValidate.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.course}</TableCell>
                <TableCell>{item.teacher}</TableCell>
                <TableCell className="text-center flex items-center justify-center gap-1">
                  <Clock size={16} className="inline" /> {item.date}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{item.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MaterialsToValidateWidget;
