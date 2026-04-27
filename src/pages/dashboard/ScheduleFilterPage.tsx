import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  User,
  DoorOpen,
  Filter,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  sampleEvents,
  ScheduleEvent,
  courseTypeColors,
  courseTypeLabels,
  weekDays,
} from "@/lib/schedule-data";
import { useSchedule } from "@/lib/schedule-context";

// ─────────────────────────────────────────────
// Données statiques de référence (mock)
// ─────────────────────────────────────────────
const NIVEAUX = ["L1 Informatique", "L2 Informatique", "L3 Informatique", "M1 Informatique", "M2 Informatique"];

const ENSEIGNANTS = [...new Set(sampleEvents.map((e) => e.professor))].sort();

const SALLES = [...new Set(sampleEvents.map((e) => e.room))].sort();

// Après SALLES = [...]
const MATIERES = [...new Set(sampleEvents.map((e) => e.title))].sort();

type FilterType = "niveau" | "enseignant" | "salle";

interface FilterOption {
  id: FilterType;
  label: string;
  icon: React.ReactNode;
  items: string[];
}

const TIME_SLOTS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────
const ScheduleFilterPage: React.FC = () => {
// 
const { events } = useSchedule();
const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
const [selectedValue, setSelectedValue] = useState<string | null>(null);
const [selectedFilterType, setSelectedFilterType] = useState<FilterType | null>(null); // ← AJOUT
const [search, setSearch] = useState("");
const [currentDate, setCurrentDate] = useState(new Date());

// APRÈS — ajouter l'import de GraduationCap en haut du fichier aussi

const filterOptions: FilterOption[] = [
  { id: "niveau",     label: "Niveau",      icon: <BookOpen size={16} />,      items: NIVEAUX },
  { id: "enseignant", label: "Enseignant",  icon: <User size={16} />,          items: ENSEIGNANTS },
  { id: "salle",      label: "Salle",       icon: <DoorOpen size={16} />,      items: SALLES },
  { id: "matiere",    label: "Matière",     icon: <GraduationCap size={16} />, items: MATIERES }, // ← AJOUT
];
  // Éléments de la liste filtrée par la recherche
  const currentItems = useMemo(() => {
    const option = filterOptions.find((f) => f.id === activeFilter);
    if (!option) return [];
    return option.items.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeFilter, search]);

  // Filtrage des événements selon la sélection
// APRÈS
const filteredEvents = useMemo((): ScheduleEvent[] => {
  if (!selectedValue || !selectedFilterType) return []; // ← selectedFilterType au lieu de activeFilter
  switch (selectedFilterType) {
    case "enseignant":
      return sampleEvents.filter((e) => e.professor === selectedValue);
    case "salle":
      return sampleEvents.filter((e) => e.room === selectedValue);
    case "matiere":
      return sampleEvents.filter((e) => e.title === selectedValue); // ← AJOUT
    case "niveau":
      return events.filter((e) => e.niveau === selectedValue);
    default:
      return [];
  }
}, [selectedValue, selectedFilterType]); // ← idem

  const handleFilterSelect = (type: FilterType) => {
    if (activeFilter === type) {
      setActiveFilter(null);
      setSearch("");
    } else {
      setActiveFilter(type);
      setSelectedValue(null);
      setSearch("");
    }
  };

// APRÈS
const handleValueSelect = (value: string) => {
  setSelectedValue(value);
  setSelectedFilterType(activeFilter); // ← AJOUT : on mémorise le type avant de reset
  setActiveFilter(null);
  setSearch("");
};

  const handleReset = () => {
    setActiveFilter(null);
    setSelectedValue(null);
    setSearch("");
  };

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // Calcul du lundi de la semaine courante
  const monday = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  }, [currentDate]);

  const weekLabel = useMemo(() => {
    const end = new Date(monday);
    end.setDate(end.getDate() + 4);
    return `${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} – ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
  }, [monday]);

  // Active filter option label
  const activeOption = filterOptions.find((f) => f.id === activeFilter);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Filtrage du planning par ressource</h1>
        <p className="text-muted-foreground mt-1">
          Visualisez le planning selon un niveau, un enseignant ou une salle.
        </p>
      </div>

      {/* Barre de filtres */}
      <Card className="border shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Filter size={15} />
              Filtrer par :
            </span>

            {filterOptions.map((opt) => (
              <Button
                key={opt.id}
                variant={activeFilter === opt.id ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => handleFilterSelect(opt.id)}
              >
                {opt.icon}
                {opt.label}
              </Button>
            ))}

            {selectedValue && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                {selectedValue}
                <button onClick={handleReset} className="ml-1 hover:text-destructive transition-colors">
                  <X size={13} />
                </button>
              </Badge>
            )}
          </div>

          {/* Panneau de recherche/sélection déroulant */}
          {activeFilter && (
            <div className="mt-4 rounded-xl border bg-muted/30 p-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Sélectionner un·e {activeOption?.label}
              </p>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Rechercher un·e ${activeOption?.label?.toLowerCase()}…`}
                  className="pl-8 h-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {currentItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun résultat.</p>
                ) : (
                  currentItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleValueSelect(item)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all hover:border-primary hover:bg-primary/10 hover:text-primary",
                        selectedValue === item && "border-primary bg-primary/10 text-primary"
                      )}
                    >
                      {item}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendrier ou état vide */}
      {!selectedValue ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 py-20 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Filter size={28} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Aucun filtre sélectionné</p>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez un niveau, un enseignant ou une salle pour afficher l'emploi du temps correspondant.
            </p>
          </div>
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">
                Planning — <span className="text-primary">{selectedValue}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{weekLabel}</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
              <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                className="px-3 text-sm font-medium"
                onClick={() => setCurrentDate(new Date())}
              >
                Aujourd'hui
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <WeekCalendar events={filteredEvents} monday={monday} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sous-composant : calendrier hebdomadaire
// ─────────────────────────────────────────────
interface WeekCalendarProps {
  events: ScheduleEvent[];
  monday: Date;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ events, monday }) => {
  const today = new Date();

  const dayDates = weekDays.map((_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getEventsForDay = (dayIndex: number) =>
    events.filter((e) => e.day === dayIndex);

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const START_HOUR = 7;
  const END_HOUR = 21;
  const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
  const SLOT_HEIGHT = 56; // px par heure

  const calcTop = (startTime: string) =>
    ((timeToMinutes(startTime) - START_HOUR * 60) / 60) * SLOT_HEIGHT;

  const calcHeight = (startTime: string, endTime: string) =>
    ((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60) * SLOT_HEIGHT;

  const gridHeight = (END_HOUR - START_HOUR) * SLOT_HEIGHT;

  const isToday = (date: Date) =>
    date.toDateString() === today.toDateString();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* En-tête des jours */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b bg-muted/30">
          <div className="border-r" />
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={cn(
                "px-3 py-3 text-center border-r last:border-r-0",
                isToday(dayDates[i]) && "bg-primary/5"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</p>
              <p className={cn(
                "text-xl font-bold mt-0.5",
                isToday(dayDates[i]) ? "text-primary" : "text-foreground"
              )}>
                {dayDates[i].getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Corps du calendrier */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)]">
          {/* Colonne des heures */}
          <div className="border-r">
            {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
              <div
                key={i}
                style={{ height: SLOT_HEIGHT }}
                className="border-b flex items-start justify-end pr-2 pt-1"
              >
                <span className="text-[11px] text-muted-foreground font-medium">
                  {String(START_HOUR + i).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colonnes des jours */}
          {weekDays.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className={cn(
                "relative border-r last:border-r-0",
                isToday(dayDates[dayIndex]) && "bg-primary/5"
              )}
              style={{ height: gridHeight }}
            >
              {/* Lignes horizontales des heures */}
              {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-b border-border/50"
                  style={{ top: i * SLOT_HEIGHT }}
                />
              ))}

              {/* Événements */}
              {getEventsForDay(dayIndex).map((event) => {
                const colors = courseTypeColors[event.type];
                const top = calcTop(event.startTime);
                const height = calcHeight(event.startTime, event.endTime);

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "absolute left-1 right-1 rounded-lg border-l-[3px] px-2 py-1 overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:shadow-md",
                      colors.bg,
                      colors.border
                    )}
                    style={{ top: top + 2, height: height - 4 }}
                    title={`${event.title} — ${event.professor} — ${event.room}`}
                  >
                    <p className={cn("text-xs font-semibold leading-tight truncate", colors.text)}>
                      {event.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {event.startTime} – {event.endTime}
                    </p>
                    {height > 50 && (
                      <p className="text-[10px] text-muted-foreground truncate">{event.room}</p>
                    )}
                    {height > 70 && (
                      <p className="text-[10px] text-muted-foreground truncate">{event.professor}</p>
                    )}
                    {height > 50 && (
                      <Badge
                        variant="outline"
                        className={cn("mt-1 text-[9px] px-1 py-0 h-4 border-0", colors.bg, colors.text)}
                      >
                        {courseTypeLabels[event.type]}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilterPage;
