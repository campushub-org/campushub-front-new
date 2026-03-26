import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, Eye, Send, CalendarIcon, Search, FileText } from 'lucide-react';
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
import DepositMaterialDrawer from '@/components/dashboard/teacher/DepositMaterialDrawer';

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
  const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmitForValidation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setIsSubmitting(id);
    
    try {
      await api.post(`/campushub-support-service/api/supports/${id}/submit`);
      setMaterials(prevMaterials => 
        prevMaterials.map(material =>
          material.id === id ? { ...material, statut: 'SOUMIS' } : material
        )
      );
    } catch (err) {
      console.error("Failed to submit material", err);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleDeleteMaterial = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const originalMaterials = [...materials];
    setMaterials(materials.filter(material => material.id !== id));
    
    try {
      await api.delete(`/campushub-support-service/api/supports/${id}`);
    } catch (err) {
      console.error("Failed to delete material", err);
      setMaterials(originalMaterials);
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
      return material.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
             material.matiere.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Supports de Cours</h1>
          <p className="text-muted-foreground mt-1">Gérez et suivez l'état de vos documents pédagogiques.</p>
        </div>
        <Button onClick={() => setIsDepositDrawerOpen(true)} className="shadow-sm">
          <Upload className="mr-2 h-4 w-4" />
          Nouveau support
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou matière..."
                className="pl-9 h-10 border-border/50 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-[200px] h-10 border-border/50">
                <SelectValue placeholder="Filtrer par niveau" />
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Chargement de vos documents...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20 text-center">
              {error}
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((item) => (
                <Card 
                  key={item.id} 
                  className="group flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300 rounded-xl overflow-hidden border-border/50"
                >
                  <div className="cursor-pointer" onClick={() => handleCardClick(item.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-bold uppercase tracking-wider">
                          {item.matiere}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(item.statut)} className="font-semibold text-[10px]">
                          {item.statut}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors flex items-start gap-2">
                        <FileText className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                        {item.titre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          <span>Déposé le {new Date(item.dateDepot).toLocaleDateString()}</span>
                        </div>
                        {item.statut === 'VALIDÉ' && item.dateValidation && (
                          <div className="flex items-center text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                            <span>Validé le {new Date(item.dateValidation).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.statut === 'REJETÉ' && (
                          <div className="flex items-center text-xs text-destructive font-medium">
                            <AlertCircle className="mr-2 h-3.5 w-3.5" />
                            <span>Document rejeté</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter className="bg-muted/30 p-3 flex justify-end space-x-2 border-t border-border/50">
                    {item.statut === 'BROUILLON' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:bg-primary/10"
                          onClick={(e) => handleSubmitForValidation(e, item.id)}
                          disabled={isSubmitting === item.id}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {isSubmitting === item.id ? '...' : 'Soumettre'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le support ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement "{item.titre}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={(e) => handleDeleteMaterial(e, item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    <Button variant="ghost" size="sm" className="hover:bg-accent" onClick={() => handleCardClick(item.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ouvrir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 border-2 border-dashed border-muted-foreground/10 rounded-xl">
                <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold">Aucun support trouvé</h3>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                  Nous n'avons trouvé aucun document correspondant à votre recherche.
                </p>
                <Button onClick={() => setIsDepositDrawerOpen(true)} variant="outline" className="mt-6">
                  Déposer mon premier support
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DepositMaterialDrawer 
        open={isDepositDrawerOpen} 
        onOpenChange={setIsDepositDrawerOpen}
        onSuccess={fetchMaterials}
      />
    </div>
  );
};

// Simple icon components since some were missing in the imports for the new JSX structure
const CheckCircle2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
const AlertCircle = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>

export default SupportPage;
