import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

const ViewMaterialPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();

  // Simulation de la récupération des détails du support
  const materialDetails = {
    id: materialId,
    course: 'Mathématiques I',
    title: 'Algèbre Linéaire - Chapitre 1',
    teacher: 'Dr. Jean Dupont',
    status: 'Validé',
    description: 'Ce document couvre les bases de l\'algèbre linéaire, y compris les vecteurs, les matrices et les transformations linéaires. Idéal pour les étudiants en première année de licence.',
    filePath: '/path/to/algebre_chap1.pdf', // Placeholder
  };

  if (!materialId) {
    return <Card><CardContent>Support non trouvé.</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualiser le Support : {materialDetails.title}</CardTitle>
        <CardDescription>{materialDetails.course} par {materialDetails.teacher}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{materialDetails.description}</p>
        <div className="flex items-center space-x-4">
          <FileText className="h-6 w-6 text-blue-500" />
          <span>Fichier: algebre_chap1.pdf</span>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
        <div className="text-sm">
          <span className="font-semibold">Statut:</span> <span className="text-green-600">{materialDetails.status}</span>
        </div>
        {/* Ici, on pourrait intégrer un visualiseur de PDF ou d'autres contenus */}
        <div className="border rounded-md p-4 bg-gray-50 flex items-center justify-center h-64">
            <p className="text-muted-foreground">Zone d'affichage du contenu du support (ex: Aperçu PDF)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewMaterialPage;
