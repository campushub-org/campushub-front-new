"use client"

import { Clock, TrendingUp, BookOpen, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScheduleEvent, courseTypeLabels, courseTypeColors, CourseType } from "@/lib/schedule-data"

interface ScheduleSidebarProps {
  events: ScheduleEvent[]
  selectedTypes: CourseType[]
}

export function ScheduleSidebar({ events, selectedTypes }: ScheduleSidebarProps) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const todayIndex = dayOfWeek === 0 ? -1 : dayOfWeek - 1

  const filteredEvents = events.filter(event => selectedTypes.includes(event.type))

  const todayEvents = filteredEvents
    .filter(event => event.day === todayIndex)
    .sort((a, b) => {
      const [aH, aM] = a.startTime.split(":").map(Number)
      const [bH, bM] = b.startTime.split(":").map(Number)
      return (aH * 60 + aM) - (bH * 60 + bM)
    })

  const upcomingEvent = todayEvents.find(event => {
    const [h, m] = event.startTime.split(":").map(Number)
    const eventTime = h * 60 + m
    const now = today.getHours() * 60 + today.getMinutes()
    return eventTime > now
  })

  // Calculate statistics
  const stats = {
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
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      {/* Stats cards */}
      <div className="grid gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalWeekHours.toFixed(0)}h
              </p>
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
              <p className="text-2xl font-bold text-foreground">
                {filteredEvents.length}
              </p>
              <p className="text-xs text-muted-foreground">Cours planifiés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4" />
          Répartition
        </h3>
        <div className="mt-3 space-y-2">
          {(Object.entries(stats.coursesByType) as [CourseType, number][])
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => {
              const colors = courseTypeColors[type]
              const percentage = (count / filteredEvents.length) * 100
              
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {courseTypeLabels[type]}
                    </span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all", colors.bg)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Today's schedule */}
      <div className="flex-1 rounded-xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calendar className="h-4 w-4" />
          {"Aujourd'hui"}
        </h3>

        {todayIndex < 0 || todayIndex > 4 ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Pas de cours ce week-end</p>
          </div>
        ) : todayEvents.length === 0 ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Aucun cours prévu</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {todayEvents.map(event => {
              const colors = courseTypeColors[event.type]
              const isUpcoming = event.id === upcomingEvent?.id
              
              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-lg border-l-3 p-3 transition-colors",
                    colors.bg,
                    colors.border,
                    isUpcoming && "ring-1 ring-primary"
                  )}
                >
                  {isUpcoming && (
                    <span className="mb-1 inline-block rounded-full bg-primary/30 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Prochain cours
                    </span>
                  )}
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.startTime} - {event.endTime}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.room}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
