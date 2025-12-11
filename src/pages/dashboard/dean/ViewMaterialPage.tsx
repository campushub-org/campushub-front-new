import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <p className="text-muted-foreground">{material.description}</p>
        <div className="flex items-center space-x-4">
          <FileText className="h-6 w-6 text-blue-500" />
          <span>Fichier: {material.fichierUrl ? new URL(material.fichierUrl).pathname.split('/').pop() : 'N/A'}</span>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!material.fichierUrl}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
        <div className="text-sm">
          <span className="font-semibold">Statut:</span> <span className="text-green-600">{material.statut}</span>
        </div>
        
        {material.fichierUrl && (
          <div className="flex items-center justify-center">
            <iframe src={material.fichierUrl} width="100%" height="600px" style={{ border: 'none' }}>
              Ce navigateur ne prend pas en charge les PDF intégrés. Veuillez utiliser le bouton Télécharger pour visualiser le fichier.
            </iframe>
          </div>
        )}

        {material.statut === 'SOUMIS' && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="destructive" onClick={() => handleAction('reject', 'Rejeté par le doyen.')} disabled={actionLoading}>
              <X className="mr-2 h-4 w-4" />
              Rejeter
            </Button>
            <Button onClick={() => handleAction('validate')} disabled={actionLoading}>
              <Check className="mr-2 h-4 w-4" />
              Valider
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeanViewMaterialPage;