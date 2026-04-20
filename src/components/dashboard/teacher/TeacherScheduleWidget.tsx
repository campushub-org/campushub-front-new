import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, BookOpen, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const scheduleItems = [
  {
    type: 'Cours',
    name: 'Base de Données',
    date: 'Aujourd\'hui',
    time: '09:00 - 12:00',
    room: 'Amphi A',
    details: 'Cours Magistral',
    color: 'bg-blue-500'
  },
  {
    type: 'Examen',
    name: 'Algorithmique II',
    date: 'Demain',
    time: '14:00 - 16:00',
    room: 'Salle C201',
    details: 'Surveillance Examen',
    color: 'bg-purple-500'
  },
  {
    type: 'Cours',
    name: 'Développement Web',
    date: '12 Jan 2026',
    time: '10:00 - 13:00',
    room: 'Salle B102',
    details: 'Travaux Pratiques',
    color: 'bg-emerald-500'
  },
];

const TeacherScheduleWidget: React.FC = () => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">Agenda & Examens</CardTitle>
          <CardDescription>Vos prochaines interventions</CardDescription>
        </div>
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-muted/50">
          {scheduleItems.map((item, index) => (
            <div key={index} className="relative flex gap-4 items-start group">
              {/* Timeline Dot */}
              <div className={`mt-1.5 h-10 w-10 shrink-0 rounded-full border-4 border-background ${item.color} flex items-center justify-center text-white z-10 shadow-sm transition-transform group-hover:scale-110`}>
                {item.type === 'Cours' ? (
                  <BookOpen className="h-4 w-4" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 space-y-2 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase font-bold tracking-wider">
                      {item.type}
                    </Badge>
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-full">
                    {item.date}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {item.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.room}
                  </div>
                </div>
                
                <p className="text-xs italic text-muted-foreground/80">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <Link to="/dashboard/teacher/schedule-unified" className="block w-full">
          <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-primary transition-colors group">
            Voir le calendrier complet
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default TeacherScheduleWidget;
