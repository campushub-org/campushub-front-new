"use client"

import { MapPin, User, Clock, GripVertical, Move } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, courseTypeColors, courseTypeLabels } from "@/lib/schedule-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onClick?.()
    }
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={handleClick}
              className={cn(
                "group relative h-full w-full cursor-pointer rounded-md border-l-3 p-2 text-left transition-all",
                colors.bg,
                colors.border,
                "hover:shadow-lg hover:shadow-black/20",
                !isDragging && "hover:scale-[1.02] active:scale-[0.98]",
                isDragging && "shadow-xl scale-[1.03] ring-2 ring-primary"
              )}
            >
              {/* Drag handle - top resize */}
              {isEditMode && (
                <div
                  className="absolute -top-1 left-0 right-0 flex h-3 cursor-ns-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                  onMouseDown={(e) => onDragStart?.("resize-top", e)}
                >
                  <div className="h-1 w-8 rounded-full bg-primary" />
                </div>
              )}

              {/* Move handle */}
              {isEditMode && (
                <div
                  className="absolute right-1 top-1 cursor-move rounded p-0.5 opacity-0 transition-opacity hover:bg-primary/20 group-hover:opacity-100"
                  onMouseDown={(e) => onDragStart?.("move", e)}
                >
                  <Move className="h-3 w-3 text-primary" />
                </div>
              )}

              <p className="truncate text-xs font-medium text-foreground pr-5">
                {event.title}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {event.startTime} - {event.endTime}
              </p>

              {/* Drag handle - bottom resize */}
              {isEditMode && (
                <div
                  className="absolute -bottom-1 left-0 right-0 flex h-3 cursor-ns-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                  onMouseDown={(e) => onDragStart?.("resize-bottom", e)}
                >
                  <div className="h-1 w-8 rounded-full bg-primary" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{courseTypeLabels[event.type]}</p>
              <div className="flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                {event.professor}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                {event.room}
              </div>
              {isEditMode && (
                <p className="mt-2 text-[10px] font-medium text-primary">
                  Glisser pour déplacer / Bords pour redimensionner
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative h-full w-full cursor-pointer rounded-lg border-l-4 p-3 text-left transition-all",
        colors.bg,
        colors.border,
        "hover:shadow-lg hover:shadow-black/20",
        !isDragging && "hover:scale-[1.02] active:scale-[0.98]",
        isDragging && "shadow-xl scale-[1.03] ring-2 ring-primary z-50",
        isShort && "p-2"
      )}
    >
      {/* Drag handle - top resize */}
      {isEditMode && (
        <div
          className="absolute -top-1 left-0 right-0 flex h-4 cursor-ns-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          onMouseDown={(e) => onDragStart?.("resize-top", e)}
        >
          <div className="h-1.5 w-12 rounded-full bg-primary" />
        </div>
      )}

      {/* Move handle */}
      {isEditMode && (
        <div
          className="absolute right-2 top-2 flex cursor-move items-center gap-1 rounded-md bg-primary/20 px-1.5 py-1 opacity-0 transition-opacity hover:bg-primary/30 group-hover:opacity-100"
          onMouseDown={(e) => onDragStart?.("move", e)}
        >
          <Move className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-medium text-primary">Déplacer</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-medium text-foreground line-clamp-1 pr-20",
              isShort ? "text-xs" : "text-sm"
            )}
          >
            {event.title}
          </p>

          {!isShort && (
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                colors.bg,
                colors.text
              )}
            >
              {courseTypeLabels[event.type]}
            </span>
          )}
        </div>
      </div>

      <div className={cn("mt-2 space-y-1", isShort && "mt-1")}>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className={cn("shrink-0", isShort ? "h-3 w-3" : "h-3.5 w-3.5")} />
          <span className={cn(isShort ? "text-[10px]" : "text-xs")}>
            {event.startTime} - {event.endTime}
          </span>
        </div>

        {!isShort && (
          <>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs">{event.professor}</span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs">{event.room}</span>
            </div>
          </>
        )}
      </div>

      {/* Drag handle - bottom resize */}
      {isEditMode && (
        <div
          className="absolute -bottom-1 left-0 right-0 flex h-4 cursor-ns-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          onMouseDown={(e) => onDragStart?.("resize-bottom", e)}
        >
          <div className="h-1.5 w-12 rounded-full bg-primary" />
        </div>
      )}

      {/* Edit mode indicator */}
      {isEditMode && !isDragging && (
        <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
