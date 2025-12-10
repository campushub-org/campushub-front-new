import React from 'react';
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
} from "@/components/ui/select"

const validatedCourses = [
  { id: 1, course: 'Mathématiques I', title: 'Algèbre Linéaire - Chap. 1', date: '25 Nov 2025' },
  { id: 2, course: 'Mathématiques I', title: 'Algèbre Linéaire - Chap. 2', date: '01 Déc 2025' },
  { id: 3, course: 'Chimie Organique', title: 'Réactions Acido-Basiques', date: '28 Nov 2025' },
  { id: 4, course: 'Physique des Ondes', title: 'Notes de cours - Ondes', date: '30 Nov 2025' },
];

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatedCourses.map((item) => (
                <Card 
                    key={item.id}
                    className="flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleViewMaterial(item.id)}
                >
                    <CardHeader>
                        <div className="flex items-center gap-3">
                           <BookOpen className="h-6 w-6 text-blue-500" />
                            <div>
                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                <CardDescription>{item.course}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Publié le: {item.date}</span>
                        <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); /* handle download */}}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursesPage;
