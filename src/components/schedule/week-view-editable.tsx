"use client"

import { useMemo, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, weekDays, timeSlots, CourseType, courseTypeColors } from "@/lib/schedule-data"
import { EventCardEditable } from "./event-card-editable"
import { Plus, GripVertical } from "lucide-react"

interface WeekViewEditableProps {
  events: ScheduleEvent[]
  currentDate: Date
  selectedTypes: CourseType[]
  isEditMode: boolean
  onEventClick?: (event: ScheduleEvent) => void
  onEventUpdate?: (event: ScheduleEvent) => void
  onCreateEvent?: (day: number, startTime: string) => void
}

interface DragState {
  eventId: string | null
  type: "move" | "resize-top" | "resize-bottom" | null
  startY: number
  startDay: number
  originalEvent: ScheduleEvent | null
}

export function WeekViewEditable({
  events,
  currentDate,
  selectedTypes,
  isEditMode,
  onEventClick,
  onEventUpdate,
  onCreateEvent,
}: WeekViewEditableProps) {
  const [dragState, setDragState] = useState<DragState>({
    eventId: null,
    type: null,
    startY: 0,
    startDay: 0,
    originalEvent: null,
  })
  const [dragPreview, setDragPreview] = useState<{
    day: number
    startTime: string
    endTime: string
  } | null>(null)
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; hour: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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
    return events.filter((event) => selectedTypes.includes(event.type))
  }, [events, selectedTypes])

  const getEventsForSlot = (dayIndex: number) => {
    return filteredEvents.filter((event) => event.day === dayIndex)
  }

  const calculateEventPosition = (event: ScheduleEvent) => {
    const [startH, startM] = event.startTime.split(":").map(Number)
    const [endH, endM] = event.endTime.split(":").map(Number)

    const startMinutes = (startH - 8) * 60 + startM
    const endMinutes = (endH - 8) * 60 + endM
    const duration = endMinutes - startMinutes

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

  const yToTime = useCallback((y: number): { hours: number; minutes: number } => {
    const totalMinutes = Math.round((y / 64) * 60)
    const hours = Math.floor(totalMinutes / 60) + 8
    const minutes = Math.round((totalMinutes % 60) / 15) * 15
    return { hours: Math.min(Math.max(hours, 8), 19), minutes: minutes % 60 }
  }, [])

  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const handleDragStart = (event: ScheduleEvent, type: "move" | "resize-top" | "resize-bottom", e: React.MouseEvent) => {
    if (!isEditMode) return
    e.preventDefault()
    e.stopPropagation()

    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragState({
      eventId: event.id,
      type,
      startY: e.clientY - rect.top,
      startDay: event.day,
      originalEvent: { ...event },
    })
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.eventId || !dragState.originalEvent || !gridRef.current) return

      const rect = gridRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top
      const x = e.clientX - rect.left - 60 // Subtract time column width

      const colWidth = (rect.width - 60) / 5
      const newDay = Math.min(Math.max(Math.floor(x / colWidth), 0), 4)

      const deltaY = y - dragState.startY
      const deltaMinutes = Math.round((deltaY / 64) * 60 / 15) * 15

      const orig = dragState.originalEvent
      const [origStartH, origStartM] = orig.startTime.split(":").map(Number)
      const [origEndH, origEndM] = orig.endTime.split(":").map(Number)
      const origStartMinutes = origStartH * 60 + origStartM
      const origEndMinutes = origEndH * 60 + origEndM

      let newStartMinutes = origStartMinutes
      let newEndMinutes = origEndMinutes

      if (dragState.type === "move") {
        newStartMinutes = origStartMinutes + deltaMinutes
        newEndMinutes = origEndMinutes + deltaMinutes

        // Clamp to valid range
        if (newStartMinutes < 8 * 60) {
          const diff = 8 * 60 - newStartMinutes
          newStartMinutes = 8 * 60
          newEndMinutes += diff
        }
        if (newEndMinutes > 19 * 60) {
          const diff = newEndMinutes - 19 * 60
          newEndMinutes = 19 * 60
          newStartMinutes -= diff
        }
      } else if (dragState.type === "resize-top") {
        newStartMinutes = Math.max(8 * 60, Math.min(origStartMinutes + deltaMinutes, newEndMinutes - 30))
      } else if (dragState.type === "resize-bottom") {
        newEndMinutes = Math.min(19 * 60, Math.max(origEndMinutes + deltaMinutes, newStartMinutes + 30))
      }

      const newStartH = Math.floor(newStartMinutes / 60)
      const newStartM = newStartMinutes % 60
      const newEndH = Math.floor(newEndMinutes / 60)
      const newEndM = newEndMinutes % 60

      setDragPreview({
        day: dragState.type === "move" ? newDay : orig.day,
        startTime: formatTime(newStartH, newStartM),
        endTime: formatTime(newEndH, newEndM),
      })
    },
    [dragState]
  )

  const handleMouseUp = useCallback(() => {
    if (dragState.eventId && dragState.originalEvent && dragPreview && onEventUpdate) {
      const updatedEvent: ScheduleEvent = {
        ...dragState.originalEvent,
        day: dragPreview.day,
        startTime: dragPreview.startTime,
        endTime: dragPreview.endTime,
      }
      onEventUpdate(updatedEvent)
    }

    setDragState({
      eventId: null,
      type: null,
      startY: 0,
      startDay: 0,
      originalEvent: null,
    })
    setDragPreview(null)
  }, [dragState, dragPreview, onEventUpdate])

  const handleSlotClick = (day: number, hour: number) => {
    if (isEditMode && onCreateEvent) {
      onCreateEvent(day, `${hour.toString().padStart(2, "0")}:00`)
    }
  }

  const currentTimePosition = getCurrentTimePosition()
  const todayIndex = weekDates.findIndex((d) => isToday(d))

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
            <p
              className={cn(
                "mt-1 text-lg font-semibold",
                isToday(weekDates[index]) ? "text-primary" : "text-foreground"
              )}
            >
              {weekDates[index].getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div
        ref={gridRef}
        className="relative grid grid-cols-[60px_repeat(5,1fr)] flex-1 overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Time labels column */}
        <div className="border-r border-border">
          {timeSlots.map((time) => (
            <div key={time} className="relative h-16 border-b border-border/50 pr-2 text-right">
              <span className="absolute -top-2 right-2 text-xs text-muted-foreground">{time}</span>
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
              {/* Hour grid lines - clickable in edit mode */}
              {timeSlots.map((time, hourIndex) => {
                const hour = 8 + hourIndex
                const isHovered = hoveredSlot?.day === dayIndex && hoveredSlot?.hour === hour

                return (
                  <div
                    key={time}
                    className={cn(
                      "relative h-16 border-b border-border/50 transition-colors",
                      isEditMode && "cursor-pointer hover:bg-primary/10",
                      isHovered && isEditMode && "bg-primary/15"
                    )}
                    onMouseEnter={() => isEditMode && setHoveredSlot({ day: dayIndex, hour })}
                    onMouseLeave={() => setHoveredSlot(null)}
                    onClick={() => handleSlotClick(dayIndex, hour)}
                  >
                    {isHovered && isEditMode && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary">
                          <Plus className="h-3.5 w-3.5" />
                          Ajouter
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Events */}
              <div className="absolute inset-0 p-1">
                {dayEvents.map((event) => {
                  const isDragging = dragState.eventId === event.id
                  const displayEvent =
                    isDragging && dragPreview && dragPreview.day === dayIndex
                      ? { ...event, startTime: dragPreview.startTime, endTime: dragPreview.endTime }
                      : event

                  // Skip rendering if the event was dragged to another day
                  if (isDragging && dragPreview && dragPreview.day !== dayIndex) {
                    return null
                  }

                  const position = calculateEventPosition(displayEvent)

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-1 right-1 transition-opacity",
                        isDragging && "opacity-80 z-20"
                      )}
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                      }}
                    >
                      <EventCardEditable
                        event={displayEvent}
                        compact={position.height < 80}
                        isEditMode={isEditMode}
                        isDragging={isDragging}
                        onClick={() => onEventClick?.(event)}
                        onDragStart={(type, e) => handleDragStart(event, type, e)}
                      />
                    </div>
                  )
                })}

                {/* Drag preview ghost for events dragged to this day */}
                {dragState.eventId && dragPreview && dragPreview.day === dayIndex && dragState.originalEvent?.day !== dayIndex && (
                  <div
                    className="absolute left-1 right-1 z-10"
                    style={{
                      top: `${calculateEventPosition({ ...dragState.originalEvent!, startTime: dragPreview.startTime, endTime: dragPreview.endTime }).top}px`,
                      height: `${calculateEventPosition({ ...dragState.originalEvent!, startTime: dragPreview.startTime, endTime: dragPreview.endTime }).height}px`,
                    }}
                  >
                    <div
                      className={cn(
                        "h-full w-full rounded-lg border-2 border-dashed",
                        courseTypeColors[dragState.originalEvent!.type].border,
                        courseTypeColors[dragState.originalEvent!.type].bg,
                        "opacity-60"
                      )}
                    >
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{dragState.originalEvent!.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {dragPreview.startTime} - {dragPreview.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current time indicator */}
              {currentTimePosition !== null && todayIndex === dayIndex && (
                <div
                  className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
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

      {/* Drag indicator bar */}
      {isEditMode && dragState.eventId && dragPreview && (
        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 px-4 py-2 text-center text-sm font-medium text-primary-foreground">
          <GripVertical className="mr-2 inline h-4 w-4" />
          {weekDays[dragPreview.day]} {dragPreview.startTime} - {dragPreview.endTime}
        </div>
      )}
    </div>
  )
}
