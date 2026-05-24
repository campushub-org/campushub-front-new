import React, { useState, useCallback, useEffect } from "react";
import { 
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
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
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type ViewMode = "week" | "day" | "month";

const DeanSchedulingPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>([
    "lecture", "td", "tp", "exam", "meeting"
  ]);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["L1"]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  
  // Real data and loading state
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SchedulePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>(sampleEvents);
  const [allProfessors, setAllProfessors] = useState<string[]>([]);
  const [allRooms, setAllRooms] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [history, setHistory] = useState<ScheduleEvent[][]>([sampleEvents]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Fetch real events from API
  const fetchEvents = useCallback(async (planId?: string) => {
    setLoading(true);
    try {
      const url = planId 
        ? `/campushub-scheduling-service/api/scheduling/events?planId=${planId}`
        : "/campushub-scheduling-service/api/scheduling/events";

      const [eventsRes, teachersRes, roomsRes, plansRes] = await Promise.all([
        api.get<ScheduleEvent[]>(url),
        api.get<any[]>("/campushub-user-service/api/users"),
        api.get<any[]>("/campushub-salle-service/api/salles"),
        api.get<SchedulePlan[]>("/campushub-scheduling-service/api/scheduling/plans")
      ]);

      if (eventsRes.data) {
        setEvents(eventsRes.data);
        setHistory([eventsRes.data]);
        setHistoryIndex(0);
      }

      if (plansRes.data) {
        setPlans(plansRes.data);
        if (!planId && plansRes.data.length > 0) {
          const activePlan = plansRes.data.find(p => p.status === "ACTIVE") || plansRes.data[0];
          setSelectedPlanId(activePlan.id);
        }
      }

      // Filter and map names
      if (teachersRes.data) {
        const profNames = teachersRes.data
          .filter(u => u.role === "TEACHER")
          .map(u => u.fullName)
          .sort();
        setAllProfessors(profNames);
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
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const handleEventSave = useCallback((event: ScheduleEvent | ScheduleEvent[]) => {
    let newEvents: ScheduleEvent[];
    const generateId = () => crypto.randomUUID();
    
    if (Array.isArray(event)) {
      if (isNewEvent) {
        const seriesEvents = event.map(e => ({ ...e, id: generateId() }));
        newEvents = [...events, ...seriesEvents];
      } else {
        newEvents = events.map(e => {
          const updated = event.find(ev => ev.id === e.id);
          return updated || e;
        });
      }
    } else {
      if (isNewEvent) {
        newEvents = [...events, { ...event, id: generateId() }];
      } else {
        newEvents = events.map(e => e.id === event.id ? event : e);
      }
    }
    
    setEvents(newEvents);
    updateHistory(newEvents);
    setDrawerOpen(false);
    setSelectedEvent(null);
  }, [events, isNewEvent, updateHistory]);

  const handleEventDelete = useCallback((eventId: string) => {
    const newEvents = events.filter(e => e.id !== eventId);
    setEvents(newEvents);
    updateHistory(newEvents);
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

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const response = await api.post("/campushub-scheduling-service/api/scheduling/plans/import", json);
        toast.success("Plan importé avec succès");
        fetchEvents(response.data.id);
      } catch (err) {
        console.error("Import failed:", err);
        toast.error("Échec de l'importation");
      }
    };
    reader.readAsText(file);
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    
    try {
      const response = await api.post("/campushub-scheduling-service/api/scheduling/plans", {
        name: newPlanName,
        status: "DRAFT",
        academicYear: "2024-2025", // Valeurs par défaut pour l'instant
        semester: 1,
        level: selectedLevels[0] || "L1"
      });
      toast.success("Nouveau plan créé");
      setIsCreatePlanOpen(false);
      setNewPlanName("");
      fetchEvents(response.data.id);
    } catch (err) {
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <TooltipProvider>
      {/* Fix pour bloquer le slide horizontal de la navbar et de la page */}
      <style>{`
        html, body { overflow-x: hidden !important; width: 100%; position: relative; }
        main { overflow-x: hidden !important; }
      `}</style>

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
              plans={plans}
              selectedPlanId={selectedPlanId}
              onPlanChange={(id) => {
                setSelectedPlanId(id);
                fetchEvents(id);
              }}
              onAddPlan={() => {
                setIsCreatePlanOpen(true);
              }}
              onImportPlan={() => {
                document.getElementById('import-plan-input')?.click();
              }}
              onExportPlan={(id) => {
                const plan = plans.find(p => p.id === id);
                if (!plan) return;

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                  ...plan,
                  events: events.filter(e => e.planId === id)
                }, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `plan_${plan.name.replace(/\s+/g, '_')}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                toast.success("Plan exporté avec succès");
              }}
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
                      className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-foreground"
                      onClick={() => navigate('/dashboard/dean/planning-hub')}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Retour au Hub</TooltipContent>
                </Tooltip>

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
                  <h1 className="text-xl font-semibold tracking-tight">Planning de l'établissement</h1>
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
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
                  hasConflicts={false}
                  />
              </div>

              {/* Barre de recherche supprimée */}
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
                  selectedProfessors={selectedProfessors}
                  selectedRooms={selectedRooms}
                  selectedLevels={selectedLevels}
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

        <EventDrawer
          isOpen={drawerOpen}
          event={selectedEvent}
          workingDate={currentDate}
          isNew={isNewEvent}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onDuplicate={handleEventDuplicate}
          />

          <input 
          type="file" 
          id="import-plan-input" 
          className="hidden" 
          accept=".json" 
          onChange={handleImportFile} 
          />

          <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Programmation</DialogTitle>
              <DialogDescription>
                Créez une nouvelle version de l'emploi du temps. Elle sera initialement en mode brouillon (Draft).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2 text-left">
                <Label htmlFor="name">Nom de la version</Label>
                <Input
                  id="name"
                  placeholder="Ex: Semestre 1 - Version B"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>Annuler</Button>
              <Button onClick={handleCreatePlan} disabled={!newPlanName.trim()}>Créer la version</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
          </div>    </TooltipProvider>
  );
};

export default DeanSchedulingPage;
