"use client"

import { useState, useEffect } from "react"
import {
  X,
  Trash2,
  Copy,
  Clock,
  User,
  MapPin,
  BookOpen,
  Calendar,
  AlertCircle,
  Repeat,
  Users,
  Bell,
  Tag,
  Save,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  ScheduleEvent,
  CourseType,
  courseTypeLabels,
  courseTypeColors,
  weekDays,
} from "@/lib/schedule-data"

interface EventDrawerProps {
  isOpen: boolean
  event: ScheduleEvent | null
  isNew?: boolean
  onClose: () => void
  onSave: (event: ScheduleEvent) => void
  onDelete?: (eventId: string) => void
  onDuplicate?: (event: ScheduleEvent) => void
}

const professors = [
  "Dr. Martin Dupont",
  "Prof. Sophie Laurent",
  "M. Thomas Bernard",
  "Dr. Claire Morel",
  "Prof. Jean Petit",
  "Dr. Marie Leroy",
  "M. Lucas Girard",
]

const rooms = [
  "Amphi A",
  "Amphi B",
  "Amphi C",
  "Salle 204",
  "Salle 205",
  "Salle 301",
  "Labo Info 1",
  "Labo Info 2",
  "Labo Info 3",
  "Salle Réunion 1",
  "Salle Réunion 2",
]

const generateTimeOptions = () => {
  const times: string[] = []
  for (let h = 8; h <= 19; h++) {
    times.push(`${h.toString().padStart(2, "0")}:00`)
    if (h < 19) {
      times.push(`${h.toString().padStart(2, "0")}:15`)
      times.push(`${h.toString().padStart(2, "0")}:30`)
      times.push(`${h.toString().padStart(2, "0")}:45`)
    }
  }
  return times
}

const timeOptions = generateTimeOptions()

