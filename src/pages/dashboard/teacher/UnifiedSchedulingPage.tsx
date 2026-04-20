import React, { useState, useCallback, useMemo } from "react";
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Clock,
  Layout,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeekViewEditable } from "@/components/schedule/week-view-editable";
import { EventDrawer } from "@/components/schedule/event-drawer";
import { sampleEvents, ScheduleEvent, CourseType, courseTypeLabels } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const UnifiedSchedulingPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>(sampleEvents);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);

  // Filtrer pour ne voir que ce qui concerne le prof (dans la réalité on filtrerait par teacherId)
  // Ici on simule en montrant les cours et les disponibilités
  const filteredEvents = useMemo(() => {
    return events;
  }, [events]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleEventClick = useCallback((event: ScheduleEvent) => {
    // Les cours sont en lecture seule pour le prof, seules les disponibilités sont éditables ?
    // Pour l'instant on laisse tout éditable si isEditMode est ON
    if (isEditMode || event.type === "availability") {
      setSelectedEvent(event);
      setIsNewEvent(false);
      setDrawerOpen(true);
    }
  }, [isEditMode]);

  const handleCreateEvent = useCallback((day: number, startTime: string) => {
    if (!isEditMode) return;
    
    const [hours] = startTime.split(":").map(Number);
    const endHour = Math.min(hours + 2, 19);
    
    setSelectedEvent({
      id: `avail-${Date.now()}`,
      title: "Disponible",
      type: "availability",
      professor: "Moi",
      room: "-",
      startTime,
      endTime: `${endHour.toString().padStart(2, "0")}:00`,
      day,
      description: "Créneau de disponibilité"
    });
    setIsNewEvent(true);
    setDrawerOpen(true);
  }, [isEditMode]);

  const handleSaveEvent = (event: ScheduleEvent) => {
    if (isNewEvent) {
      setEvents(prev => [...prev, event]);
    } else {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    }
    setDrawerOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setDrawerOpen(false);
  };

  const handleSaveChanges = () => {
    console.log("Sauvegarde des changements vers le backend...", events);
    setIsEditMode(false);
    // Ici appel à l'API /api/scheduling/batch-save
    alert("Changements enregistrés avec succès !");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Planning Unifié</h1>
          <p className="text-muted-foreground">
            Gérez vos cours et vos disponibilités en un seul endroit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveChanges} className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditMode(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Gérer mes disponibilités
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="px-3 text-sm font-medium" onClick={handleToday}>
                Aujourd&apos;hui
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 rounded-full bg-blue-500/50" />
                <span>Cours</span>
                <div className="h-3 w-3 rounded-full bg-green-500/50 ml-2" />
                <span>Disponibilité</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditMode && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
              <Info className="h-4 w-4" />
              <span>Mode Édition : Cliquez sur un créneau vide pour ajouter une disponibilité ou faites glisser les blocs existants.</span>
            </div>
          )}
          
          <div className="rounded-xl border bg-card">
            <WeekViewEditable
              events={filteredEvents}
              currentDate={currentDate}
              selectedTypes={["lecture", "td", "tp", "exam", "meeting", "availability"]}
              isEditMode={isEditMode}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
              onEventUpdate={handleSaveEvent}
            />
          </div>
        </CardContent>
      </Card>

      <EventDrawer
        isOpen={drawerOpen}
        event={selectedEvent}
        isNew={isNewEvent}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default UnifiedSchedulingPage;
