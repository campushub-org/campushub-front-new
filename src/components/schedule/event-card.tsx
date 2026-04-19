"use client"

import { MapPin, User, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, courseTypeColors, courseTypeLabels } from "@/lib/schedule-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EventCardProps {
  event: ScheduleEvent
  compact?: boolean
  onClick?: () => void
}

export function EventCard({ event, compact = false, onClick }: EventCardProps) {
  const colors = courseTypeColors[event.type]
  
  const calculateDuration = () => {
    const [startH, startM] = event.startTime.split(":").map(Number)
    const [endH, endM] = event.endTime.split(":").map(Number)
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
    return durationMinutes
  }

  const duration = calculateDuration()
  const isShort = duration <= 60

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                "w-full rounded-md border-l-3 p-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                colors.bg,
                colors.border,
                "hover:shadow-lg hover:shadow-black/20"
              )}
            >
              <p className="truncate text-xs font-medium text-foreground">
                {event.title}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {event.startTime} - {event.endTime}
              </p>
            </button>
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
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border-l-4 p-3 text-left transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        "hover:shadow-lg hover:shadow-black/20",
        colors.bg,
        colors.border,
        isShort && "p-2"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn(
            "font-medium text-foreground line-clamp-1",
            isShort ? "text-xs" : "text-sm"
          )}>
            {event.title}
          </p>
          
          {!isShort && (
            <span className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
              colors.bg,
              colors.text
            )}>
              {courseTypeLabels[event.type]}
            </span>
          )}
        </div>
      </div>

      <div className={cn(
        "mt-2 space-y-1",
        isShort && "mt-1"
      )}>
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
    </button>
  )
}
