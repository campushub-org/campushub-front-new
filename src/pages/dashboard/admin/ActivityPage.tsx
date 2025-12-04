import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const recentActivity = [
  { user: 'Dr. Dupont', role: 'Enseignant', action: 'Dépôt du support "Algèbre - Chap. 3"', date: 'il y a 5 min' },
  { user: 'etudiant01', role: 'Étudiant', action: 'Téléchargement du support "Physique - TP 2"', date: 'il y a 15 min' },
  { user: 'Doyen', role: 'Doyen', action: 'Validation du support "Chimie - Cours 5"', date: 'il y a 1h' },
  { user: 'admin', role: 'Admin', action: 'Création de l\'utilisateur "etudiant02"', date: 'il y a 3h' },
];

const ActivityPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi de l'Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivity.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.user}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.role}</Badge>
                </TableCell>
                <TableCell>{item.action}</TableCell>
                <TableCell className="text-right">{item.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ActivityPage;
