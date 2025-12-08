import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { Material } from './SupportPage'; // Importer l'interface

const STORAGE_KEY = 'teacher_materials';

const DepositMaterialPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !course) {
      alert('Veuillez remplir le titre et le cours associé.');
      return;
    }

    // Récupérer la liste existante
    const storedMaterials = localStorage.getItem(STORAGE_KEY);
    const materials: Material[] = storedMaterials ? JSON.parse(storedMaterials) : [];

    // Créer le nouveau support
    const newMaterial: Material = {
      id: Date.now(), // Utiliser un ID unique simple
      title,
      course,
      status: 'Brouillon',
    };

    // Ajouter et sauvegarder
    const updatedMaterials = [...materials, newMaterial];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMaterials));

    // Rediriger vers la page de support
    navigate('/dashboard/teacher/support');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Déposer un Support de Cours</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title">Titre du Support</Label>
            <Input 
              id="title" 
              placeholder="Ex: Algèbre Linéaire - Chapitre 1" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="course">Cours Associé</Label>
            <Input 
              id="course" 
              placeholder="Ex: Mathématiques I" 
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Courte description du contenu du support..." />
          </div>
          <div>
            <Label htmlFor="file">Fichier du Support</Label>
            <Input id="file" type="file" />
          </div>
          <Button type="submit">
            <Upload className="mr-2 h-4 w-4" />
            Déposer comme Brouillon
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DepositMaterialPage;
