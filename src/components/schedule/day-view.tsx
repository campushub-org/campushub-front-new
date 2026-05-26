"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, timeSlots, CourseType, weekDays } from "@/lib/schedule-data"
import { EventCard } from "./event-card"
import { Plus } from "lucide-react"

interface DayViewProps {
  events: ScheduleEvent[]
  currentDate: Date
  selectedTypes: CourseType[]
  selectedProfessors?: string[]
  selectedRooms?: string[]
  selectedLevels?: string[]
  isEditMode?: boolean
  isPlanActive?: boolean
  onEventClick?: (event: ScheduleEvent) => void
  onCreateEvent?: (day: number, startTime: string) => void
}

export function DayView({
  events,
  currentDate,
  selectedTypes,
  selectedProfessors = [],
  selectedRooms = [],
  selectedLevels = [],
  isEditMode = false,
  isPlanActive = false,
  onEventClick,
  onCreateEvent,
}: DayViewProps) {
  const { t } = useTranslation()
  const weekDays = t('dean.scheduling.common.days', { returnObjects: true }) as string[]
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)
  
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(event.type)
      const professorMatch = selectedProfessors.length === 0 || (event.professor && selectedProfessors.includes(event.professor))
      const roomMatch = selectedRooms.length === 0 || (event.room && selectedRooms.includes(event.room))
      
      if (isPlanActive) {
          return typeMatch && professorMatch && roomMatch
      }

      const levelMatch = selectedLevels.length === 0 || (() => {
        const digit = event.subjectCode?.replace(/\D/g, '')[0]
        const deducedLevel = digit === '4' ? "M1" : (digit === '5' ? "M2" : `L${digit}`)
        return selectedLevels.includes(deducedLevel) || (event.level && selectedLevels.includes(event.level))
      })()
      return typeMatch && professorMatch && roomMatch && levelMatch
    })
  }, [events, selectedTypes, selectedProfessors, selectedRooms, selectedLevels])

  const dayIndex = useMemo(() => {
    const day = currentDate.getDay()
    return day === 0 ? -1 : day - 1
  }, [currentDate])

  const todaysEvents = useMemo(() => {
    return filteredEvents
      .filter((e) => e.day === dayIndex)
      .sort((a, b) => {
        const [aH, aM] = a.startTime.split(":").map(Number)
        const [bH, bM] = b.startTime.split(":").map(Number)
        return (aH * 60 + aM) - (bH * 60 + bM)
      })
  }, [filteredEvents, dayIndex])

  const calculateEventPosition = (event: ScheduleEvent) => {
    const [startH, startM] = event.startTime.split(":").map(Number)
    const [endH, endM] = event.endTime.split(":").map(Number)
    
    const startMinutes = (startH - 7) * 60 + startM
    const endMinutes = (endH - 7) * 60 + endM
    const duration = endMinutes - startMinutes
    
    const top = (startMinutes / 60) * 80
    const height = (duration / 60) * 80
    
    return { top, height: Math.max(height - 4, 60) }
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    if (hours < 8 || hours >= 19) return null
    
    const minutesSince8 = (hours - 8) * 60 + minutes
    return (minutesSince8 / 60) * 80
  }

  const isToday = () => {
    const today = new Date()
    return currentDate.toDateString() === today.toDateString()
  }

  const currentTimePosition = isToday() ? getCurrentTimePosition() : null
  const isWeekend = dayIndex < 0 || dayIndex > 4

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 p-4">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {dayIndex >= 0 && dayIndex <= 4 ? weekDays[dayIndex] : "Week-end"}
        </p>
        <p className={cn(
          "mt-1 text-center text-2xl font-bold",
          isToday() ? "text-primary" : "text-foreground"
        )}>
          {currentDate.getDate()}
        </p>
      </div>

      {/* Content */}
      {isWeekend ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">Pas de cours</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Profitez de votre week-end !
            </p>
          </div>
        </div>
      ) : (
        <div className="relative grid grid-cols-[80px_1fr] flex-1 overflow-auto">
          {/* Time labels */}
          <div className="border-r border-border">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="relative h-20 border-b border-border/50 pr-3 text-right"
              >
                <span className="absolute -top-2.5 right-3 text-sm font-medium text-muted-foreground">
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* Events area */}
          <div className={cn(
            "relative",
            isToday() && "bg-primary/5"
          )}>
            {/* Hour grid lines */}
            {timeSlots.map((time, idx) => {
              const hour = 8 + idx;
              const isHovered = hoveredHour === hour;
              return (
                <div
                  key={time}
                  className={cn(
                    "h-20 border-b border-border/50 transition-colors relative",
                    isEditMode && "cursor-pointer hover:bg-primary/10",
                    isEditMode && isHovered && "bg-primary/15"
                  )}
                  onMouseEnter={() => isEditMode && setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  onClick={() => isEditMode && onCreateEvent?.(dayIndex, time)}
                >
                  {isEditMode && isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary animate-in zoom-in-95 duration-200">
                          <Plus className="h-4 w-4" />
                          {t('dean.scheduling.view.add')}                       </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Events */}
            <div className="absolute inset-0 p-2">
              {filteredEvents.map((event) => {
                const position = calculateEventPosition(event)
                return (
                  <div
                    key={event.id}
                    className="absolute left-2 right-2"
                    style={{
                      top: `${position.top}px`,
                      height: `${position.height}px`,
                    }}
                  >
                    <EventCard
                      event={event}
                      onClick={() => onEventClick?.(event)}
                    />
                  </div>
                )
              })}
            </div>

            {/* Current time indicator */}
            {currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 z-10 flex items-center"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <div className="h-0.5 flex-1 bg-destructive" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
