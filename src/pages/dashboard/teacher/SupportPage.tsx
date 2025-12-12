import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, Eye, Send, CalendarIcon, Search } from 'lucide-react';
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
  niveau: 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  dateDepot: string;
  dateValidation?: string;
}

const SupportPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Tous');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      // ... (le code de fetch reste le même)
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

  // ... (les fonctions handleSubmit, handleDelete, getStatusBadgeVariant, handleCardClick restent les mêmes)
  const handleSubmitForValidation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setIsSubmitting(id);
    const originalMaterials = [...materials]; // Garder l'original en cas d'erreur
    
    try {
      await api.post(`/campushub-support-service/api/supports/${id}/submit`);
      // Mettre à jour le statut localement après succès
      setMaterials(prevMaterials => 
        prevMaterials.map(material =>
          material.id === id ? { ...material, statut: 'SOUMIS' } : material
        )
      );
    } catch (err) {
      console.error("Failed to submit material", err);
      setMaterials(originalMaterials); // Revertir en cas d'erreur
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleDeleteMaterial = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const originalMaterials = [...materials];
    const updatedMaterials = materials.filter(material => material.id !== id);
    setMaterials(updatedMaterials);
    
    try {
      await api.delete(`/campushub-support-service/api/supports/${id}`);
    } catch (err) {
      console.error("Failed to delete material", err);
      setMaterials(originalMaterials); // Revertir en cas d'erreur
    }
  };

  const getStatusBadgeVariant = (status: Material['statut']) => {
    switch (status) {
      case 'VALIDÉ': return 'default';
      case 'BROUILLON': return 'outline';
      case 'SOUMIS': return 'secondary';
      case 'REJETÉ': return 'destructive';
      default: return 'outline';
    }
  };
  
  const handleCardClick = (id: number) => {
    navigate(`/dashboard/teacher/support/view/${id}`);
  };


  const filteredMaterials = materials
    .filter(material => {
      if (selectedLevel === 'Tous') return true;
      return material.niveau === selectedLevel;
    })
    .filter(material => {
      return material.titre.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
            <CardTitle>Gestion des Supports de Cours</CardTitle>
            <Link to="/dashboard/teacher/deposit-material">
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Déposer un support
                </Button>
            </Link>
        </div>
        <div className="flex items-center space-x-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par nom..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trier par niveau" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Tous">Tous les niveaux</SelectItem>
                    <SelectItem value="L1">Licence 1</SelectItem>
                    <SelectItem value="L2">Licence 2</SelectItem>
                    <SelectItem value="L3">Licence 3</SelectItem>
                    <SelectItem value="M1">Master 1</SelectItem>
                    <SelectItem value="M2">Master 2</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p>Chargement des supports...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((item) => (
                <Card 
                  key={item.id} 
                  className="flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 rounded-lg"
                >
                  <div className="cursor-pointer" onClick={() => handleCardClick(item.id)}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardDescription>{item.matiere}</CardDescription>
                        <Badge variant={getStatusBadgeVariant(item.statut)}>{item.statut}</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold">{item.titre}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Déposé le {new Date(item.dateDepot).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {item.statut === 'VALIDÉ' && item.dateValidation ? (
                            <span>Validé le {new Date(item.dateValidation).toLocaleDateString()}</span>
                          ) : (
                            <span className={item.statut === 'REJETÉ' ? 'text-destructive' : ''}>
                              {item.statut === 'REJETÉ' ? 'Rejeté' : 'En attente de validation'}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter className="bg-slate-50 p-3 flex justify-end space-x-2 rounded-b-lg">
                    {item.statut === 'BROUILLON' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleSubmitForValidation(e, item.id)}
                          disabled={isSubmitting === item.id}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {isSubmitting === item.id ? 'Envoi...' : 'Soumettre'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible et supprimera le support "{item.titre}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={(e) => handleDeleteMaterial(e, item.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleCardClick(item.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Détails
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
                <h3 className="text-xl font-semibold">Aucun résultat</h3>
                <p className="text-muted-foreground mt-2">
                  Aucun support ne correspond à vos critères de recherche.
                </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default SupportPage;
