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
  onExportJSON?: () => void
  onExportPDF?: () => void
  onImportClick?: () => void
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
  onExportJSON,
  onExportPDF,
  onImportClick,
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
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-4 w-4" />
              <span>Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Données</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem onClick={onImportClick}>
              <Plus className="mr-2 h-4 w-4" />
              Importer JSON
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem onClick={onExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Exporter JSON
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Rendu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem onClick={onExportPDF}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Exporter PDF
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
      </div>
    </div>
  )
}