export function EventDrawer({
  isOpen,
  event,
  isNew = false,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: EventDrawerProps) {
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [showRecurrence, setShowRecurrence] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  useEffect(() => {
    if (event) {
      setFormData({ ...event })
    } else if (isNew) {
      setFormData({
        id: `new-${Date.now()}`,
        title: "",
        type: "lecture",
        professor: "",
        room: "",
        startTime: "08:00",
        endTime: "10:00",
        day: 0,
        description: "",
      })
    }
    setHasChanges(false)
    setActiveTab("general")
  }, [event, isNew])

  const handleChange = (field: keyof ScheduleEvent, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (formData.title && formData.type && formData.startTime && formData.endTime) {
      onSave(formData as ScheduleEvent)
      setHasChanges(false)
    }
  }

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return "0h"
    const [startH, startM] = formData.startTime.split(":").map(Number)
    const [endH, endM] = formData.endTime.split(":").map(Number)
    const minutes = (endH * 60 + endM) - (startH * 60 + startM)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`
  }

  if (!isOpen) return null

  const colors = formData.type ? courseTypeColors[formData.type as CourseType] : courseTypeColors.lecture

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-lg transform bg-card shadow-2xl transition-transform duration-300",
          "border-l border-border",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className={cn("border-b border-border p-4", colors.bg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", colors.bg, colors.border, "border-l-4")}>
                <BookOpen className={cn("h-5 w-5", colors.text)} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isNew ? "Nouvel Événement" : "Modifier l'Événement"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formData.type && courseTypeLabels[formData.type as CourseType]}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Actions */}
          {!isNew && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => event && onDuplicate?.(event)}
                className="gap-1.5"
              >
                <Copy className="h-4 w-4" />
                Dupliquer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => event && onDelete?.(event.id)}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-180px)] flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
            <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3 bg-secondary">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="general" className="m-0 space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Titre de l&apos;événement
                  </Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ex: Algorithmique Avancée"
                    className="bg-secondary/50"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Type d&apos;événement</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(courseTypeLabels) as CourseType[]).map((type) => {
                      const typeColors = courseTypeColors[type]
                      const isSelected = formData.type === type
                      return (
                        <button
                          key={type}
                          onClick={() => handleChange("type", type)}
                          className={cn(
                            "rounded-lg border-2 p-3 text-center transition-all",
                            isSelected
                              ? cn(typeColors.bg, typeColors.border, "border-l-4")
                              : "border-border bg-secondary/30 hover:bg-secondary"
                          )}
                        >
                          <span className={cn("text-xs font-medium", isSelected && typeColors.text)}>
                            {courseTypeLabels[type]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Day and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Jour</Label>
                    <Select
                      value={formData.day?.toString()}
                      onValueChange={(v) => handleChange("day", parseInt(v))}
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day, index) => (
                          <SelectItem key={day} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Durée</Label>
                    <div className="flex h-10 items-center rounded-md bg-secondary/50 px-3">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{calculateDuration()}</span>
                    </div>
                  </div>
                </div>

                {/* Time Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Horaires</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.startTime}
                      onValueChange={(v) => handleChange("startTime", v)}
                    >
                      <SelectTrigger className="flex-1 bg-secondary/50">
                        <SelectValue placeholder="Début" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`start-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex h-10 w-10 items-center justify-center">
                      <GripVertical className="h-4 w-4 rotate-90 text-muted-foreground" />
                    </div>

                    <Select
                      value={formData.endTime}
                      onValueChange={(v) => handleChange("endTime", v)}
                    >
                      <SelectTrigger className="flex-1 bg-secondary/50">
                        <SelectValue placeholder="Fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`end-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="m-0 space-y-4">
                {/* Professor */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    <User className="mr-1.5 inline h-4 w-4" />
                    Enseignant
                  </Label>
                  <Select
                    value={formData.professor}
                    onValueChange={(v) => handleChange("professor", v)}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {professors.map((prof) => (
                        <SelectItem key={prof} value={prof}>
                          {prof}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    <MapPin className="mr-1.5 inline h-4 w-4" />
                    Salle
                  </Label>
                  <Select
                    value={formData.room}
                    onValueChange={(v) => handleChange("room", v)}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Ajouter une description..."
                    className="min-h-[100px] bg-secondary/50"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    <Tag className="mr-1.5 inline h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Obligatoire</Badge>
                    <Badge variant="outline">Semestre 1</Badge>
                    <Badge variant="outline">L3 Info</Badge>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      + Ajouter
                    </Button>
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    <Users className="mr-1.5 inline h-4 w-4" />
                    Capacité
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      className="w-20 bg-secondary/50"
                      defaultValue={30}
                    />
                    <span className="text-sm text-muted-foreground">étudiants inscrits</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="options" className="m-0 space-y-4">
                {/* Recurrence */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary p-2">
                        <Repeat className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Récurrence</p>
                        <p className="text-xs text-muted-foreground">
                          Répéter cet événement
                        </p>
                      </div>
                    </div>
                    <Switch checked={showRecurrence} onCheckedChange={setShowRecurrence} />
                  </div>

                  {showRecurrence && (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      <Select defaultValue="weekly">
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Quotidien</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Jusqu&apos;au:</span>
                        <Input type="date" className="flex-1 bg-secondary/50" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Notifications</p>
                      <p className="text-xs text-muted-foreground">Rappels pour cet événement</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email</span>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(v) =>
                          setNotifications((prev) => ({ ...prev, email: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Push</span>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(v) =>
                          setNotifications((prev) => ({ ...prev, push: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SMS</span>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(v) =>
                          setNotifications((prev) => ({ ...prev, sms: v }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Conflict Warning */}
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-400">Conflit détecté</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        La salle &quot;Amphi A&quot; est déjà réservée pour &quot;Mathématiques&quot; de 8h00 à
                        10h00.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              {hasChanges && (
                <span className="text-xs text-amber-400">Modifications non sauvegardées</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges && !isNew} className="gap-1.5">
                <Save className="h-4 w-4" />
                {isNew ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
