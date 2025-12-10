import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; // Import CardFooter
import { Button } from '@/components/ui/button';
import { Check, X, FileDown, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';

// Interface pour typer nos données (similaire à celle de l'enseignant)
export interface MaterialToValidate {
  id: number;
  course: string;
  teacher: string;
  title: string;
  status: 'En attente' | 'Validé' | 'Rejeté' | 'Révision demandée'; // Nouveaux statuts pour le doyen
}

const initialMaterialsToValidate: MaterialToValidate[] = [
  { id: 1, course: 'Algèbre I', teacher: 'Dr. Dupont', title: 'Algèbre Linéaire - Chap. 1', status: 'En attente' },
  { id: 2, course: 'Analyse II', teacher: 'Pr. Martin', title: 'Calcul Différentiel', status: 'En attente' },
  { id: 3, course: 'Physique Quantique', teacher: 'Dr. Lefevre', title: 'Notes de cours - Mécanique Quantique', status: 'Révision demandée' },
  { id: 4, course: 'Programmation Web', teacher: 'Mme. Garcia', title: 'Frontend avec React', status: 'En attente' },
];

const ValidationPage: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialToValidate[]>(initialMaterialsToValidate);
  const navigate = useNavigate();

  const handleValidate = (id: number) => {
    setMaterials(materials.map(mat => (mat.id === id ? { ...mat, status: 'Validé' } : mat)));
    // API call to validate
  };

  const handleReject = (id: number) => {
    setMaterials(materials.map(mat => (mat.id === id ? { ...mat, status: 'Rejeté' } : mat)));
    // API call to reject
  };

  const handleRequestRevision = (id: number) => {
    setMaterials(materials.map(mat => (mat.id === id ? { ...mat, status: 'Révision demandée' } : mat)));
    // API call to request revision
  };

  const getStatusBadgeVariant = (status: MaterialToValidate['status']) => {
    switch (status) {
      case 'Validé':
        return 'default';
      case 'En attente':
        return 'secondary';
      case 'Rejeté':
        return 'destructive';
      case 'Révision demandée':
        return 'outline'; // Using outline for revision requested
      default:
        return 'outline';
    }
  };

  const handleViewMaterial = (id: number) => {
    navigate(`/dashboard/dean/validations/view/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation des Supports de Cours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              <SelectItem value="l1">Licence 1</SelectItem>
              <SelectItem value="l2">Licence 2</SelectItem>
              <SelectItem value="l3">Licence 3</SelectItem>
              <SelectItem value="m1">Master 1</SelectItem>
              <SelectItem value="m2">Master 2</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              <SelectItem value="info">Informatique</SelectItem>
              <SelectItem value="maths">Mathématiques</SelectItem>
              <SelectItem value="physique">Physique</SelectItem>
              <SelectItem value="chimie">Chimie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((item) => (
            <Card 
              key={item.id} 
              className="flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleViewMaterial(item.id)} // Rendre la carte cliquable
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardDescription>{item.course} par {item.teacher}</CardDescription>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Any additional details could go here */}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-0">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewMaterial(item.id); }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualiser
                </Button>
                {/* Actions removed from here, to be handled on DeanViewMaterialPage */}
                {item.status === 'Validé' && (
                  <span className="text-xs text-green-600">Validé</span>
                )}
                {item.status === 'Rejeté' && (
                  <span className="text-xs text-destructive">Rejeté</span>
                )}
                {item.status === 'Révision demandée' && (
                  <span className="text-xs text-orange-600">Révision demandée</span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationPage;
