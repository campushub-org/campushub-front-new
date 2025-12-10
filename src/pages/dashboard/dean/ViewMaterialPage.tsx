import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Check, X, ArrowLeft } from 'lucide-react';

const DeanViewMaterialPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();

  // Simulation de la récupération des détails du support
  const materialDetails = {
    id: materialId,
    course: 'Algèbre I',
    title: 'Algèbre Linéaire - Chapitre 1',
    teacher: 'Dr. Dupont',
    status: 'En attente', // Pour le doyen, le statut est souvent "En attente" ou "Révision demandée"
    description: 'Ce document couvre les bases de l\'algèbre linéaire, y compris les vecteurs, les matrices et les transformations linéaires. Il a été soumis pour validation par le Dr. Dupont.',
    filePath: '/path/to/algebre_chap1.pdf', // Placeholder
  };

  if (!materialId) {
    return <Card><CardContent>Support non trouvé.</CardContent></Card>;
  }

  // Fonctions de simulation pour la validation
  const handleValidate = () => {
    alert(`Support ${materialDetails.id} validé.`);
    // Logique API ici pour changer le statut
  };

  const handleReject = () => {
    alert(`Support ${materialDetails.id} rejeté.`);
    // Logique API ici
  };

  const handleRequestRevision = () => {
    alert(`Révision demandée pour le support ${materialDetails.id}.`);
    // Logique API ici
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <CardTitle>Visualiser le Support : {materialDetails.title}</CardTitle>
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
        <div className="text-sm">
          <span className="font-semibold">Statut:</span> <span className="text-orange-600">{materialDetails.status}</span>
        </div>
        
        <div className="border rounded-md p-4 bg-gray-50 flex items-center justify-center h-64">
            <p className="text-muted-foreground">Zone d\'affichage du contenu du support (ex: Aperçu PDF)</p>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="destructive" onClick={handleReject}>
            <X className="mr-2 h-4 w-4" />
            Rejeter
          </Button>
          <Button variant="outline" onClick={handleRequestRevision}>
            <FileText className="mr-2 h-4 w-4" />
            Demander Révision
          </Button>
          <Button onClick={handleValidate}>
            <Check className="mr-2 h-4 w-4" />
            Valider
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeanViewMaterialPage;
