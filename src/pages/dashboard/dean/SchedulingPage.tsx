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
import { PlanManagementDrawer } from "@/components/schedule/plan-management-drawer";
import { ScheduleEvent, SchedulePlan, CourseType } from "@/lib/schedule-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Download, FileJson, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [plans, setPlans] = useState<SchedulePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isPlanDrawerOpen, setIsPlanDrawerOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<SchedulePlan | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  
  // Edit mode state
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

  // 1. Fetch des données de base (Plans, Profs, Salles)
  const fetchInitialData = useCallback(async () => {
    try {
      const [teachersRes, roomsRes, plansRes] = await Promise.all([
        api.get<any[]>("/campushub-user-service/api/users"),
        api.get<any[]>("/campushub-salle-service/api/salles"),
        api.get<SchedulePlan[]>("/campushub-scheduling-service/api/scheduling/plans")
      ]);

      if (plansRes.data && Array.isArray(plansRes.data)) {
        setPlans(plansRes.data);
        if (plansRes.data.length > 0) {
          const activePlan = plansRes.data.find(p => p.status === "ACTIVE") || plansRes.data[0];
          setSelectedPlanId(activePlan.id);
          if (activePlan.level) setSelectedLevels([activePlan.level]);
          // Une fois le plan identifié, on charge ses événements
          fetchEvents(activePlan.id);
        } else {
          // Aucun plan en base : on vide tout
          setSelectedPlanId("");
          setEvents([]);
        }
      }

      if (teachersRes.data && Array.isArray(teachersRes.data)) {
        const profNames = teachersRes.data.filter(u => u.role === "TEACHER").map(u => u.fullName).sort();
        setAllProfessors(profNames);
      }

      if (roomsRes.data && Array.isArray(roomsRes.data)) {
        const roomNames = roomsRes.data.map(r => r.nom).sort();
        setAllRooms(roomNames);
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      toast.error("Erreur de connexion aux services");
    }
  }, []);

  // 2. Fetch des événements (uniquement si un planId est fourni)
  const fetchEvents = useCallback(async (planId?: string) => {
    if (!planId || planId === "" || planId === "none") {
      setEvents([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<ScheduleEvent[]>(`/campushub-scheduling-service/api/scheduling/events?planId=${planId}`);
      if (response.data) {
        setEvents(response.data);
        setHistory([response.data]);
        setHistoryIndex(0);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

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
    if (!selectedPlanId) {
      toast.error("Veuillez d'abord sélectionner ou créer une programmation.");
      setIsPlanDrawerOpen(true); // Proposer d'en créer une
      return;
    }

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
      planId: selectedPlanId // Lier au plan courant
    });
    setIsNewEvent(true);
    setDrawerOpen(true);
  }, [selectedPlanId]);

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

  const handleExportJSON = useCallback(() => {
    if (!selectedPlanId) {
      toast.error("Aucun plan sélectionné pour l'exportation.");
      return;
    }
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    const exportData = {
      planMetadata: {
        name: plan.name,
        academicYear: plan.academicYear,
        semester: plan.semester,
        level: plan.level,
        status: plan.status
      },
      events: events.map(e => ({
        title: e.title,
        type: e.type,
        professor: e.professor,
        room: e.room,
        startTime: e.startTime,
        endTime: e.endTime,
        day: e.day,
        description: e.description,
        groupName: e.groupName,
        teacherId: e.teacherId,
        roomId: e.roomId,
        subjectCode: e.subjectCode
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planning_${plan.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Exportation JSON réussie");
  }, [selectedPlanId, plans, events]);

  const handleExportPDF = useCallback(() => {
    if (!selectedPlanId) {
      toast.error("Aucun plan sélectionné pour l'exportation PDF.");
      return;
    }
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    // Paysage pour avoir plus de place pour les jours en colonnes
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text(`Emploi du Temps : ${plan.name}`, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Année : ${plan.academicYear} | Semestre : ${plan.semester} | Niveau : ${plan.level}`, 14, 28);
    
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const timeSlotsToExport = [
      { label: "07h00 - 10h00", start: 7, end: 10 },
      { label: "10h00 - 13h00", start: 10, end: 13 },
      { label: "13h00 - 16h00", start: 13, end: 16 },
      { label: "16h00 - 19h00", start: 16, end: 19 }
    ];

    const tableData: any[][] = timeSlotsToExport.map(slot => {
      const row = [slot.label];

      for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
        // Trouver les événements qui se déroulent pendant cette plage de 3h
        const slotEvents = events.filter(e => {
          const startHour = parseInt(e.startTime.split(':')[0]);
          const startMin = parseInt(e.startTime.split(':')[1]);
          const eventStartTimeDec = startHour + startMin/60;
          
          const endHour = parseInt(e.endTime.split(':')[0]);
          const endMin = parseInt(e.endTime.split(':')[1]);
          const eventEndTimeDec = endHour + endMin/60;

          // Un événement est dans ce slot s'il commence dedans ou s'il couvre une partie significative
          return e.day === dayIndex && 
                 ((eventStartTimeDec >= slot.start && eventStartTimeDec < slot.end) ||
                  (eventEndTimeDec > slot.start && eventEndTimeDec <= slot.end) ||
                  (eventStartTimeDec <= slot.start && eventEndTimeDec >= slot.end));
        });

        if (slotEvents.length > 0) {
          const text = slotEvents.map(e => {
            const roomInfo = e.room || "N/A";
            const profName = e.professor ? e.professor.trim().split(' ')[0].toUpperCase() : "";
            
            let codeDisplay = e.subjectCode || e.title;
            if (e.type === 'tp') codeDisplay = `TP-${codeDisplay}`;
            else if (e.type === 'td') codeDisplay = `TD-${codeDisplay}`;
            else if (e.type === 'exam') codeDisplay = `CC-${codeDisplay}`;

            // Filtrer les lignes vides (si profName est vide)
            return [
              codeDisplay.toUpperCase(),
              roomInfo,
              profName,
              `${e.startTime} - ${e.endTime}`
            ].filter(line => line !== "").join("\n");
          }).join("\n\n");
          row.push(text);
        } else {
          row.push("");
        }
      }
      return row;
    });

    autoTable(doc, {
      startY: 35,
      head: [['HEURES', ...days.map(d => d.toUpperCase())]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 41, 59], // Darker theme like ERP
        textColor: 255, 
        fontSize: 10, 
        halign: 'center',
        fontStyle: 'bold',
        cellPadding: 4
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3, 
        valign: 'middle', 
        halign: 'center',
        overflow: 'linebreak',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', fillColor: [241, 245, 249] }
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index !== 0) {
          if (data.cell.text.length > 0 && data.cell.text[0] !== "") {
             data.cell.styles.fillColor = [248, 250, 252];
             data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `CampusHub - Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }

    doc.save(`planning_${plan.level}_${plan.name.replace(/\s+/g, '_')}.pdf`);
    toast.success("Génération du calendrier PDF réussie");
  }, [selectedPlanId, plans, events]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.events || !Array.isArray(json.events)) {
          toast.error("Format de fichier invalide. Le fichier doit contenir un tableau 'events'.");
          return;
        }
        setImportData(json);
        setIsImportDialogOpen(true);
      } catch (err) {
        console.error("Import failed:", err);
        toast.error("Échec de la lecture du fichier JSON");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const executeImport = async (mode: 'merge' | 'new') => {
    if (!importData) return;
    setLoading(true);
    try {
      if (mode === 'new') {
        const metadata = importData.planMetadata || {
          name: "Import " + new Date().toLocaleDateString(),
          academicYear: "2025-2026",
          semester: 1,
          level: "L1"
        };
        
        // 1. Créer le plan
        const planRes = await api.post("/campushub-scheduling-service/api/scheduling/plans", {
          ...metadata,
          status: 'DRAFT'
        });
        const newPlanId = planRes.data.id;

        // 2. Injecter les événements
        const eventsToCreate = importData.events.map((e: any) => ({
          ...e,
          planId: newPlanId,
          id: undefined // Le backend générera les IDs
        }));

        await api.post(`/campushub-scheduling-service/api/scheduling/batch-save`, eventsToCreate);
        
        toast.success("Nouveau plan créé et importé avec succès");
        fetchInitialData(); // Recharger tout pour voir le nouveau plan
      } else {
        if (!selectedPlanId) {
          toast.error("Aucun plan sélectionné pour la fusion.");
          return;
        }
        
        const eventsToCreate = importData.events.map((e: any) => ({
          ...e,
          planId: selectedPlanId,
          id: undefined
        }));

        await api.post(`/campushub-scheduling-service/api/scheduling/batch-save`, eventsToCreate);
        toast.success("Événements fusionnés dans le plan actuel");
        fetchEvents(selectedPlanId);
      }
    } catch (err) {
      console.error("Import execution failed:", err);
      toast.error("Erreur lors de l'importation");
    } finally {
      setLoading(false);
      setIsImportDialogOpen(false);
      setImportData(null);
    }
  };

  const handleSavePlan = async (planData: Partial<SchedulePlan>) => {
    setIsSavingPlan(true);
    try {
      const isNew = !planData.id;
      let response;
      
      if (isNew) {
        response = await api.post("/campushub-scheduling-service/api/scheduling/plans", planData);
        toast.success("Nouvelle programmation créée");
      } else {
        response = await api.put(`/campushub-scheduling-service/api/scheduling/plans/${planData.id}`, planData);
        toast.success("Programmation mise à jour");
      }
      
      // Si le plan est activé
      if (planData.status === 'ACTIVE' && !isNew) {
          await api.post(`/campushub-scheduling-service/api/scheduling/plans/${planData.id}/activate`);
      }

      setIsPlanDrawerOpen(false);
      fetchEvents(response.data.id);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement de la programmation");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Supprimer cette programmation et tous ses cours ?")) return;
    
    try {
      await api.delete(`/campushub-scheduling-service/api/scheduling/plans/${id}`);
      toast.success("Programmation supprimée");
      setIsPlanDrawerOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
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
                if (Array.isArray(plans)) {
                  const plan = plans.find(p => p.id === id);
                  if (plan && plan.level) {
                    setSelectedLevels([plan.level]);
                  }
                }
                fetchEvents(id);
              }}
              onAddPlan={() => {
                setPlanToEdit(null);
                setIsPlanDrawerOpen(true);
              }}
              onEditPlan={(id) => {
                if (Array.isArray(plans)) {
                  const plan = plans.find(p => p.id === id);
                  if (plan) {
                      setPlanToEdit(plan);
                      setIsPlanDrawerOpen(true);
                  }
                }
              }}
              onImportPlan={() => {
                document.getElementById('import-plan-input')?.click();
              }}
              onExportPlan={(id) => {
                if (!Array.isArray(plans)) return;
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
              onRefresh={() => fetchEvents(selectedPlanId)}
            />
          </div>
        </aside>

        {/* Contenu principal du planning */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          
          {/* Section Header & Toolbar */}
          <div className="p-4 lg:p-6 pb-2 space-y-4 shrink-0 bg-gradient-hero/10 backdrop-blur-sm z-10 border-b border-sidebar-border/40 shadow-soft rounded-b-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
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
                  <h1 className="text-2xl font-extrabold text-sidebar-primary tracking-tight">Planning de l'établissement</h1>
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
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onImportClick={() => document.getElementById('import-json-input')?.click()}
              />
              <input 
                id="import-json-input"
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleImportFile} 
              />
            </div>
          </div>

          {/* Dialogues et Overlays */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-2xl border-sidebar-border/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-black tracking-tighter text-sidebar-primary">Confirmer l'importation</DialogTitle>
                <DialogDescription className="text-sidebar-foreground/60">
                  Vous allez importer un planning contenant <span className="font-bold text-primary">{importData?.events?.length}</span> événements.
                  {importData?.planMetadata && (
                    <div className="mt-4 p-4 bg-sidebar-accent/50 rounded-xl border border-sidebar-border/30 text-sm">
                      <p className="flex justify-between"><strong>Nom du plan:</strong> <span>{importData.planMetadata.name}</span></p>
                      <p className="flex justify-between"><strong>Niveau:</strong> <span>{importData.planMetadata.level}</span></p>
                      <p className="flex justify-between"><strong>Semestre:</strong> <span>{importData.planMetadata.semester}</span></p>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <p className="text-sm font-bold text-sidebar-foreground/80 uppercase tracking-widest text-center">Choix de la méthode</p>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-4 px-5 flex-col items-start gap-1 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    onClick={() => executeImport('new')}
                  >
                    <span className="font-black text-sidebar-primary group-hover:text-primary transition-colors">Créer une nouvelle programmation</span>
                    <span className="text-xs text-sidebar-foreground/60">Un nouveau plan indépendant sera créé avec ces données.</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-4 px-5 flex-col items-start gap-1 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    onClick={() => executeImport('merge')}
                    disabled={!selectedPlanId}
                  >
                    <span className="font-black text-sidebar-primary group-hover:text-primary transition-colors">Fusionner avec le plan actuel</span>
                    <span className="text-xs text-sidebar-foreground/60">Les événements seront ajoutés au plan "<span className="italic">{plans.find(p => p.id === selectedPlanId)?.name}</span>".</span>
                  </Button>
                </div>
              </div>
              <DialogFooter className="sm:justify-start gap-2">
                <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setIsImportDialogOpen(false)}>
                  Annuler
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Grille du Calendrier - OCCUPE TOUT LE RESTE DE L'ESPACE */}
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-auto bg-card/80 p-6 rounded-lg shadow-medium scrollbar-thin scrollbar-thumb-sidebar-border">
              {viewMode === "week" && (
                <WeekViewEditable
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  selectedProfessors={selectedProfessors}
                  selectedRooms={selectedRooms}
                  selectedLevels={selectedLevels}
                  isEditMode={isEditMode}
                  isPlanActive={!!selectedPlanId}
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
                  isPlanActive={!!selectedPlanId}
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
                  isPlanActive={!!selectedPlanId}
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
          planId={selectedPlanId}
          planLevel={Array.isArray(plans) ? plans.find(p => p.id === selectedPlanId)?.level : undefined}
          planSemester={Array.isArray(plans) ? plans.find(p => p.id === selectedPlanId)?.semester : undefined}
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

          <PlanManagementDrawer
            open={isPlanDrawerOpen}
            onOpenChange={setIsPlanDrawerOpen}
            plan={planToEdit}
            onSave={handleSavePlan}
            onDelete={handleDeletePlan}
            isSaving={isSavingPlan}
          />
          </div>    </TooltipProvider>
  );
};

export default DeanSchedulingPage;
