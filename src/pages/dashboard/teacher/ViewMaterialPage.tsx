import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ArrowLeft, Calendar, FileText, MessageSquare } from 'lucide-react';
import api from '@/lib/api';

// Interface complète pour les détails d'un support de cours
export interface SupportCours {
  id: number;
  titre: string;
  description: string;
  matiere: string;
  niveau: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  fichierUrl: string;
  dateDepot: string;
  dateValidation?: string;
  remarqueDoyen?: string;
}

const ViewMaterialPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<SupportCours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!materialId) {
        setError("Identifiant de support manquant.");
        setLoading(false);
        return;
      }
      try {
        const response = await api.get<SupportCours>(`/campushub-support-service/api/supports/${materialId}`);
        setMaterial(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement du support:', err);
        setError("Impossible de charger le support de cours.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);

  const getStatusBadgeVariant = (status: SupportCours['statut']) => {
    switch (status) {
      case 'VALIDÉ': return 'default';
      case 'BROUILLON': return 'outline';
      case 'SOUMIS': return 'secondary';
      case 'REJETÉ': return 'destructive';
      default: return 'outline';
    }
  };

  const handleDownload = () => {
    if (material?.fichierUrl) {
      window.open(material.fichierUrl, '_blank');
    }
  };
  
  if (loading) return <div className="p-4">Chargement du support...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!material) return <div className="p-4">Support non trouvé.</div>;

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" className="mr-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Détails du Support de Cours</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        {/* Colonne de gauche pour les détails */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{material.titre}</CardTitle>
              <CardDescription>{material.matiere} - {material.niveau}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Statut</span>
                  <Badge variant={getStatusBadgeVariant(material.statut)}>{material.statut}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Déposé le</span>
                  <span className="text-sm">{new Date(material.dateDepot).toLocaleDateString()}</span>
                </div>
                {material.statut === 'VALIDÉ' && material.dateValidation && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Validé le</span>
                    <span className="text-sm">{new Date(material.dateValidation).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{material.description || "Aucune description fournie."}</p>
              </div>
            </CardContent>
          </Card>
          
          {(material.statut === 'VALIDÉ' || material.statut === 'REJETÉ') && material.remarqueDoyen && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><MessageSquare className="mr-2 h-5 w-5" /> Remarques du Doyen</CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
                  {material.remarqueDoyen}
                </blockquote>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne de droite pour la visualisation */}
        <div className="lg:col-span-2 space-y-4">
           <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" /> Prévisualisation</CardTitle>
            </CardHeader>
            <CardContent>
              {material.fichierUrl ? (
                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-9 bg-slate-100 rounded-md overflow-hidden">
                     <iframe 
                        src={material.fichierUrl} 
                        className="w-full h-[60vh] border-0"
                        title={`Prévisualisation de ${material.titre}`}
                      >
                     </iframe>
                  </div>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le fichier
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucun fichier à prévisualiser.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewMaterialPage;
