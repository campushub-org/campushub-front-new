import React, { useState, useCallback, useEffect } from "react";
import {
  Loader2,
  Layout,
  Clock,
  MapPin,
  User as UserIcon,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { WeekViewEditable } from "@/components/schedule/week-view-editable";
import { DayView } from "@/components/schedule/day-view";
import { MonthView } from "@/components/schedule/month-view";
import { ScheduleSidebar } from "@/components/schedule/schedule-sidebar";
import {
  ScheduleEvent,
  SchedulePlan,
  CourseType,
  courseTypeColors,
  courseTypeLabels,
} from "@/lib/schedule-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ViewMode = "week" | "day" | "month";

const PlanningPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>([
    "lecture",
    "td",
    "tp",
    "exam",
    "meeting",
  ]);
  const [selectedProfessors] = useState<string[]>([]);
  const [selectedRooms] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["L1"]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SchedulePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Initial fetch: plans only (no users/salles since the read-only sidebar
  // hides those filters in 'readonly' mode).
  const fetchInitialData = useCallback(async () => {
    try {
      const plansRes = await api.get<SchedulePlan[]>(
        "/campushub-scheduling-service/api/scheduling/plans"
      );
      if (Array.isArray(plansRes.data) && plansRes.data.length > 0) {
        setPlans(plansRes.data);
        const activePlan =
          plansRes.data.find((p) => p.status === "ACTIVE") || plansRes.data[0];
        setSelectedPlanId(activePlan.id);
        if (activePlan.level) setSelectedLevels([activePlan.level]);
        fetchEvents(activePlan.id);
      } else {
        setSelectedPlanId("");
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  }, []);

  const fetchEvents = useCallback(async (planId?: string) => {
    if (!planId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<ScheduleEvent[]>(
        `/campushub-scheduling-service/api/scheduling/events?planId=${planId}`
      );
      setEvents(Array.isArray(res.data) ? res.data : []);
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

  // Same overrider trick as DeanSchedulingPage to escape the parent padding.
  const layoutOverrider =
    "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]";

  const handlePrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "day") d.setDate(d.getDate() - 1);
      else if (viewMode === "week") d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "day") d.setDate(d.getDate() + 1);
      else if (viewMode === "week") d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [viewMode]);

  const handleToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleTypeToggle = useCallback((type: CourseType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleLevelToggle = useCallback((level: string) => {
    setSelectedLevels((prev) => {
      if (prev.includes(level)) {
        return prev.length > 1 ? prev.filter((l) => l !== level) : prev;
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
  }, []);

  // PDF export — same format as DeanSchedulingPage.
  const handleExportPDF = useCallback(() => {
    if (!selectedPlanId) {
      toast.error("Aucune programmation sélectionnée");
      return;
    }
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text(`Emploi du Temps : ${plan.name}`, 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Année : ${plan.academicYear} | Semestre : ${plan.semester} | Niveau : ${plan.level}`,
      14,
      28
    );

    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const timeSlots = [
      { label: "07h00 - 09h55", start: 7.0, end: 9.92, pause: "09h55 - 10h05" },
      { label: "10h05 - 12h55", start: 10.08, end: 12.92, pause: "12h55 - 13h05" },
      { label: "13h05 - 15h55", start: 13.08, end: 15.92, pause: "15h55 - 16h05" },
      { label: "16h05 - 18h55", start: 16.08, end: 18.92, pause: null },
    ];

    const tableData: unknown[][] = [];
    timeSlots.forEach((slot) => {
      const row: unknown[] = [slot.label];
      for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
        const slotEvents = events.filter((e) => {
          const [sH, sM] = e.startTime.split(":").map(Number);
          const [eH, eM] = e.endTime.split(":").map(Number);
          const evStart = sH + sM / 60;
          const evEnd = eH + eM / 60;
          return (
            e.day === dayIndex &&
            ((evStart >= slot.start && evStart < slot.end) ||
              (evEnd > slot.start && evEnd <= slot.end) ||
              (evStart <= slot.start && evEnd >= slot.end))
          );
        });

        if (slotEvents.length === 0) {
          row.push("");
        } else {
          const text = slotEvents
            .map((e) => {
              const room =
                e.room &&
                !["N/A", "NULL", "UNDEFINED", "NON ASSIGNÉ", "NON ASSIGNE"].includes(
                  e.room.toUpperCase()
                )
                  ? e.room
                  : "";
              const prof = e.professor
                ? e.professor
                    .split(",")
                    .map((p) => p.trim().split(" ")[0])
                    .join("/")
                : "";
              let code = e.subjectCode || e.title;
              if (e.type === "tp") code = `TP-${code}`;
              else if (e.type === "td") code = `TD-${code}`;
              else if (e.type === "exam") code = `CC-${code}`;
              return [
                code.toUpperCase(),
                room,
                prof,
                e.type !== "lecture" ? `${e.startTime} - ${e.endTime}` : "",
              ]
                .filter((l) => l !== "")
                .join("\n");
            })
            .join("\n\n");
          row.push(text);
        }
      }
      tableData.push(row);

      if (slot.pause) {
        tableData.push([
          {
            content: "PAUSE 10 MIN",
            colSpan: 7,
            styles: {
              halign: "center",
              fillColor: [241, 245, 249],
              fontStyle: "bold",
              textColor: [71, 85, 105],
              fontSize: 7,
              cellPadding: 1,
            },
          },
        ]);
      }
    });

    autoTable(doc, {
      startY: 35,
      head: [["HEURES", ...days.map((d) => d.toUpperCase())]],
      body: tableData as never,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 10,
        halign: "center",
        fontStyle: "bold",
        cellPadding: 4,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
        overflow: "linebreak",
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: "bold", fillColor: [241, 245, 249] },
      },
    });

    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `CampusHub - Document généré le ${new Date().toLocaleDateString("fr-FR")}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(`planning_${plan.level}_${plan.name.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF téléchargé");
  }, [selectedPlanId, plans, events]);

  const eventTypeColor = selectedEvent
    ? courseTypeColors[selectedEvent.type]
    : undefined;
  const eventTypeLabel = selectedEvent
    ? courseTypeLabels[selectedEvent.type]
    : "";

  return (
    <TooltipProvider>
      {/* Same horizontal-scroll fix as DeanSchedulingPage */}
      <style>{`
        html, body { overflow-x: hidden !important; width: 100%; position: relative; }
        main { overflow-x: hidden !important; }
      `}</style>

      <div
        className={cn(
          "flex h-[calc(100vh-theme(spacing.16))] bg-background overflow-hidden border-t border-border/50",
          layoutOverrider
        )}
      >
        {/* Sidebar Interne (Filtres) — exact same wrapper as DeanSchedulingPage */}
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
                const plan = plans.find((p) => p.id === id);
                if (plan && plan.level) setSelectedLevels([plan.level]);
                fetchEvents(id);
              }}
              onRefresh={() => fetchEvents(selectedPlanId)}
              selectedTypes={selectedTypes}
              allProfessors={[]}
              allRooms={[]}
              selectedProfessors={selectedProfessors}
              selectedRooms={selectedRooms}
              selectedLevels={selectedLevels}
              onProfessorToggle={() => undefined}
              onRoomToggle={() => undefined}
              onLevelToggle={handleLevelToggle}
              isLoading={loading}
              mode="readonly"
            />
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          {/* Section Header & Toolbar — identical to DeanSchedulingPage */}
          <div className="p-4 lg:p-6 pb-2 space-y-4 shrink-0 bg-gradient-hero/10 backdrop-blur-sm z-10 border-b border-sidebar-border/40 shadow-soft rounded-b-lg">
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
                  <h1 className="text-2xl font-extrabold text-sidebar-primary tracking-tight">
                    Mon planning
                  </h1>
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {/* Contrôles du Calendrier (Date, Vue) — same wrapper */}
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
                onExportPDF={handleExportPDF}
                mode="readonly"
              />
            </div>
          </div>

          {/* Grille du Calendrier */}
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
                  isEditMode={false}
                  isPlanActive={!!selectedPlanId}
                  onEventClick={handleEventClick}
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
                  isEditMode={false}
                  isPlanActive={!!selectedPlanId}
                  onEventClick={handleEventClick}
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

        {/* Event detail modal (read-only) */}
        <Dialog
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        >
          <DialogContent className="sm:max-w-md">
            {selectedEvent && (
              <>
                <DialogHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        eventTypeColor?.bg
                      )}
                    />
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {eventTypeLabel}
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
                  {selectedEvent.description && (
                    <DialogDescription className="text-sm">
                      {selectedEvent.description}
                    </DialogDescription>
                  )}
                </DialogHeader>
                <div className="space-y-3 pt-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-20">Horaire</span>
                    <span className="font-medium">
                      {selectedEvent.startTime} – {selectedEvent.endTime}
                    </span>
                  </div>
                  {selectedEvent.professor && (
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground w-20">Enseignant</span>
                      <span className="font-medium">{selectedEvent.professor}</span>
                    </div>
                  )}
                  {selectedEvent.room && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground w-20">Salle</span>
                      <span className="font-medium">{selectedEvent.room}</span>
                    </div>
                  )}
                  {selectedEvent.groupName && (
                    <div className="flex items-center gap-3">
                      <UsersIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground w-20">Groupe</span>
                      <span className="font-medium">{selectedEvent.groupName}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PlanningPage;
