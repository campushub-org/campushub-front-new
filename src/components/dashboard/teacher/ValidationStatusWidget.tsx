import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hourglass, CheckCircle, XCircle } from 'lucide-react';

const validationStats = [
  {
    icon: <Hourglass className="h-6 w-6 text-yellow-500" />,
    label: 'Supports en attente',
    value: '5',
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    label: 'Supports validés',
    value: '23',
  },
  {
    icon: <XCircle className="h-6 w-6 text-red-500" />,
    label: 'Supports rejetés',
    value: '2',
  },
];

const ValidationStatusWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut des Validations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {validationStats.map((item, index) => (
          <div key={index} className="flex items-center space-x-4 rounded-md border p-4">
            {item.icon}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ValidationStatusWidget;
