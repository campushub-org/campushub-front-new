import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Nouvel import
import { Badge } from '@/components/ui/badge';       // Nouvel import
import { FileText, Download, Check, X, ArrowLeft } from 'lucide-react';
import api from '@/lib/api'; // Import your API utility
import { SupportCours } from '../teacher/SupportPage'; // Use SupportCours interface for consistency
import { toast } from 'sonner';
import { decodeToken } from '@/lib/auth';

const DeanViewMaterialPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<SupportCours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [doyenRemarque, setDoyenRemarque] = useState<string>(''); // Nouvel état pour la remarque

  const getStatusBadgeVariant = (status: SupportCours['statut']) => {
    switch (status) {
      case 'VALIDÉ':
        return 'default';
      case 'BROUILLON':
      case 'SOUMIS':
        return 'secondary';
      case 'REJETÉ':
        return 'destructive';
      default:
        return 'outline';
    }
  };

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
        if (response.data.remarqueDoyen) {
            setDoyenRemarque(response.data.remarqueDoyen); // Pré-remplir si déjà existant
        }
      } catch (err) {
        console.error('Erreur lors du chargement du support:', err);
        setError("Impossible de charger le support de cours.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);

  if (loading) {
    return <Card><CardContent>Chargement du support...</CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent className="text-red-500">{error}</CardContent></Card>;
  }

  if (!material) {
    return <Card><CardContent>Support non trouvé.</CardContent></Card>;
  }

  const handleDownload = () => {
    if (material?.fichierUrl) {
      window.open(material.fichierUrl, '_blank');
    }
  };

  const handleAction = async (action: 'validate' | 'reject', remarque?: string) => {
    setActionLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Authentification requise pour cette action.");
        setActionLoading(false);
        return;
    }

    try {
      await api.post(`/campushub-support-service/api/supports/${material.id}/${action}`, { remarque }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Support ${action === 'validate' ? 'validé' : 'rejeté'} avec succès !`);
      navigate('/dashboard/dean/validations'); // Navigate back to validation list
    } catch (err) {
      console.error(`Erreur lors de l'action ${action} sur le support:`, err);
      toast.error(`Échec de l'action sur le support. Veuillez réessayer.`);
    } finally {
      setActionLoading(false);
    }
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
                    <CardTitle>Visualiser le Support : {material.titre}</CardTitle>
                    <CardDescription>{material.matiere} (Niveau {material.niveau})</CardDescription>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Détails du Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-semibold">Description:</span> <p className="text-muted-foreground">{material.description}</p></div>
            <div><span className="font-semibold">Matière:</span> <span className="text-muted-foreground">{material.matiere}</span></div>
            <div><span className="font-semibold">Niveau:</span> <span className="text-muted-foreground">{material.niveau}</span></div>
            <div><span className="font-semibold">Date de dépôt:</span> <span className="text-muted-foreground">{new Date(material.dateDepot).toLocaleDateString()}</span></div>
            <div><span className="font-semibold">Statut:</span> <Badge variant={getStatusBadgeVariant(material.statut)}>{material.statut}</Badge></div>
            {material.dateValidation && <div><span className="font-semibold">Date de validation:</span> <span className="text-muted-foreground">{new Date(material.dateValidation).toLocaleDateString()}</span></div>}
        </div>

        {/* Fichier et Téléchargement */}
        <div className="flex items-center space-x-4">
          <FileText className="h-6 w-6 text-blue-500" />
          <span>Fichier: {material.fichierUrl ? new URL(material.fichierUrl).pathname.split('/').pop() : 'N/A'}</span>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!material.fichierUrl}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
        
        {/* Section Remarque du Doyen et Actions */}
        {material.statut === 'SOUMIS' && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Remarque du Doyen</h3>
            <Textarea
              placeholder="Ajouter une remarque pour l'enseignant (optionnel pour validation, requis pour rejet)."
              value={doyenRemarque}
              onChange={(e) => setDoyenRemarque(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="destructive" onClick={() => handleAction('reject', doyenRemarque)} disabled={actionLoading || doyenRemarque.trim() === ''}> {/* Remarque requise pour rejet */}
                <X className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
              <Button onClick={() => handleAction('validate', doyenRemarque)} disabled={actionLoading}>
                <Check className="mr-2 h-4 w-4" />
                Valider
              </Button>
            </div>
          </div>
        )}

        {material.remarqueDoyen && material.statut !== 'SOUMIS' && (
            <div className="space-y-2 pt-4">
                <h3 className="text-lg font-semibold">Remarque du Doyen (Historique)</h3>
                <p className="text-muted-foreground italic">{material.remarqueDoyen}</p>
            </div>
        )}

        {material.fichierUrl && (
          <div className="flex items-center justify-center pt-4">
            <iframe src={material.fichierUrl} width="100%" height="600px" style={{ border: 'none' }}>
              Ce navigateur ne prend pas en charge les PDF intégrés. Veuillez utiliser le bouton Télécharger pour visualiser le fichier.
            </iframe>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeanViewMaterialPage;