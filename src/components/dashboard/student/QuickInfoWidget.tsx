import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCopy, AlertTriangle, MessageSquare } from 'lucide-react';

const infoItems = [
  {
    icon: <BookCopy className="h-6 w-6 text-blue-500" />,
    label: 'Nouveaux supports',
    value: '3',
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
    label: 'Prochain examen',
    value: 'Dans 5 jours',
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-green-500" />,
    label: 'Messages non lus',
    value: '2',
  },
];

const QuickInfoWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu Rapide</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-center space-x-4 rounded-md border p-4">
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

export default QuickInfoWidget;
