import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';

interface SupportCours {
  id: number;
  titre: string;
  description: string;
  fichierUrl: string;
  niveau: string;
  matiere: string;
  enseignantId: number;
  dateDepot: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  dateValidation?: string;
  remarqueDoyen?: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<SupportCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get<SupportCours[]>('/campushub-support-service/api/supports');
        const validatedCourses = response.data.filter(course => course.statut === 'VALIDÉ');
        setCourses(validatedCourses);
      } catch (err) {
        setError("Impossible de charger les supports de cours.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDownload = (e: React.MouseEvent, fileUrl: string) => {
    e.stopPropagation();
    window.open(fileUrl, '_blank');
  };

  const handleViewMaterial = (id: number) => {
    navigate(`/dashboard/student/courses/view/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supports de Cours Validés</CardTitle>
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

        {loading && <p>Chargement des cours...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            <img src="/Empty_file.svg" alt="Aucun cours disponible" className="w-48 h-48 text-gray-400" />
            <p className="mt-4 text-lg text-muted-foreground">
              Aucun support de cours validé n'est disponible pour le moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Revenez plus tard, de nouveaux contenus sont régulièrement ajoutés !
            </p>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((item) => (
                  <Card 
                      key={item.id}
                      className="flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleViewMaterial(item.id)}
                  >
                      <CardHeader>
                          <div className="flex items-center gap-3">
                             <BookOpen className="h-6 w-6 text-blue-500" />
                              <div>
                                  <CardTitle className="text-lg">{item.titre}</CardTitle>
                                  <CardDescription>{item.matiere}</CardDescription>
                              </div>
                          </div>
                      </CardHeader>
                      <CardFooter className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Publié le: {item.dateValidation ? new Date(item.dateValidation).toLocaleDateString() : 'N/A'}
                          </span>
                          <Button variant="outline" size="sm" onClick={(e) => handleDownload(e, item.fichierUrl)}>
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger
                          </Button>
                      </CardFooter>
                  </Card>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursesPage;