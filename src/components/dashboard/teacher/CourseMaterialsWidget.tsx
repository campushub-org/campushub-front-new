import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, MoreVertical, Eye, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const CourseMaterialsWidget: React.FC = () => {
  const { t } = useTranslation();

  const materials = [
    { course: 'Mathématiques I', title: 'Algèbre Linéaire - Chap. 1', status: 'Validé', date: '20 Mai 2024' },
    { course: 'Physique des Ondes', title: 'Cours Electromagnétisme', status: 'En attente', date: '18 Mai 2024' },
    { course: 'Programmation Avancée', title: 'TP React - Intro', status: 'Rejeté', date: '15 Mai 2024' },
    { course: 'Chimie Organique', title: 'Réactions Acido-Basiques', status: 'Validé', date: '10 Mai 2024' },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Validé': return t('teacher.dashboard.widgets.materials.statuses.validated');
      case 'En attente': return t('teacher.dashboard.widgets.materials.statuses.pending');
      case 'Rejeté': return t('teacher.dashboard.widgets.materials.statuses.rejected');
      default: return status;
    }
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">{t('teacher.dashboard.widgets.materials.title')}</CardTitle>
          <CardDescription>{t('teacher.dashboard.widgets.materials.desc')}</CardDescription>
        </div>
        <Button variant="outline" size="sm">{t('teacher.dashboard.widgets.materials.view_all')}</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[180px] px-6">{t('teacher.dashboard.widgets.materials.table.course')}</TableHead>
              <TableHead>{t('teacher.dashboard.widgets.materials.table.material')}</TableHead>
              <TableHead>{t('teacher.dashboard.widgets.materials.table.date')}</TableHead>
              <TableHead>{t('teacher.dashboard.widgets.materials.table.status')}</TableHead>
              <TableHead className="text-right px-6">{t('teacher.dashboard.widgets.materials.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                <TableCell className="px-6 font-medium text-primary/80">{item.course}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center text-primary">
                      <FileText size={16} />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{item.date}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      item.status === 'Validé' ? 'default' :
                      item.status === 'En attente' ? 'secondary' : 'destructive'
                    }
                    className="font-medium px-2 py-0.5"
                  >
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        {t('teacher.dashboard.widgets.materials.actions.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" />
                        {t('teacher.dashboard.widgets.materials.actions.download')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('teacher.dashboard.widgets.materials.actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CourseMaterialsWidget;

