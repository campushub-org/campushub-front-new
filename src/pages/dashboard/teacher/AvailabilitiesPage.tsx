import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assurez-vous que cet utilitaire existe pour les classes conditionnelles

// Définition des constantes pour les jours et les créneaux
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const timeSlots = [
  '7h - 9h55',
  '10h05 - 12h55',
  '13h05 - 15h55',
  '16h05 - 18h55',
  '19h05 - 21h55',
];

// Initialiser l'état des disponibilités (tous indisponibles par défaut)
const initialAvailabilities = days.reduce((acc, day) => {
  acc[day] = Array(timeSlots.length).fill(false);
  return acc;
}, {} as Record<string, boolean[]>);


const AvailabilitiesPage: React.FC = () => {
  const [availabilities, setAvailabilities] = useState(initialAvailabilities);

  // Gérer le clic sur un créneau
  const handleSlotClick = (day: string, slotIndex: number) => {
    const newAvailabilities = { ...availabilities };
    newAvailabilities[day][slotIndex] = !newAvailabilities[day][slotIndex];
    setAvailabilities(newAvailabilities);
  };

  const handleSaveChanges = () => {
    console.log("Disponibilités sauvegardées:", availabilities);
    // Ici, vous feriez l'appel API pour sauvegarder les données
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Disponibilités</CardTitle>
        <CardDescription>
          Cliquez sur les créneaux pour marquer vos disponibilités. Par défaut, tous les créneaux sont indisponibles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] font-bold">Jour</TableHead>
                {timeSlots.map(slot => (
                  <TableHead key={slot} className="text-center">{slot}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {days.map(day => (
                <TableRow key={day}>
                  <TableCell className="font-bold">{day}</TableCell>
                  {timeSlots.map((_, slotIndex) => (
                    <TableCell
                      key={slotIndex}
                      className={cn(
                        'text-center cursor-pointer transition-colors border-l',
                        availabilities[day][slotIndex]
                          ? 'bg-green-100 hover:bg-green-200 text-green-800'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
                      )}
                      onClick={() => handleSlotClick(day, slotIndex)}
                    >
                      {availabilities[day][slotIndex] ? 'Disponible' : 'Indisponible'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les modifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilitiesPage;
