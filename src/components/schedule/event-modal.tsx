"use client"

import { X, Clock, MapPin, User, BookOpen, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScheduleEvent, courseTypeColors, courseTypeLabels as staticCourseTypeLabels, weekDays as staticWeekDays } from "@/lib/schedule-data"
import { useTranslation } from "react-i18next"

interface EventModalProps {
  event: ScheduleEvent | null
  onClose: () => void
}

export function EventModal({ event, onClose }: EventModalProps) {
  const { t } = useTranslation()
  if (!event) return null

  const colors = courseTypeColors[event.type]
  const courseTypeLabels = t('dean.scheduling.common.course_types', { returnObjects: true }) as Record<string, string>;
  const weekDays = t('dean.scheduling.common.days', { returnObjects: true }) as string[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          {/* Header with color accent */}
          <div className={cn(
            "relative px-6 pb-6 pt-12",
            colors.bg
          )}>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-foreground/70 transition-colors hover:bg-background/20 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <span className={cn(
              "inline-block rounded-full px-3 py-1 text-xs font-medium",
              "bg-background/20 text-foreground"
            )}>
              {courseTypeLabels[event.type]}
            </span>

            <h2 className="mt-3 text-2xl font-bold text-foreground">
              {event.title}
            </h2>
          </div>

          {/* Content */}
          <div className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('dean.scheduling.event_modal.labels.day')}
                  </p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {weekDays[event.day]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <Clock className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('dean.scheduling.event_modal.labels.schedule')}
                  </p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <User className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('dean.scheduling.event_modal.labels.teacher')}
                  </p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {event.professor}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('dean.scheduling.event_modal.labels.room')}
                  </p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {event.room}
                  </p>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <BookOpen className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('dean.scheduling.event_modal.labels.description')}
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {event.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border bg-secondary/30 px-6 py-4">
            <Button variant="outline" onClick={onClose}>
              {t('dean.scheduling.event_modal.actions.close')}
            </Button>
            <Button>
              {t('dean.scheduling.event_modal.actions.modify')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
