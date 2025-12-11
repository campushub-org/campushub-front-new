import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { decodeToken } from '@/lib/auth';
import { toast } from 'sonner';

// Interface pour typer nos données
export interface SupportCours {
  id: number;
  titre: string;
  description: string;
  fichierUrl: string;
  niveau: 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
  matiere: string;
  enseignantId: number;
  dateDepot: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  dateValidation?: string;
  remarqueDoyen?: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  department: string;
  // Add other user fields as needed
}

const ValidationPage: React.FC = () => {
  const [pendingSupports, setPendingSupports] = useState<SupportCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deanDepartment, setDeanDepartment] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch Dean's department
  useEffect(() => {
    const fetchDeanProfile = async () => {
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
        const response = await api.get<UserProfile>(`/campushub-user-service/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDeanDepartment(response.data.department);
      } catch (err) {
        console.error('Error fetching dean profile:', err);
        setError("Impossible de charger le profil du doyen.");
      }
    };
    fetchDeanProfile();
  }, []);

  // Fetch pending supports
  useEffect(() => {
    const fetchPendingSupports = async () => {
      if (!deanDepartment) { // Wait for dean's department to be fetched
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<SupportCours[]>('/campushub-support-service/api/supports/pending');
        // Filter by dean's department
        const filteredSupports = response.data.filter(support => support.matiere === deanDepartment); // Assuming matiere directly maps to department or a similar logic
        setPendingSupports(filteredSupports);
      } catch (err) {
        console.error('Error fetching pending supports:', err);
        setError("Impossible de charger les supports en attente.");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingSupports();
  }, [deanDepartment]); // Re-fetch when deanDepartment changes

  const handleAction = async (id: number, action: 'validate' | 'reject', remarque?: string) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      await api.post(`/campushub-support-service/api/supports/${id}/${action}`, { remarque }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingSupports(prevSupports => prevSupports.filter(support => support.id !== id));
      toast.success(`Support ${action === 'validate' ? 'validé' : 'rejeté'} avec succès !`);
    } catch (err) {
      console.error(`Erreur lors de l'action ${action} sur le support:`, err);
      setError(`Erreur lors de l'action. Veuillez réessayer.`);
      toast.error(`Échec de l'action sur le support.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: SupportCours['statut']) => {
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
    navigate(`/dashboard/dean/view-material/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation des Supports de Cours</CardTitle>
        {deanDepartment && <CardDescription>Supports pour la filière: {deanDepartment}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading && <p>Chargement des supports en attente...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && pendingSupports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="mt-4 text-lg text-muted-foreground">
              Aucun support en attente de validation pour votre filière.
            </p>
          </div>
        )}

        {!loading && !error && pendingSupports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingSupports.map((item) => (
              <Card 
                key={item.id} 
                className="flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                      <div>
                          <CardDescription>{item.matiere} (Niveau {item.niveau})</CardDescription>
                          <CardTitle className="text-lg">{item.titre}</CardTitle>
                      </div>
                      <Badge variant={getStatusBadgeVariant(item.statut)}>
                          {item.statut}
                      </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={() => handleViewMaterial(item.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualiser
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm" onClick={() => handleAction(item.id, 'validate')}>
                        <Check className="mr-2 h-4 w-4" />
                        Valider
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleAction(item.id, 'reject', 'Rejeté par le doyen.')}>
                        <X className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationPage;