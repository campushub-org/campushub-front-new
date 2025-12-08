import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Send, Trash2 } from 'lucide-react';

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
];

const STORAGE_KEY = 'teacher_materials';

const SupportPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const storedMaterials = localStorage.getItem(STORAGE_KEY);
    return storedMaterials ? JSON.parse(storedMaterials) : initialMaterials;
  });

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


  return (
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Cours</TableHead>
              <TableHead>Titre du Support</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.course}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <FileText size={16} /> {item.title}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {item.status === 'Brouillon' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleSubmitForValidation(item.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Soumettre
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMaterial(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </>
                  )}
                  {item.status === 'En attente' && (
                     <span className="text-xs text-muted-foreground">En cours de validation...</span>
                  )}
                  {item.status === 'Rejeté' && (
                     <span className="text-xs text-destructive">Voir motif de rejet</span>
                  )}
                  {item.status === 'Validé' && (
                     <span className="text-xs text-green-600">Publié</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SupportPage;