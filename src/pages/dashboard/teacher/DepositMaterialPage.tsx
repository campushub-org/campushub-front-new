import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';

const DepositMaterialPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Déposer un Support de Cours</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du Support</Label>
            <Input id="title" placeholder="Ex: Algèbre Linéaire - Chapitre 1" />
          </div>
          <div>
            <Label htmlFor="course">Cours Associé</Label>
            <Input id="course" placeholder="Ex: Mathématiques I" />
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
            Déposer le Support
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DepositMaterialPage;
