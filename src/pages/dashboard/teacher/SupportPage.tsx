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

// Interface pour typer nos données
export interface Material {
  id: number;
  course: string;
  title: string;
  status: 'Validé' | 'En attente' | 'Rejeté' | 'Brouillon';
}

const initialMaterials: Material[] = [
  { id: 1, course: 'Mathématiques I', title: 'Algèbre Linéaire - Chap. 1', status: 'Validé' },
  { id: 2, course: 'Physique des Ondes', title: 'Cours Electromagnétisme', status: 'En attente' },
  { id: 3, course: 'Programmation Avancée', title: 'TP React - Intro', status: 'Rejeté' },
  { id: 4, course: 'Chimie Organique', title: 'Réactions Acido-Basiques', status: 'Validé' },
  { id: 5, course: 'Algorithmique', title: 'Complexité et Tris', status: 'Brouillon' },
  { id: 6, course: 'Base de Données', title: 'SQL Avancé', status: 'Brouillon' },
];

const STORAGE_KEY = 'teacher_materials';

const SupportPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const storedMaterials = localStorage.getItem(STORAGE_KEY);
    return storedMaterials ? JSON.parse(storedMaterials) : initialMaterials;
  });
  const navigate = useNavigate();

  // Sauvegarder dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  }, [materials]);

  // Fonction pour soumettre un support pour validation
  const handleSubmitForValidation = (id: number) => {
    setMaterials(materials.map(material => 
      material.id === id ? { ...material, status: 'En attente' } : material
    ));
    // Ici, un appel API serait fait pour notifier le backend
  };

  // Fonction pour supprimer un support
  const handleDeleteMaterial = (id: number) => {
    setMaterials(materials.filter(material => material.id !== id));
    // Ici, un appel API serait fait pour notifier le backend
  };

  const getStatusBadgeVariant = (status: Material['status']) => {
    switch (status) {
      case 'Validé':
        return 'default';
      case 'Brouillon':
        return 'outline';
      case 'En attente':
        return 'secondary';
      case 'Rejeté':
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((item) => (
              <Card 
                key={item.id} 
                className="flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleViewMaterial(item.id)} // Rendre la carte cliquable
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex flex-col space-y-1">
                    <CardDescription>{item.course}</CardDescription>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewMaterial(item.id); }}>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualiser
                  </Button>
                  <div className="flex space-x-2">
                    {item.status === 'Brouillon' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSubmitForValidation(item.id); }}>
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
                                Cette action est irréversible. Le support "{item.title}" sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMaterial(item.id)}>
                                Confirmer la suppression
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {item.status === 'En attente' && (
                      <span className="text-xs text-muted-foreground">En validation...</span>
                    )}
                    {item.status === 'Rejeté' && (
                      <span className="text-xs text-destructive">Rejeté</span>
                    )}
                    {item.status === 'Validé' && (
                      <span className="text-xs text-green-600">Validé</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SupportPage;