import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reports = [
  { name: 'Rapport annuel des validations', icon: <FileText className="h-5 w-5" />, action: 'Générer' },
  { name: 'Statistiques d\'assiduité étudiants', icon: <BarChart2 className="h-5 w-5" />, action: 'Voir' },
  { name: 'Rapport des conflits de planification', icon: <FileText className="h-5 w-5" />, action: 'Télécharger' },
];

const DeanReportsWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Rapports & Analyses</CardTitle>
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

export default DeanReportsWidget;
