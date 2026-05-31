"use client"

import { MapPin, User, Clock, GripVertical, Move, AlertCircle, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, courseTypeColors, courseTypeLabels, CourseType } from "@/lib/schedule-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface EventCardEditableProps {
  event: ScheduleEvent
  compact?: boolean
  isEditMode?: boolean
  isDragging?: boolean
  onClick?: () => void
  onDragStart?: (type: "move" | "resize-top" | "resize-bottom", e: React.MouseEvent) => void
}

export function EventCardEditable({
  event,
  compact = false,
  isEditMode = false,
  isDragging = false,
  onClick,
  onDragStart,
}: EventCardEditableProps) {
  const colors = courseTypeColors[event.type]

  const calculateDuration = () => {
    const [startH, startM] = event.startTime.split(":").map(Number)
    const [endH, endM] = event.endTime.split(":").map(Number)
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
    return durationMinutes
  }

  const duration = calculateDuration()
  const isShort = duration <= 60
  const isVeryShort = duration <= 45

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onClick?.()
    }
  }

  // Styles communs pour la carte
  const cardClasses = cn(
    "group relative h-full w-full cursor-pointer rounded-lg border-l-4 p-2.5 text-left transition-all duration-200",
    "backdrop-blur-[2px] shadow-sm hover:shadow-md",
    colors.bg,
    colors.border,
    !isDragging && "hover:translate-y-[-1px] active:scale-[0.98]",
    isDragging && "shadow-2xl scale-[1.02] ring-2 ring-primary/50 z-50 opacity-90",
    isShort && "p-1.5"
  )

  const cardContent = (
    <>
      {/* Superpositions du mode édition */}
      {isEditMode && (
        <>
          <div
            className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize z-30"
            onMouseDown={(e) => onDragStart?.("resize-top", e)}
          />
          <div
            className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize z-30"
            onMouseDown={(e) => onDragStart?.("resize-bottom", e)}
          />
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <div 
              className="p-1 rounded bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background cursor-move"
              onMouseDown={(e) => onDragStart?.("move", e)}
            >
              <Move className="h-3 w-3 text-primary" />
            </div>
          </div>
        </>
      )}

      {/* Contenu Principal */}
      <div className="flex flex-col h-full justify-between min-w-0">
        <div className="min-w-0">
          <p className={cn(
            "font-bold leading-tight text-foreground/90 tracking-tight break-words line-clamp-2",
            isVeryShort ? "text-[9px]" : isShort ? "text-[10px]" : "text-xs"
          )}>
            {event.subjectCode ? `${event.subjectCode}: ` : ""}{event.title}
          </p>
          
          {/*{!isShort && (
            <div className="flex flex-wrap gap-1 mt-1 mb-1.5">
              <span className={cn(
                "inline-flex items-center rounded-sm px-1 py-0.5 text-[8px] font-extrabold uppercase tracking-widest bg-background/40 border border-current/10",
                colors.text
              )}>
                {courseTypeLabels[event.type]}
              </span>
              {event.groupName && (
                <span className="inline-flex items-center rounded-sm px-1 py-0.5 text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                  {event.groupName}
                </span>
              )}
            </div>
          )}*/}
        </div>

        <div className={cn("space-y-0.5 min-w-0", isVeryShort && "hidden", isShort && "flex items-center gap-2 space-y-0 mt-1")}>
          <div className="flex items-center gap-1 text-muted-foreground/80 overflow-hidden">
            <Clock className={cn("shrink-0 opacity-70", isShort ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className={cn("font-medium truncate", isShort ? "text-[9px]" : "text-[10px]")}>
              {event.startTime}
            </span>
          </div>

          {!isShort && (
            <>
              <div className="flex items-center gap-1 text-muted-foreground/80 overflow-hidden">
                {event.professor ? (
                  <>
                    <User className="h-3 w-3 shrink-0 opacity-70" />
                    <span className="truncate text-[10px] font-medium">{event.professor}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500 animate-pulse" />
                    <span className="truncate text-[9px] font-black text-amber-600 uppercase">À DÉTERMINER</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground/80 overflow-hidden">
                <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                <span className="truncate text-[10px] font-medium">{event.room}</span>
              </div>
              {event.groupName && (
                <div className="flex items-center gap-1 text-primary/80 overflow-hidden">
                  <Layers className="h-3 w-3 shrink-0 opacity-70" />
                  <span className="truncate text-[10px] font-bold uppercase tracking-tighter">{event.groupName}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Indicateur Grip */}
      {isEditMode && !isDragging && (
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-30 transition-opacity">
          <GripVertical className="h-3 w-3" />
        </div>
      )}
    </>
  )

  // Utiliser Tooltip pour TOUTES les cartes en mode édition pour voir les infos
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div onClick={handleClick} className={cardClasses}>
            {cardContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="z-[100] p-0 border-none bg-transparent shadow-2xl overflow-hidden">
          <Card className="w-64 border-l-4 overflow-hidden" style={{ borderLeftColor: 'currentColor' }}>
            <CardHeader className={cn("p-3 pb-2", colors.bg)}>
              <div className="flex justify-between items-start gap-2 text-left">
                <p className="font-bold text-sm leading-tight">
                  {event.subjectCode ? `${event.subjectCode}: ` : ""}{event.title}
                </p>
                <Badge variant="outline" className={cn("text-[9px] h-4 font-bold uppercase", colors.bg, colors.text)}>
                  {courseTypeLabels[event.type]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-2 space-y-2 bg-card">
              <div className="grid grid-cols-1 gap-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">{event.startTime} — {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {event.professor ? <User className="h-3.5 w-3.5 text-primary" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                  <span className={cn("font-medium", !event.professor && "text-amber-600 font-bold")}>
                    {event.professor || "À DÉTERMINER (Non assigné)"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">{event.room || "Salle non définie"}</span>
                </div>
                {event.groupName && (
                  <div className="flex items-center gap-2 text-xs text-primary font-bold">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{event.groupName}</span>
                  </div>
                )}
              </div>
              {isEditMode && (
                <div className="mt-2 pt-2 border-t border-border/50 text-[9px] text-primary/70 font-bold uppercase tracking-tighter">
                  Mode Édition Actif • Glisser pour déplacer
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
