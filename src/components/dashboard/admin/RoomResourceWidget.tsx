import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Monitor, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const resourceStats = [
  { icon: <Building className="h-6 w-6 text-blue-500" />, label: 'Salles Total', value: '50' },
  { icon: <CheckCircle className="h-6 w-6 text-green-500" />, label: 'Salles Disponibles', value: '25' },
  { icon: <Monitor className="h-6 w-6 text-purple-500" />, label: 'Équipements Disponibles', value: '120' },
];

const RoomResourceWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Salles & Ressources</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {resourceStats.map((item, index) => (
          <div key={index} className="flex items-center space-x-4 rounded-md border p-4">
            {item.icon}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
        <div className="lg:col-span-3 mt-4">
            <h3 className="text-md font-semibold mb-2">Réservations Récentes</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span>Salle B101 - Cours Maths</span>
                    <Badge variant="secondary">Aujourd'hui 10h</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span>Amphi A - Examen Info</span>
                    <Badge variant="secondary">Demain 14h</Badge>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomResourceWidget;
