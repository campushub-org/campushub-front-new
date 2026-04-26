"use client"

import { useState } from "react"
import { ChevronDown, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScheduleEvent } from "@/lib/schedule-data"

interface ResourceFiltersProps {
  events: ScheduleEvent[]
  selectedProfessors: string[]
  selectedRooms: string[]
  selectedLevels: string[]
  onProfessorToggle: (professor: string) => void
  onRoomToggle: (room: string) => void
  onLevelToggle: (level: string) => void
}

export function ResourceFilters({
  events,
  selectedProfessors,
  selectedRooms,
  selectedLevels,
  onProfessorToggle,
  onRoomToggle,
  onLevelToggle
}: ResourceFiltersProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("professors")

  // Extract unique resources
  const professors = Array.from(new Set(events.map(e => e.professor))).sort()
  const rooms = Array.from(new Set(events.map(e => e.room))).sort()
  const levels = ["L1", "L2", "L3", "M1", "M2"]

  const clearAllFilters = () => {
    // Clear by calling toggle for each selected item
    selectedProfessors.forEach(onProfessorToggle)
    selectedRooms.forEach(onRoomToggle)
    selectedLevels.forEach(onLevelToggle)
  }

  const totalFilters = selectedProfessors.length + selectedRooms.length + selectedLevels.length

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filtrer par ressource</h3>
        {totalFilters > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Professors Section */}
      <div className="rounded-lg border border-border bg-secondary/30">
        <button
          onClick={() => setExpandedSection(expandedSection === "professors" ? null : "professors")}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Enseignants</span>
          <div className="flex items-center gap-2">
            {selectedProfessors.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                {selectedProfessors.length}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expandedSection === "professors" && "rotate-180"
              )}
            />
          </div>
        </button>

        {expandedSection === "professors" && (
          <div className="border-t border-border px-3 py-2 space-y-1.5 max-h-48 overflow-y-auto">
            {professors.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Aucun enseignant</p>
            ) : (
              professors.map(professor => (
                <label
                  key={professor}
                  className="flex items-center gap-2 cursor-pointer group hover:bg-secondary/30 px-1.5 py-1.5 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedProfessors.includes(professor)}
                    onChange={() => onProfessorToggle(professor)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "h-4 w-4 rounded border border-border flex items-center justify-center transition-colors",
                    selectedProfessors.includes(professor)
                      ? "bg-primary border-primary"
                      : "bg-secondary group-hover:border-primary/50"
                  )}>
                    {selectedProfessors.includes(professor) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs text-foreground">{professor}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Rooms Section */}
      <div className="rounded-lg border border-border bg-secondary/30">
        <button
          onClick={() => setExpandedSection(expandedSection === "rooms" ? null : "rooms")}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Salles</span>
          <div className="flex items-center gap-2">
            {selectedRooms.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                {selectedRooms.length}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expandedSection === "rooms" && "rotate-180"
              )}
            />
          </div>
        </button>

        {expandedSection === "rooms" && (
          <div className="border-t border-border px-3 py-2 space-y-1.5 max-h-48 overflow-y-auto">
            {rooms.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Aucune salle</p>
            ) : (
              rooms.map(room => (
                <label
                  key={room}
                  className="flex items-center gap-2 cursor-pointer group hover:bg-secondary/30 px-1.5 py-1.5 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes(room)}
                    onChange={() => onRoomToggle(room)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "h-4 w-4 rounded border border-border flex items-center justify-center transition-colors",
                    selectedRooms.includes(room)
                      ? "bg-primary border-primary"
                      : "bg-secondary group-hover:border-primary/50"
                  )}>
                    {selectedRooms.includes(room) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs text-foreground">{room}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Levels Section */}
      <div className="rounded-lg border border-border bg-secondary/30">
        <button
          onClick={() => setExpandedSection(expandedSection === "levels" ? null : "levels")}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Niveaux</span>
          <div className="flex items-center gap-2">
            {selectedLevels.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                {selectedLevels.length}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expandedSection === "levels" && "rotate-180"
              )}
            />
          </div>
        </button>

        {expandedSection === "levels" && (
          <div className="border-t border-border px-3 py-2 space-y-1.5">
            {levels.map(level => (
              <label
                key={level}
                className="flex items-center gap-2 cursor-pointer group hover:bg-secondary/30 px-1.5 py-1.5 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level)}
                  onChange={() => onLevelToggle(level)}
                  className="sr-only"
                />
                <div className={cn(
                  "h-4 w-4 rounded border border-border flex items-center justify-center transition-colors",
                  selectedLevels.includes(level)
                    ? "bg-primary border-primary"
                    : "bg-secondary group-hover:border-primary/50"
                )}>
                  {selectedLevels.includes(level) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-xs text-foreground">{level}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {totalFilters > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary mb-2">Filtres actifs:</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedProfessors.map(prof => (
              <button
                key={prof}
                onClick={() => onProfessorToggle(prof)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors"
              >
                {prof}
                <X className="h-3 w-3" />
              </button>
            ))}
            {selectedRooms.map(room => (
              <button
                key={room}
                onClick={() => onRoomToggle(room)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors"
              >
                {room}
                <X className="h-3 w-3" />
              </button>
            ))}
            {selectedLevels.map(level => (
              <button
                key={level}
                onClick={() => onLevelToggle(level)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors"
              >
                {level}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
