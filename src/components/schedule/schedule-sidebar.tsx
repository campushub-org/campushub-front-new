"use client"

import { Clock, TrendingUp, BookOpen, Calendar, RefreshCw, Layers, Plus, Download, Upload, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, SchedulePlan, courseTypeLabels, courseTypeColors, CourseType } from "@/lib/schedule-data"
import { ResourceFilters } from "./resource-filters"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface ScheduleSidebarProps {
  events: ScheduleEvent[]
  plans?: SchedulePlan[]
  selectedPlanId?: string
  onPlanChange?: (planId: string) => void
  onAddPlan?: () => void
  onEditPlan?: (planId: string) => void
  onImportPlan?: () => void
  onExportPlan?: (planId: string) => void
  selectedTypes: CourseType[]
  allProfessors: string[]
  allRooms: string[]
  selectedProfessors: string[]
  selectedRooms: string[]
  selectedLevels: string[]
  onProfessorToggle: (professor: string) => void
  onRoomToggle: (room: string) => void
  onLevelToggle: (level: string) => void
  isLoading?: boolean
  onRefresh?: () => void
}

export function ScheduleSidebar({
  events,
  plans = [],
  selectedPlanId,
  onPlanChange,
  onAddPlan,
  onEditPlan,
  onImportPlan,
  onExportPlan,
  selectedTypes,
  allProfessors,
  allRooms,
  selectedProfessors,
  selectedRooms,
  selectedLevels,
  onProfessorToggle,
  onRoomToggle,
  onLevelToggle,
  isLoading = false,
  onRefresh
}: ScheduleSidebarProps) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const todayIndex = dayOfWeek === 0 ? -1 : dayOfWeek - 1

  const filteredEvents = useMemo(() => {
    return events.filter(event => selectedTypes.includes(event.type))
  }, [events, selectedTypes])

  const todayEvents = useMemo(() => {
    return filteredEvents
      .filter(event => event.day === todayIndex)
      .sort((a, b) => {
        const [aH, aM] = a.startTime.split(":").map(Number)
        const [bH, bM] = b.startTime.split(":").map(Number)
        return (aH * 60 + aM) - (bH * 60 + bM)
      })
  }, [filteredEvents, todayIndex])

  const upcomingEvent = useMemo(() => {
    return todayEvents.find(event => {
      const [h, m] = event.startTime.split(":").map(Number)
      const eventTime = h * 60 + m
      const now = today.getHours() * 60 + today.getMinutes()
      return eventTime > now
    })
  }, [todayEvents, today])

  const stats = useMemo(() => ({
    totalWeekHours: filteredEvents.reduce((acc, event) => {
      const [startH, startM] = event.startTime.split(":").map(Number)
      const [endH, endM] = event.endTime.split(":").map(Number)
      return acc + ((endH * 60 + endM) - (startH * 60 + startM)) / 60
    }, 0),
    coursesByType: Object.fromEntries(
      (["lecture", "td", "tp", "exam", "meeting"] as CourseType[]).map(type => [
        type,
        filteredEvents.filter(e => e.type === type).length
      ])
    ) as Record<CourseType, number>
  }), [filteredEvents])

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      {/* Header avec indicateur de chargement */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Tableau de bord</span>
        <button 
          onClick={onRefresh}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200",
            !onRefresh ? "opacity-20 cursor-default" : "hover:bg-primary/10 text-primary"
          )}
          title="Actualiser les événements"
          disabled={!onRefresh}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Sélecteur de Programmation (Plan) */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-primary">
            <Layers className="h-3.5 w-3.5" /> Programmation
          </h3>
          <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={() => selectedPlanId && onEditPlan?.(selectedPlanId)} title="Paramètres">
               <Settings className="h-3 w-3" />
             </Button>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={onImportPlan} title="Importer">
               <Upload className="h-3 w-3" />
             </Button>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={() => selectedPlanId && onExportPlan?.(selectedPlanId)} title="Exporter">
               <Download className="h-3 w-3" />
             </Button>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={onAddPlan} title="Nouveau plan">
               <Plus className="h-3 w-3" />
             </Button>
          </div>
        </div>

        <Select value={selectedPlanId} onValueChange={onPlanChange}>
          <SelectTrigger className="h-9 bg-background border-primary/20 text-xs font-medium">
            <SelectValue placeholder="Choisir une version" />
          </SelectTrigger>
          <SelectContent>
            {plans.length === 0 ? (
              <SelectItem value="none" disabled>Aucun plan disponible</SelectItem>
            ) : (
              plans.map(plan => (
                <SelectItem key={plan.id} value={plan.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span>{plan.name}</span>
                    {plan.status === 'ACTIVE' && <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500 uppercase">Actif</Badge>}
                    {plan.status === 'DRAFT' && <Badge variant="outline" className="h-3.5 px-1 text-[8px] uppercase">Draft</Badge>}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalWeekHours.toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
              <BookOpen className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredEvents.length}</p>
              <p className="text-xs text-muted-foreground">Cours planifiés</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <ResourceFilters
          events={events}
          allProfessors={allProfessors}
          allRooms={allRooms}
          selectedProfessors={selectedProfessors}
          selectedRooms={selectedRooms}
          selectedLevels={selectedLevels}
          onProfessorToggle={onProfessorToggle}
          onRoomToggle={onRoomToggle}
          onLevelToggle={onLevelToggle}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4" /> Répartition
        </h3>
        <div className="mt-3 space-y-2">
          {(Object.entries(stats.coursesByType) as [CourseType, number][])
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => {
              const colors = courseTypeColors[type]
              const percentage = (count / (filteredEvents.length || 1)) * 100
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{courseTypeLabels[type]}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full rounded-full transition-all", colors.bg)} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      
      <div className="flex-1 rounded-xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calendar className="h-4 w-4" /> {"Aujourd'hui"}
        </h3>
        {todayIndex < 0 || todayIndex > 4 ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">Pas de cours ce week-end</p>
        ) : todayEvents.length === 0 ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">Aucun cours prévu</p>
        ) : (
          <div className="mt-3 space-y-2">
            {todayEvents.map(event => {
              const colors = courseTypeColors[event.type]
              const isUpcoming = event.id === upcomingEvent?.id
              return (
                <div key={event.id} className={cn("rounded-lg border-l-3 p-3 transition-colors", colors.bg, colors.border, isUpcoming && "ring-1 ring-primary")}>
                  {isUpcoming && <span className="mb-1 inline-block rounded-full bg-primary/30 px-2 py-0.5 text-[10px] font-medium text-primary">Prochain cours</span>}
                  <p className="text-sm font-medium text-foreground line-clamp-1">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.startTime} - {event.endTime}</p>
                  <p className="text-xs text-muted-foreground">{event.room}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
