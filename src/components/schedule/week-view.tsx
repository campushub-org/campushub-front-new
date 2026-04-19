"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, weekDays, timeSlots, CourseType } from "@/lib/schedule-data"
import { EventCard } from "./event-card"

interface WeekViewProps {
  events: ScheduleEvent[]
  currentDate: Date
  selectedTypes: CourseType[]
  onEventClick?: (event: ScheduleEvent) => void
}

export function WeekView({ events, currentDate, selectedTypes, onEventClick }: WeekViewProps) {
  const weekDates = useMemo(() => {
    const dates: Date[] = []
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentDate])

  const filteredEvents = useMemo(() => {
    return events.filter(event => selectedTypes.includes(event.type))
  }, [events, selectedTypes])

  const getEventsForSlot = (dayIndex: number) => {
    return filteredEvents.filter(event => event.day === dayIndex)
  }

  const calculateEventPosition = (event: ScheduleEvent) => {
    const [startH, startM] = event.startTime.split(":").map(Number)
    const [endH, endM] = event.endTime.split(":").map(Number)
    
    // Calculate position relative to 8:00 (first time slot)
    const startMinutes = (startH - 8) * 60 + startM
    const endMinutes = (endH - 8) * 60 + endM
    const duration = endMinutes - startMinutes
    
    // Each hour is 64px tall
    const top = (startMinutes / 60) * 64
    const height = (duration / 60) * 64
    
    return { top, height: Math.max(height - 4, 40) }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    if (hours < 8 || hours >= 19) return null
    
    const minutesSince8 = (hours - 8) * 60 + minutes
    return (minutesSince8 / 60) * 64
  }

  const currentTimePosition = getCurrentTimePosition()
  const todayIndex = weekDates.findIndex(d => isToday(d))

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header row with days */}
      <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border bg-secondary/30">
        <div className="border-r border-border p-3" />
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "border-r border-border p-3 text-center last:border-r-0",
              isToday(weekDates[index]) && "bg-primary/10"
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {day}
            </p>
            <p className={cn(
              "mt-1 text-lg font-semibold",
              isToday(weekDates[index]) 
                ? "text-primary" 
                : "text-foreground"
            )}>
              {weekDates[index].getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="relative grid grid-cols-[60px_repeat(5,1fr)] flex-1 overflow-auto">
        {/* Time labels column */}
        <div className="border-r border-border">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="relative h-16 border-b border-border/50 pr-2 text-right"
            >
              <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                {time}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((_, dayIndex) => {
          const dayEvents = getEventsForSlot(dayIndex)
          
          return (
            <div
              key={dayIndex}
              className={cn(
                "relative border-r border-border last:border-r-0",
                isToday(weekDates[dayIndex]) && "bg-primary/5"
              )}
            >
              {/* Hour grid lines */}
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-16 border-b border-border/50"
                />
              ))}

              {/* Events */}
              <div className="absolute inset-0 p-1">
                {dayEvents.map((event) => {
                  const position = calculateEventPosition(event)
                  return (
                    <div
                      key={event.id}
                      className="absolute left-1 right-1"
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                      }}
                    >
                      <EventCard
                        event={event}
                        compact={position.height < 80}
                        onClick={() => onEventClick?.(event)}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Current time indicator */}
              {currentTimePosition !== null && todayIndex === dayIndex && (
                <div
                  className="absolute left-0 right-0 z-10 flex items-center"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-0.5 flex-1 bg-destructive" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
