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
import { ScheduleEvent, CourseType } from "@/lib/schedule-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ViewMode = "week" | "day" | "month";

const UnifiedSchedulingPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>([
    "lecture", "td", "tp", "exam", "meeting"
  ]);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]); // Pour les profs on laisse vide par défaut ou on met tout
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Real data and loading state
  const [loading, setLoading] = useState(false);
  
  // Edit mode state (pour les profs, c'est désactivé par défaut)
  const [isEditMode, setIsEditMode] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [allProfessors, setAllProfessors] = useState<string[]>([]);
  const [allRooms, setAllRooms] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [history, setHistory] = useState<ScheduleEvent[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Fetch real events from API
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, teachersRes, roomsRes] = await Promise.all([
        api.get<ScheduleEvent[]>("/campushub-scheduling-service/api/scheduling/events"),
        api.get<any[]>("/campushub-user-service/api/users"),
        api.get<any[]>("/campushub-salle-service/api/salles")
      ]);

      if (eventsRes.data) {
        setEvents(eventsRes.data);
        setHistory([eventsRes.data]);
        setHistoryIndex(0);
      }

      // Filter and map names
      if (teachersRes.data) {
        const profNames = teachersRes.data
          .filter(u => u.role === "TEACHER")
          .map(u => u.fullName)
          .sort();
        setAllProfessors(profNames);

        // Auto-sélectionner l'enseignant connecté si possible
        const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (user && user.fullName && selectedProfessors.length === 0) {
            setSelectedProfessors([user.fullName]);
        }
      }

      if (roomsRes.data) {
        const roomNames = roomsRes.data
          .map(r => r.nom)
          .sort();
        setAllRooms(roomNames);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProfessors.length]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const handleProfessorToggle = useCallback((professor: string) => {
    setSelectedProfessors(prev =>
      prev.includes(professor)
        ? prev.filter(p => p !== professor)
        : [...prev, professor]
    );
  }, []);

  const handleRoomToggle = useCallback((room: string) => {
    setSelectedRooms(prev =>
      prev.includes(room)
        ? prev.filter(r => r !== room)
        : [...prev, room]
    );
  }, []);

  const handleLevelToggle = useCallback((level: string) => {
    setSelectedLevels(prev => {
      if (prev.includes(level)) {
        return prev.length > 1 ? prev.filter(l => l !== level) : prev;
      }
      return [...prev, level];
    });
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setViewMode("day");
  }, []);

  const handleEventClick = useCallback((event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsNewEvent(false);
    setDrawerOpen(true);
  }, []);

  const handleCreateEvent = useCallback((day: number, startTime: string) => {
    // Les profs ne peuvent pas encore créer via la grille, mais on prépare pour la réservation
    const [hours] = startTime.split(":").map(Number);
    const endHour = Math.min(hours + 2, 19);
    
    setSelectedEvent({
      id: `new-${Date.now()}`,
      title: "Nouvelle réservation",
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

  const handleEventSave = useCallback((event: ScheduleEvent | ScheduleEvent[]) => {
    fetchEvents(); // Rafraîchir les données
    setDrawerOpen(false);
    setSelectedEvent(null);
  }, [fetchEvents]);

  const handleEventDelete = useCallback((eventId: string) => {
    fetchEvents();
    setDrawerOpen(false);
    setSelectedEvent(null);
  }, [fetchEvents]);

  return (
    <TooltipProvider>
      <style>{`
        html, body { overflow-x: hidden !important; width: 100%; position: relative; }
        main { overflow-x: hidden !important; }
      `}</style>

      <div className={cn(
        "flex h-[calc(100vh-theme(spacing.16))] bg-background overflow-hidden border-t border-border/50",
        layoutOverrider
      )}>
        {/* Sidebar Interne (Filtres) */}
        <aside 
          className={cn(
            "shrink-0 border-r border-border bg-card/5 transition-all duration-300 ease-in-out relative h-full",
            sidebarOpen ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden border-r-0"
          )}
        >
          <div className="w-72 p-6 h-full overflow-y-auto">
            <ScheduleSidebar 
              events={events} 
              selectedTypes={selectedTypes}
              allProfessors={allProfessors}
              allRooms={allRooms}
              selectedProfessors={selectedProfessors}
              selectedRooms={selectedRooms}
              selectedLevels={selectedLevels}
              onProfessorToggle={handleProfessorToggle}
              onRoomToggle={handleRoomToggle}
              onLevelToggle={handleLevelToggle}
              isLoading={loading}
              onRefresh={fetchEvents}
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
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight">Mon Emploi du Temps</h1>
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>

              <div className="flex items-center gap-3">
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
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-auto bg-card scrollbar-thin scrollbar-thumb-border">
              {viewMode === "week" && (
                <WeekViewEditable
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  selectedProfessors={selectedProfessors}
                  selectedRooms={selectedRooms}
                  selectedLevels={selectedLevels}
                  isEditMode={isEditMode}
                  onEventClick={handleEventClick}
                  onEventUpdate={() => {}} // Les profs ne peuvent pas drag-and-drop pour l'instant
                  onCreateEvent={handleCreateEvent}
                />
              )}
              {viewMode === "day" && (
                <DayView
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  selectedProfessors={selectedProfessors}
                  selectedRooms={selectedRooms}
                  selectedLevels={selectedLevels}
                  isEditMode={isEditMode}
                  onEventClick={handleEventClick}
                  onCreateEvent={handleCreateEvent}
                />
              )}
              {viewMode === "month" && (
                <MonthView
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  selectedProfessors={selectedProfessors}
                  selectedRooms={selectedRooms}
                  selectedLevels={selectedLevels}
                  onEventClick={handleEventClick}
                  onDayClick={handleDayClick}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <EventDrawer
        isOpen={drawerOpen}
        event={selectedEvent}
        isNew={isNewEvent}
        onClose={() => setDrawerOpen(false)}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
      />
    </TooltipProvider>
  );
};

export default UnifiedSchedulingPage;
