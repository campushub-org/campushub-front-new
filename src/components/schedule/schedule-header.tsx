"use client"

import { ChevronLeft, ChevronRight, Calendar, Filter, Download, Plus, LayoutGrid, List, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CourseType, courseTypeLabels } from "@/lib/schedule-data"

type ViewMode = "week" | "day" | "month"

interface ScheduleHeaderProps {
  currentDate: Date
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  selectedTypes: CourseType[]
  onTypeToggle: (type: CourseType) => void
}

export function ScheduleHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  selectedTypes,
  onTypeToggle,
}: ScheduleHeaderProps) {
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }
    
    if (viewMode === "week") {
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 4)
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startOfWeek.toLocaleDateString("fr-FR", options)}`
      }
      return `${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString("fr-FR", { month: "short" })} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString("fr-FR", options)}`
    }
    
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("fr-FR", { 
        weekday: "long", 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })
    }
    
    return currentDate.toLocaleDateString("fr-FR", options)
  }

  const viewModes: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: "day", label: "Jour", icon: <CalendarDays className="h-4 w-4" /> },
    { mode: "week", label: "Semaine", icon: <LayoutGrid className="h-4 w-4" /> },
    { mode: "month", label: "Mois", icon: <Calendar className="h-4 w-4" /> },
  ]

  const allTypes: CourseType[] = ["lecture", "td", "tp", "exam", "meeting"]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
      {/* Left side - Navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-8 text-xs font-medium"
        >
          Aujourd&apos;hui
        </Button>

        <h2 className="text-lg font-semibold text-foreground capitalize">
          {formatDateRange()}
        </h2>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* View mode toggle */}
        <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-1">
          {viewModes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                viewMode === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtrer</span>
              {selectedTypes.length < 5 && (
                <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Type de cours</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => onTypeToggle(type)}
              >
                {courseTypeLabels[type]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export button */}
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Exporter</span>
        </Button>

        {/* Add event button */}
        <Button size="sm" className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ajouter</span>
        </Button>
      </div>
    </div>
  )
}
