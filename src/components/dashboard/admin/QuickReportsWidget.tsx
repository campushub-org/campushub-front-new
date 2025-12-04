import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reports = [
  { name: 'Rapport d\'occupation des salles', icon: <FileText className="h-5 w-5" />, action: 'Télécharger' },
  { name: 'Statistiques des supports validés', icon: <TrendingUp className="h-5 w-5" />, action: 'Voir' },
  { name: 'Liste des examens planifiés', icon: <FileText className="h-5 w-5" />, action: 'Télécharger' },
];

const QuickReportsWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Rapports Rapides</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {reports.map((report, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center space-x-3">
              {report.icon}
              <span className="font-medium">{report.name}</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> {report.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickReportsWidget;
