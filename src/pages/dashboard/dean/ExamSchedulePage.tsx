import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const DeanExamSchedulePage: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emploi du Temps Global - Examens</CardTitle>
        <Button size="sm">
          <Download className="mr-2 h-4 w-4" />
          Télécharger l'emploi du temps
        </Button>
      </CardHeader>
      <CardContent>
        <p>Ici s'affichera l'emploi du temps de tous les examens.</p>
      </CardContent>
    </Card>
  );
};

export default DeanExamSchedulePage;
