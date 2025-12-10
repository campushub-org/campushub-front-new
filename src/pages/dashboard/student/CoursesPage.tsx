import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
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
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'REJETE';
  dateValidation?: string;
  remarqueDoyen?: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<SupportCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get<SupportCours[]>('/campushub-support-service/api/supports');
        // On ne garde que les cours validés pour les étudiants
        const validatedCourses = response.data.filter(course => course.statut === 'VALIDE');
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

  const handleDownload = (fileUrl: string) => {
    // Dans une vraie application, on pourrait vouloir sécuriser ce lien
    window.open(fileUrl, '_blank');
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Matière</TableHead>
                <TableHead>Titre du Support</TableHead>
                <TableHead>Date de publication</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.matiere}</TableCell>
                  <TableCell>{item.titre}</TableCell>
                  <TableCell>{new Date(item.dateValidation!).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(item.fichierUrl)}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursesPage;
