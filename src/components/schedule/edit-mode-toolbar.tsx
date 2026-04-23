"use client"

import {
  Pencil,
  Eye,
  Plus,
  Undo2,
  Redo2,
  Download,
  Upload,
  Printer,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EditModeToolbarProps {
  isEditMode: boolean
  onToggleEditMode: () => void
  onAddEvent: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  hasConflicts?: boolean
}

export function EditModeToolbar({
  isEditMode,
  onToggleEditMode,
  onAddEvent,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  hasConflicts = false,
}: EditModeToolbarProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border p-2 transition-all -ml-20",
          isEditMode
            ? "border-primary/50 bg-primary/10"
            : "border-border bg-card"
        )}
      >
        {/* Mode Toggle */}
        <div className="flex items-center rounded-lg bg-secondary p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={!isEditMode ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-1.5 px-3",
                  !isEditMode && "bg-primary text-primary-foreground"
                )}
                onClick={() => isEditMode && onToggleEditMode()}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Aperçu</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mode visualisation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isEditMode ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-1.5 px-3",
                  isEditMode && "bg-primary text-primary-foreground"
                )}
                onClick={() => !isEditMode && onToggleEditMode()}
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Édition</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mode édition</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onAddEvent}
                disabled={!isEditMode}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ajouter un événement</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onUndo}
                disabled={!canUndo || !isEditMode}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Annuler (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRedo}
                disabled={!canRedo || !isEditMode}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rétablir (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Import/Export */}
        <div className="hidden items-center gap-1 md:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exporter</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Importer</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Printer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Imprimer</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1" />

        {/* Status */}
        {isEditMode && hasConflicts && (
            <Badge variant="destructive" className="gap-1 mx-4">
                <AlertTriangle className="h-3 w-3" />
                Conflits
            </Badge>
        )}
      </div>
    </TooltipProvider>
  )
}
