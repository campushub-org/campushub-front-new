import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, FileCheck, FileClock, Edit } from 'lucide-react';

const examSchedules = {
  CC: [
    { date: 'Toute la semaine', time: 'N/A', course: 'Mathématiques I', room: 'En ligne', supervision: 'Non' },
  ],
  SN: [
    { date: '15 Jan 2026', time: '10:00 - 12:00', course: 'Mathématiques I', room: 'Amphi A', supervision: 'Oui' },
    { date: '17 Jan 2026', time: '14:00 - 16:00', course: 'Physique des Ondes', room: 'Salle B203', supervision: 'Non' },
  ],
};

type ExamType = 'CC' | 'SN';

const TeacherExamSchedulePage: React.FC = () => {
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);

  const handleSelectExamType = (examType: ExamType) => {
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
              <CardTitle>Emploi du Temps - {selectedExamType === 'CC' ? 'Contrôle Continu' : 'Session Normale'}</CardTitle>
            </div>
          </div>
          {isTimetableAvailable && (
            <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                </Button>
                <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isTimetableAvailable ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Salle</TableHead>
                  <TableHead className="text-center">Surveillance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examSchedules[selectedExamType].map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.course}</TableCell>
                    <TableCell>{item.room}</TableCell>
                    <TableCell className="text-center">{item.supervision}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <FileClock className="mx-auto h-12 w-12" />
              <p className="mt-4">L'emploi du temps pour cette session n'est pas encore disponible.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
        <h2 className="text-2xl font-bold mb-4">Choisir un type d'examen</h2>
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectExamType('CC')}>
                <CardHeader>
                    <FileCheck className="h-8 w-8 mb-2 text-blue-500"/>
                    <CardTitle>Contrôle Continu (CC)</CardTitle>
                    <CardDescription>Consulter les modalités des contrôles continus.</CardDescription>
                </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectExamType('SN')}>
                <CardHeader>
                    <FileClock className="h-8 w-8 mb-2 text-amber-500"/>
                    <CardTitle>Session Normale (SN)</CardTitle>
                    <CardDescription>Consulter l'emploi du temps des examens finaux.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    </div>
  );
};

export default TeacherExamSchedulePage;
