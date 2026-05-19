import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, FileCheck, FileClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ExamSchedulePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedExamType, setSelectedExamType] = useState<'CC' | 'SN' | null>(null);

  const examSchedules = {
    CC: [
      { date: t('common.all_week', { defaultValue: 'Toute la semaine' }), time: 'N/A', course: 'Mathématiques I', room: t('common.online', { defaultValue: 'En ligne' }) },
      { date: t('common.all_week', { defaultValue: 'Toute la semaine' }), time: 'N/A', course: 'Physique des Ondes', room: t('common.online', { defaultValue: 'En ligne' }) },
    ],
    SN: [
      { date: '15 Jan 2026', time: '10:00 - 12:00', course: 'Mathématiques I', room: 'Amphi A' },
      { date: '17 Jan 2026', time: '14:00 - 16:00', course: 'Physique des Ondes', room: 'Salle B203' },
    ],
  };

  const handleSelectExamType = (examType: 'CC' | 'SN') => {
    setSelectedExamType(examType);
  };

  const handleGoBack = () => {
    setSelectedExamType(null);
  };

  // Check availability from localStorage
  const isTimetableAvailable = selectedExamType ? localStorage.getItem(`isTimetableAvailable_${selectedExamType}`) === 'true' : false;

  if (selectedExamType) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>{t('student.schedule.exams_title')} - {selectedExamType === 'CC' ? t('student.schedule.cc_title') : t('student.schedule.sn_title')}</CardTitle>
            </div>
          </div>
          {isTimetableAvailable && (
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('student.schedule.download_short')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isTimetableAvailable ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('student.schedule.date')}</TableHead>
                  <TableHead>{t('student.schedule.time')}</TableHead>
                  <TableHead>{t('student.schedule.subject')}</TableHead>
                  <TableHead>{t('student.schedule.room')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examSchedules[selectedExamType].map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.course}</TableCell>
                    <TableCell>{item.room}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <FileClock className="mx-auto h-12 w-12" />
              <p className="mt-4">{t('student.schedule.not_available')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
        <h2 className="text-2xl font-bold mb-4">{t('student.schedule.exams_choice')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectExamType('CC')}>
                <CardHeader>
                    <FileCheck className="h-8 w-8 mb-2 text-blue-500"/>
                    <CardTitle>{t('student.schedule.cc_title')}</CardTitle>
                    <CardDescription>{t('student.schedule.cc_desc')}</CardDescription>
                </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectExamType('SN')}>
                <CardHeader>
                    <FileClock className="h-8 w-8 mb-2 text-amber-500"/>
                    <CardTitle>{t('student.schedule.sn_title')}</CardTitle>
                    <CardDescription>{t('student.schedule.sn_desc')}</CardDescription>
                </CardHeader>
            </Card>
        </div>
    </div>
  );
};

export default ExamSchedulePage;

