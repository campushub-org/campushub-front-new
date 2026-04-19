import React, { useState, useCallback, useEffect } from "react";
import { 
  Filter,
  ChevronLeft,
  ChevronRight,
  Layout,
  Search,
  Settings,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { WeekViewEditable } from "@/components/schedule/week-view-editable";
import { DayView } from "@/components/schedule/day-view";
import { MonthView } from "@/components/schedule/month-view";
import { EventDrawer } from "@/components/schedule/event-drawer";
import { EditModeToolbar } from "@/components/schedule/edit-mode-toolbar";
import { ScheduleSidebar } from "@/components/schedule/schedule-sidebar";
import { sampleEvents, ScheduleEvent, CourseType } from "@/lib/schedule-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

type ViewMode = "week" | "day" | "month";

const DeanSchedulingPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>([
    "lecture", "td", "tp", "exam", "meeting"
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>(sampleEvents);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [history, setHistory] = useState<ScheduleEvent[][]>([sampleEvents]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Fix pour neutraliser les contraintes du DashboardLayout parent
  // On utilise des marges négatives pour annuler les paddings p-4, p-6, p-8 et le max-w-7xl
  const layoutOverrider = "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]";

  const handlePrevious = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleTypeToggle = useCallback((type: CourseType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setViewMode("day");
  }, []);

  // Event handlers
  const handleEventClick = useCallback((event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsNewEvent(false);
    setDrawerOpen(true);
  }, []);

  const handleCreateEvent = useCallback((day: number, startTime: string) => {
    const [hours] = startTime.split(":").map(Number);
    const endHour = Math.min(hours + 2, 19);
    
    setSelectedEvent({
      id: `new-${Date.now()}`,
      title: "",
      type: "lecture",
      professor: "",
      room: "",
      startTime,
      endTime: `${endHour.toString().padStart(2, "0")}:00`,
      day,
      description: "",
    });
    setIsNewEvent(true);
    setDrawerOpen(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    handleCreateEvent(0, "08:00");
  }, [handleCreateEvent]);

  const updateHistory = useCallback((newEvents: ScheduleEvent[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEvents);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleEventUpdate = useCallback((updatedEvent: ScheduleEvent) => {
    const newEvents = events.map(e => 
      e.id === updatedEvent.id ? updatedEvent : e
    );
    setEvents(newEvents);
    updateHistory(newEvents);
    setPendingChanges(prev => prev + 1);
  }, [events, updateHistory]);

  const handleEventSave = useCallback((event: ScheduleEvent) => {
    let newEvents: ScheduleEvent[];
    if (isNewEvent) {
      newEvents = [...events, { ...event, id: `event-${Date.now()}` }];
    } else {
      newEvents = events.map(e => e.id === event.id ? event : e);
    }
    setEvents(newEvents);
    updateHistory(newEvents);
    setPendingChanges(prev => prev + 1);
    setDrawerOpen(false);
    setSelectedEvent(null);
  }, [events, isNewEvent, updateHistory]);

  const handleEventDelete = useCallback((eventId: string) => {
    const newEvents = events.filter(e => e.id !== eventId);
    setEvents(newEvents);
    updateHistory(newEvents);
    setPendingChanges(prev => prev + 1);
    setDrawerOpen(false);
    setSelectedEvent(null);
  }, [events, updateHistory]);

  const handleEventDuplicate = useCallback((event: ScheduleEvent) => {
    const duplicatedEvent: ScheduleEvent = {
      ...event,
      id: `event-${Date.now()}`,
      title: `${event.title} (copie)`,
    };
    const newEvents = [...events, duplicatedEvent];
    setEvents(newEvents);
    updateHistory(newEvents);
    setPendingChanges(prev => prev + 1);
    setSelectedEvent(duplicatedEvent);
  }, [events, updateHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEvents(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEvents(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleSaveAll = useCallback(() => {
    setPendingChanges(0);
    setHistory([events]);
    setHistoryIndex(0);
  }, [events]);

  const handleDiscardAll = useCallback(() => {
    setEvents(sampleEvents);
    setHistory([sampleEvents]);
    setHistoryIndex(0);
    setPendingChanges(0);
  }, []);

  return (
    <TooltipProvider>
      {/* 
        Le conteneur principal utilise des marges négatives pour "manger" le padding du parent DashboardLayout
        et s'étaler sur toute la largeur disponible.
      */}
      <div className={cn(
        "flex h-[calc(100vh-theme(spacing.16))] bg-background overflow-hidden border-t border-border/50",
        layoutOverrider
      )}>
        {/* Sidebar Interne (Filtres) */}
        <aside 
          className={cn(
            "shrink-0 border-r border-border bg-card/50 transition-all duration-300 ease-in-out relative h-full",
            sidebarOpen ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden border-r-0"
          )}
        >
          <div className="w-72 p-6 h-full overflow-y-auto">
            <ScheduleSidebar 
              events={events} 
              selectedTypes={selectedTypes}
            />
          </div>
        </aside>

        {/* Contenu principal du planning */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          
          {/* Section Header & Toolbar */}
          <div className="p-4 lg:p-6 pb-2 space-y-4 shrink-0 bg-background/50 backdrop-blur-sm z-10 border-b border-border/40 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-9 w-9 transition-colors hover:bg-accent",
                        sidebarOpen ? "text-primary bg-primary/5" : "text-muted-foreground"
                      )}
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      <Layout className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {sidebarOpen ? "Masquer les filtres" : "Afficher les filtres"}
                  </TooltipContent>
                </Tooltip>
                <h1 className="text-xl font-semibold tracking-tight">Planning de l'établissement</h1>
              </div>

              {/* Mode Édition / Historique */}
              <div className="flex-1 max-w-2xl px-4">
                <EditModeToolbar
                  isEditMode={isEditMode}
                  onToggleEditMode={() => setIsEditMode(!isEditMode)}
                  onAddEvent={handleAddEvent}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                  pendingChanges={pendingChanges}
                  onSaveAll={handleSaveAll}
                  onDiscardAll={handleDiscardAll}
                />
              </div>

              {/* Barre de recherche (si nécessaire ici) */}
              <div className="flex items-center gap-2">
                <div className="relative hidden xl:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="h-9 w-56 pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20" placeholder="Rechercher..." />
                </div>
              </div>
            </div>

            {/* Contrôles du Calendrier (Date, Vue) */}
            <div className="bg-muted/30 rounded-lg p-1">
              <ScheduleHeader
                currentDate={currentDate}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToday={handleToday}
                selectedTypes={selectedTypes}
                onTypeToggle={handleTypeToggle}
              />
            </div>
          </div>

          {/* Grille du Calendrier - OCCUPE TOUT LE RESTE DE L'ESPACE */}
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-auto bg-card scrollbar-thin scrollbar-thumb-border">
              {viewMode === "week" && (
                <WeekViewEditable
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  isEditMode={isEditMode}
                  onEventClick={handleEventClick}
                  onEventUpdate={handleEventUpdate}
                  onCreateEvent={handleCreateEvent}
                />
              )}
              {viewMode === "day" && (
                <DayView
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  onEventClick={handleEventClick}
                />
              )}
              {viewMode === "month" && (
                <MonthView
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  onEventClick={handleEventClick}
                  onDayClick={handleDayClick}
                />
              )}
            </div>
          </div>
        </main>

        <EventDrawer
          isOpen={drawerOpen}
          event={selectedEvent}
          isNew={isNewEvent}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onDuplicate={handleEventDuplicate}
        />
      </div>
    </TooltipProvider>
  );
};

export default DeanSchedulingPage;
