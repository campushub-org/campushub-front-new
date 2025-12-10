import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ArrowLeft } from 'lucide-react';

const StudentViewMaterialPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();

  // Simulation de la récupération des détails du support
  const materialDetails = {
    id: materialId,
    course: 'Mathématiques I',
    title: 'Algèbre Linéaire - Chap. 1',
    teacher: 'Dr. Jean Dupont',
    description: 'Ce document couvre les bases de l\'algèbre linéaire, y compris les vecteurs, les matrices et les transformations linéaires.',
    filePath: '/path/to/algebre_chap1.pdf', // Placeholder
  };

  if (!materialId) {
    return <Card><CardContent>Support non trouvé.</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <CardTitle>{materialDetails.title}</CardTitle>
                    <CardDescription>{materialDetails.course} par {materialDetails.teacher}</CardDescription>
                </div>
            </div>
        </div>
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
        <div className="border rounded-md p-4 bg-gray-50 flex items-center justify-center h-96">
            <p className="text-muted-foreground">Zone d\'affichage du contenu du support (ex: Aperçu PDF)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentViewMaterialPage;
