"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, CourseType, courseTypeColors } from "@/lib/schedule-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MonthViewProps {
  events: ScheduleEvent[]
  currentDate: Date
  selectedTypes: CourseType[]
  selectedProfessors?: string[]
  selectedRooms?: string[]
  selectedLevels?: string[]
  onEventClick?: (event: ScheduleEvent) => void
  onDayClick?: (date: Date) => void
}

export function MonthView({ 
  events, 
  currentDate, 
  selectedTypes,
  selectedProfessors = [],
  selectedRooms = [],
  selectedLevels = [],
  onEventClick,
  onDayClick 
}: MonthViewProps) {
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const typeMatch = selectedTypes.includes(event.type)
      const professorMatch = selectedProfessors.length === 0 || selectedProfessors.includes(event.professor)
      const roomMatch = selectedRooms.length === 0 || selectedRooms.includes(event.room)
      const levelMatch = selectedLevels.length === 0 || (event.level && selectedLevels.includes(event.level))
      return typeMatch && professorMatch && roomMatch && levelMatch
    })
  }, [events, selectedTypes, selectedProfessors, selectedRooms, selectedLevels])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the day of week for the first day (0 = Sunday, adjust to Monday = 0)
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }
    
    // Fill remaining cells to complete the grid
    while (days.length % 7 !== 0) {
      days.push(null)
    }
    
    return days
  }, [currentDate])

  const filteredEvents = useMemo(() => {
    return events.filter(event => selectedTypes.includes(event.type))
  }, [events, selectedTypes])

  const getEventsForDate = (date: Date) => {
    const dayOfWeek = date.getDay()
    // Convert to our format (Monday = 0, Friday = 4)
    const dayIndex = dayOfWeek === 0 ? -1 : dayOfWeek - 1
    
    if (dayIndex < 0 || dayIndex > 4) return []
    
    return filteredEvents.filter(event => event.day === dayIndex)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const weekDayHeaders = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
        {weekDayHeaders.map((day, index) => (
          <div
            key={day}
            className={cn(
              "border-r border-border p-3 text-center last:border-r-0",
              index >= 5 && "text-muted-foreground/50"
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {day}
            </p>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-24 border-b border-r border-border bg-secondary/20 last:border-r-0"
              />
            )
          }

          const dayEvents = getEventsForDate(date)
          const hasEvents = dayEvents.length > 0

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick?.(date)}
              className={cn(
                "group min-h-24 border-b border-r border-border p-2 text-left transition-colors last:border-r-0",
                "hover:bg-secondary/50",
                isWeekend(date) && "bg-secondary/20",
                isToday(date) && "bg-primary/10"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                    isToday(date) 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground group-hover:bg-secondary"
                  )}
                >
                  {date.getDate()}
                </span>
                {hasEvents && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Events preview */}
              <div className="mt-1 space-y-1">
                <TooltipProvider>
                  {dayEvents.slice(0, 3).map((event) => {
                    const colors = courseTypeColors[event.type]
                    return (
                      <Tooltip key={event.id}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventClick?.(event)
                            }}
                            className={cn(
                              "truncate rounded px-1.5 py-0.5 text-xs",
                              colors.bg,
                              "hover:opacity-80"
                            )}
                          >
                            {event.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.startTime} - {event.endTime} • {event.room}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </TooltipProvider>
                
                {dayEvents.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} autres
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
