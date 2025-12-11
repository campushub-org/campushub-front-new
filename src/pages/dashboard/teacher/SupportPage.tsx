import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Send, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from '@/lib/api';
import { decodeToken } from '@/lib/auth';


// Interface pour typer nos données
export interface Material {
  id: number;
  titre: string;
  matiere: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
}


const SupportPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentification requise.");
        setLoading(false);
        return;
      }
      
      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        setError("Impossible de récupérer les informations de l'utilisateur depuis le token.");
        setLoading(false);
        return;
      }
      
      const userId = decoded.id;

      try {
        const response = await api.get<Material[]>(`/campushub-support-service/api/supports/enseignant/${userId}`);
        setMaterials(response.data);
      } catch (err) {
        setError("Impossible de charger les supports de cours.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Fonction pour soumettre un support pour validation
  const handleSubmitForValidation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const originalMaterials = [...materials];
    const updatedMaterials = materials.map(material =>
      material.id === id ? { ...material, statut: 'SOUMIS' } : material
    );
    setMaterials(updatedMaterials);

    try {
      await api.post(`/campushub-support-service/api/supports/${id}/submit`);
    } catch (err) {
      console.error("Failed to submit material", err);
      setMaterials(originalMaterials);
    }
  };

  // Fonction pour supprimer un support
  const handleDeleteMaterial = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const originalMaterials = [...materials];
    const updatedMaterials = materials.filter(material => material.id !== id);
    setMaterials(updatedMaterials);
    
    try {
      await api.delete(`/campushub-support-service/api/supports/${id}`);
    } catch (err) {
      console.error("Failed to delete material", err);
      setMaterials(originalMaterials);
    }
  };

  const getStatusBadgeVariant = (status: Material['statut']) => {
    switch (status) {
      case 'VALIDÉ':
        return 'default';
      case 'BROUILLON':
        return 'outline';
      case 'SOUMIS':
        return 'secondary';
      case 'REJETÉ':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleViewMaterial = (id: number) => {
    navigate(`/dashboard/teacher/support/view/${id}`);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Supports de Cours</CardTitle>
          <Link to="/dashboard/teacher/deposit-material">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Déposer un support
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading && <p>Chargement des supports...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((item) => (
                <Card 
                  key={item.id} 
                  className="flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleViewMaterial(item.id)}
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex flex-col space-y-1">
                      <CardDescription>{item.matiere}</CardDescription>
                      <CardTitle className="text-lg">{item.titre}</CardTitle>
                    </div>
                    <Badge variant={getStatusBadgeVariant(item.statut)}>
                      {item.statut}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewMaterial(item.id); }}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualiser
                    </Button>
                    <div className="flex space-x-2">
                      {item.statut === 'BROUILLON' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={(e) => handleSubmitForValidation(e, item.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce brouillon ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le support "{item.titre}" sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => handleDeleteMaterial(e, item.id)}>
                                  Confirmer la suppression
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {item.statut === 'SOUMIS' && (
                        <span className="text-xs text-muted-foreground">En validation...</span>
                      )}
                      {item.statut === 'REJETÉ' && (
                        <span className="text-xs text-destructive">Rejeté</span>
                      )}
                      {item.statut === 'VALIDÉ' && (
                        <span className="text-xs text-green-600">Validé</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SupportPage;
