import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Save } from 'lucide-react';

const AvailabilitiesPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Disponibilités</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="period">Période concernée</Label>
            <Input id="period" type="text" placeholder="Ex: Semestre de Printemps 2026" />
          </div>
          <div>
            <Label htmlFor="availability">Jours et Heures disponibles</Label>
            <Textarea
              id="availability"
              placeholder="Ex: Lundi 10h-12h, Mercredi 14h-17h..."
              rows={5}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea id="notes" placeholder="Toute information supplémentaire..." rows={3} />
          </div>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les Disponibilités
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AvailabilitiesPage;
