import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const materials = [
  { course: 'Mathématiques I', title: 'Algèbre Linéaire - Chap. 1', status: 'Validé' },
  { course: 'Physique des Ondes', title: 'Cours Electromagnétisme', status: 'En attente' },
  { course: 'Programmation Avancée', title: 'TP React - Intro', status: 'Rejeté' },
  { course: 'Chimie Organique', title: 'Réactions Acido-Basiques', status: 'Validé' },
];

const CourseMaterialsWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Mes Supports de Cours</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Cours</TableHead>
              <TableHead>Titre du Support</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.course}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <FileText size={16} /> {item.title}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={
                    item.status === 'Validé' ? 'default' :
                    item.status === 'En attente' ? 'secondary' : 'destructive'
                  }>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CourseMaterialsWidget;
