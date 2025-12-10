import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"

const TimetableUploadPage: React.FC = () => {
  const { toast } = useToast();
  const [examType, setExamType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examType || !file) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un type d'examen et un fichier.",
      });
      return;
    }

    // Simuler le dépôt et la mise à disposition
    const availabilityKey = `isTimetableAvailable_${examType}`;
    localStorage.setItem(availabilityKey, 'true');

    toast({
      title: "Succès",
      description: `L'emploi du temps pour "${examType === 'CC' ? 'Contrôle Continu' : 'Session Normale'}" a été déposé et est maintenant disponible.`,
    });

    // Réinitialiser le formulaire
    setExamType('');
    setFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Déposer un Emploi du Temps d'Examen</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Type d'Examen</Label>
            <Select onValueChange={setExamType} value={examType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type d'examen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">Contrôle Continu (CC)</SelectItem>
                <SelectItem value="SN">Session Normale (SN)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timetable-file">Fichier de l'emploi du temps</Label>
            <Input 
              id="timetable-file" 
              type="file" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <Button type="submit" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Déposer et Rendre Disponible
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TimetableUploadPage;
