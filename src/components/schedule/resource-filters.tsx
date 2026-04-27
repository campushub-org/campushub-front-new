"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Check, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ScheduleEvent } from "@/lib/schedule-data"

interface ResourceFiltersProps {
  events: ScheduleEvent[]
  allProfessors: string[]
  allRooms: string[]
  selectedProfessors: string[]
  selectedRooms: string[]
  selectedLevels: string[]
  onProfessorToggle: (professor: string) => void
  onRoomToggle: (room: string) => void
  onLevelToggle: (level: string) => void
}

export function ResourceFilters({
  events,
  allProfessors,
  allRooms,
  selectedProfessors,
  selectedRooms,
  selectedLevels,
  onProfessorToggle,
  onRoomToggle,
  onLevelToggle
}: ResourceFiltersProps) {
  // Par défaut, la section Niveaux est ouverte
  const [expandedSection, setExpandedSection] = useState<string | null>("levels")
  const [showOnlyActive, setShowOnlyActive] = useState(false)

  // Extract unique resources from currently loaded events
  const activeProfessors = useMemo(() => Array.from(new Set(events.map(e => e.professor))).sort(), [events])
  const activeRooms = useMemo(() => Array.from(new Set(events.map(e => e.room))).sort(), [events])
  const activeLevels = useMemo(() => Array.from(new Set(events.map(e => e.level).filter(Boolean) as string[])).sort(), [events])

  // Final lists based on toggle
  const professorsList = showOnlyActive ? activeProfessors : allProfessors
  const roomsList = showOnlyActive ? activeRooms : allRooms
  const levelsList = showOnlyActive ? activeLevels : ["L1", "L2", "L3", "M1", "M2"]

  const clearAllFilters = () => {
    // Nettoyer profs et salles, mais garder le niveau (obligatoire)
    selectedProfessors.forEach(onProfessorToggle)
    selectedRooms.forEach(onRoomToggle)
  }

  const totalFilters = selectedProfessors.length + selectedRooms.length + selectedLevels.length

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Filtrer par ressource
          </h3>
          {totalFilters > 1 && ( // On ne montre réinitialiser que s'il y a plus que le niveau par défaut
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Dynamic Toggle Switch */}
        <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 p-2.5 transition-colors">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="active-mode" className="text-sm font-medium text-foreground">
              Mode d'affichage
            </Label>
            <span className="text-xs text-muted-foreground">
              {showOnlyActive ? "Seulement programmés" : "Toutes les ressources"}
            </span>
          </div>
          <Switch 
            id="active-mode" 
            checked={showOnlyActive} 
            onCheckedChange={setShowOnlyActive}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {/* Levels Section - FIRST */}
      <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
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
            {levelsList.map(level => (
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

      {/* Professors Section */}
      <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
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
          <div className="border-t border-border px-3 py-2 space-y-1.5 bg-card/20">
            <div className="flex gap-2 mb-2 pb-2 border-b border-border/30">
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => professorsList.forEach(p => !selectedProfessors.includes(p) && onProfessorToggle(p))}>Tout cocher</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => selectedProfessors.forEach(onProfessorToggle)}>Tout décocher</Button>
            </div>
            {professorsList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">Aucun enseignant trouvé</p>
            ) : (
              professorsList.map(professor => (
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
                  <span className="text-xs text-foreground truncate">{professor}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Rooms Section */}
      <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
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
          <div className="border-t border-border px-3 py-2 space-y-1.5 bg-card/20">
             <div className="flex gap-2 mb-2 pb-2 border-b border-border/30">
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => roomsList.forEach(r => !selectedRooms.includes(r) && onRoomToggle(r))}>Tout cocher</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => selectedRooms.forEach(onRoomToggle)}>Tout décocher</Button>
            </div>
            {roomsList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">Aucune salle trouvée</p>
            ) : (
              roomsList.map(room => (
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
                  <span className="text-xs text-foreground truncate">{room}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {totalFilters > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary mb-2">Filtres actifs:</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedLevels.map(level => (
              <button
                key={level}
                onClick={() => onLevelToggle(level)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors"
              >
                {level}
                {selectedLevels.length > 1 && <X className="h-3 w-3" />}
              </button>
            ))}
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
          </div>
        </div>
      )}
    </div>
  )
}
