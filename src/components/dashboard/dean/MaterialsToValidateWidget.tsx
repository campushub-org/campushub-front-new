import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MaterialsToValidateWidget: React.FC = () => {
  const { t, i18n } = useTranslation();

  const materialsToValidate = [
    { course: 'Algèbre I', teacher: 'Dr. Dupont', date: `01 ${i18n.language === 'fr' ? 'Déc' : 'Dec'} 2025`, status: t("dean.dashboard.widgets.validation.status.pending") },
    { course: 'Analyse II', teacher: 'Pr. Martin', date: `02 ${i18n.language === 'fr' ? 'Déc' : 'Dec'} 2025`, status: t("dean.dashboard.widgets.validation.status.pending") },
    { course: 'Physique Quantique', teacher: 'Dr. Lefevre', date: `28 ${i18n.language === 'fr' ? 'Nov' : 'Nov'} 2025`, status: t("dean.dashboard.widgets.validation.status.pending") },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t("dean.dashboard.widgets.validation.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dean.dashboard.widgets.validation.table.course")}</TableHead>
              <TableHead>{t("dean.dashboard.widgets.validation.table.teacher")}</TableHead>
              <TableHead className="text-center">{t("dean.dashboard.widgets.validation.table.date")}</TableHead>
              <TableHead className="text-right">{t("dean.dashboard.widgets.validation.table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materialsToValidate.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.course}</TableCell>
                <TableCell>{item.teacher}</TableCell>
                <TableCell className="text-center flex items-center justify-center gap-1">
                  <Clock size={16} className="inline" /> {item.date}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{item.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MaterialsToValidateWidget;