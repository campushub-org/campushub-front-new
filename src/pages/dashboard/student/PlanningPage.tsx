import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  CalendarDays,
  MapPin,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WeekViewEditable } from "@/components/schedule/week-view-editable";
import { DayView } from "@/components/schedule/day-view";
import { MonthView } from "@/components/schedule/month-view";
import { ScheduleEvent, SchedulePlan, CourseType } from "@/lib/schedule-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

type ViewMode = "week" | "day" | "month";

const COURSE_TYPES: { value: CourseType; labelKey: string; color: string }[] = [
  { value: "lecture", labelKey: "planning.type_lecture", color: "bg-blue-500" },
  { value: "td", labelKey: "planning.type_td", color: "bg-emerald-500" },
  { value: "tp", labelKey: "planning.type_tp", color: "bg-purple-500" },
  { value: "exam", labelKey: "planning.type_exam", color: "bg-red-500" },
  { value: "meeting", labelKey: "planning.type_meeting", color: "bg-amber-500" },
];

const LEVELS = ["L1", "L2", "L3", "M1", "M2"];

const PlanningPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  // Neutralise les paddings du DashboardLayout parent pour prendre toute la largeur.
  const layoutOverrider =
    "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>(
    COURSE_TYPES.map((c) => c.value)
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["L1"]);
  const [plans, setPlans] = useState<SchedulePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Initial plans fetch (public endpoint, works without token)
  useEffect(() => {
    const init = async () => {
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
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };
    init();
  }, []);

  // Events fetch on plan change
  useEffect(() => {
    if (!selectedPlanId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    api
      .get<ScheduleEvent[]>(
        `/campushub-scheduling-service/api/scheduling/events?planId=${selectedPlanId}`
      )
      .then((res) => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [selectedPlanId]);

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

  const handleTypeToggle = (type: CourseType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleLevelToggle = (level: string) => {
    setSelectedLevels((prev) => {
      if (prev.includes(level)) {
        return prev.length > 1 ? prev.filter((l) => l !== level) : prev;
      }
      return [...prev, level];
    });
  };

  // PDF export — same layout/format as the dean export but read-only context.
  const handleExportPDF = useCallback(() => {
    if (!selectedPlanId) {
      toast.error(t("planning.pdf_no_plan"));
      return;
    }
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 99);
    doc.text(`${t("planning.pdf_title")} : ${plan.name}`, 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `${plan.academicYear} • S${plan.semester} • ${plan.level}`,
      14,
      26
    );

    const days = [
      t("common.days.monday"),
      t("common.days.tuesday"),
      t("common.days.wednesday"),
      t("common.days.thursday"),
      t("common.days.friday"),
      t("common.days.saturday"),
    ];
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
                ? e.professor.split(",").map((p) => p.trim().split(" ")[0]).join("/")
                : "";
              let code = e.subjectCode || e.title;
              if (e.type === "tp") code = `TP-${code}`;
              else if (e.type === "td") code = `TD-${code}`;
              else if (e.type === "exam") code = `EX-${code}`;
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
            content: `PAUSE • ${slot.pause}`,
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
      startY: 32,
      head: [[t("planning.pdf_hours_col"), ...days.map((d) => d.toUpperCase())]],
      body: tableData as never,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 99],
        textColor: 255,
        fontSize: 10,
        halign: "center",
        fontStyle: "bold",
        cellPadding: 3,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        valign: "middle",
        halign: "center",
        overflow: "linebreak",
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: "bold", fillColor: [241, 245, 249] },
      },
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `CampusHub • ${new Date().toLocaleDateString(i18n.language === "fr" ? "fr-FR" : "en-US")}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: "center" }
    );

    doc.save(`planning_${plan.level}_${plan.name.replace(/\s+/g, "_")}.pdf`);
    toast.success(t("planning.pdf_success"));
  }, [selectedPlanId, plans, events, t, i18n.language]);

  const formatDateHeader = () => {
    const opts: Intl.DateTimeFormatOptions =
      viewMode === "month"
        ? { month: "long", year: "numeric" }
        : viewMode === "week"
        ? { day: "numeric", month: "long", year: "numeric" }
        : { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    return currentDate.toLocaleDateString(
      i18n.language === "fr" ? "fr-FR" : "en-US",
      opts
    );
  };

  const eventTypeMeta = selectedEvent
    ? COURSE_TYPES.find((c) => c.value === selectedEvent.type)
    : undefined;

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-7rem)] bg-background border-t border-border/50 overflow-hidden",
        layoutOverrider
      )}
    >
      {/* Sidebar filtres essentiels */}
      <aside className="shrink-0 w-64 border-r border-border bg-card/50 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("planning.plan_label")}
          </label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("planning.no_plan")} />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    {p.name}
                    {p.status === "ACTIVE" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("planning.level_label")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((lvl) => (
              <Button
                key={lvl}
                variant={selectedLevels.includes(lvl) ? "default" : "outline"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => handleLevelToggle(lvl)}
              >
                {lvl}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("planning.type_label")}
          </label>
          <div className="space-y-1">
            {COURSE_TYPES.map(({ value, labelKey, color }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 cursor-pointer hover:bg-accent/50 p-1.5 rounded-md transition-colors"
              >
                <Checkbox
                  checked={selectedTypes.includes(value)}
                  onCheckedChange={() => handleTypeToggle(value)}
                />
                <span className={cn("h-3 w-3 rounded-sm", color)} />
                <span className="text-sm">{t(labelKey)}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-border bg-card/30">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleToday}>
              {t("planning.today")}
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevious}
                aria-label={t("planning.previous")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNext}
                aria-label={t("planning.next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-base md:text-lg font-semibold ml-1 capitalize">
              {formatDateHeader()}
            </h2>
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
              {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-md transition-colors",
                    viewMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`planning.view_${mode}`)}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={!selectedPlanId}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-card/80 p-4">
          {!selectedPlanId && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">{t("planning.empty_title")}</p>
              <p className="text-sm">{t("planning.empty_desc")}</p>
            </div>
          ) : (
            <>
              {viewMode === "week" && (
                <WeekViewEditable
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  selectedProfessors={[]}
                  selectedRooms={[]}
                  selectedLevels={selectedLevels}
                  isEditMode={false}
                  isPlanActive={!!selectedPlanId}
                  onEventClick={setSelectedEvent}
                />
              )}
              {viewMode === "day" && (
                <DayView
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  selectedProfessors={[]}
                  selectedRooms={[]}
                  selectedLevels={selectedLevels}
                  isEditMode={false}
                  isPlanActive={!!selectedPlanId}
                  onEventClick={setSelectedEvent}
                />
              )}
              {viewMode === "month" && (
                <MonthView
                  events={events}
                  currentDate={currentDate}
                  selectedTypes={selectedTypes}
                  selectedProfessors={[]}
                  selectedRooms={[]}
                  selectedLevels={selectedLevels}
                  isPlanActive={!!selectedPlanId}
                  onEventClick={setSelectedEvent}
                  onDayClick={(d) => {
                    setCurrentDate(d);
                    setViewMode("day");
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Event detail modal — read-only */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  {eventTypeMeta && (
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", eventTypeMeta.color)}
                    />
                  )}
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {eventTypeMeta ? t(eventTypeMeta.labelKey) : selectedEvent.type}
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
                  <span className="text-muted-foreground w-20">
                    {t("planning.time")}
                  </span>
                  <span className="font-medium">
                    {selectedEvent.startTime} – {selectedEvent.endTime}
                  </span>
                </div>
                {selectedEvent.professor && (
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-20">
                      {t("planning.professor")}
                    </span>
                    <span className="font-medium">{selectedEvent.professor}</span>
                  </div>
                )}
                {selectedEvent.room && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-20">
                      {t("planning.room")}
                    </span>
                    <span className="font-medium">{selectedEvent.room}</span>
                  </div>
                )}
                {selectedEvent.groupName && (
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 shrink-0" />
                    <span className="text-muted-foreground w-20">
                      {t("planning.group")}
                    </span>
                    <span className="font-medium">{selectedEvent.groupName}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningPage;
