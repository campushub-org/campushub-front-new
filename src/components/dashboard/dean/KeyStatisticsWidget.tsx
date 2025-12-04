import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building, Users } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const statsData = [
  { name: 'Validés', value: 85 },
  { name: 'En cours', value: 15 },
  { name: 'Rejetés', value: 5 },
];

const KeyStatisticsWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Statistiques Clés</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Cours Validés</p>
              <p className="text-xl font-bold">120</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Taux Occ. Salles</p>
              <p className="text-xl font-bold">75%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Enseignants Actifs</p>
              <p className="text-xl font-bold">80</p>
            </div>
          </div>
        </div>

        <h3 className="text-md font-semibold mb-2">Statut des Supports</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={statsData}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default KeyStatisticsWidget;
