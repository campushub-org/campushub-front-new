import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CourseSchedulePage: React.FC = () => {
  const { t } = useTranslation();

  const courseSchedule = [
    { day: t('common.days.monday', { defaultValue: 'Lundi' }), time: '08:00 - 10:00', course: 'Mathématiques I', room: 'Amphi A' },
    { day: t('common.days.tuesday', { defaultValue: 'Mardi' }), time: '10:00 - 12:00', course: 'Physique des Ondes', room: 'Salle B102' },
    { day: t('common.days.wednesday', { defaultValue: 'Mercredi' }), time: '14:00 - 16:00', course: 'Chimie Organique', room: 'Labo C1' },
    { day: t('common.days.thursday', { defaultValue: 'Jeudi' }), time: '08:00 - 10:00', course: 'Mathématiques I', room: 'Salle A101' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('student.schedule.courses_title')}</CardTitle>
        <Button size="sm">
          <Download className="mr-2 h-4 w-4" />
          {t('student.schedule.download')}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('student.schedule.day')}</TableHead>
              <TableHead>{t('student.schedule.time')}</TableHead>
              <TableHead>{t('student.schedule.course')}</TableHead>
              <TableHead>{t('student.schedule.room')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseSchedule.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.day}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.course}</TableCell>
                <TableCell>{item.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CourseSchedulePage;

