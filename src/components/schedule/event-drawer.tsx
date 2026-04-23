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
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
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
import api from "@/lib/api"

interface EventDrawerProps {
  isOpen: boolean
  event: ScheduleEvent | null
  currentDate: Date
  isNew?: boolean
  onClose: () => void
  onSave: (event: ScheduleEvent | ScheduleEvent[]) => void
  onDelete?: (eventId: string) => void
  onDuplicate?: (event: ScheduleEvent) => void
}

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

const durationOptions = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "1h30", value: 90 },
  { label: "2h", value: 120 },
  { label: "2h30", value: 150 },
  { label: "3h", value: 180 },
  { label: "4h", value: 240 },
]

export function EventDrawer({
  isOpen,
  event,
  isNew = false,
  workingDate,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: EventDrawerProps) {
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  
  const [recurrenceFreq, setRecurrenceFreq] = useState("weekly")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("")
  
  // Real subjects data state
  const [subjects, setSubjects] = useState<{code: string, name: string}[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  
  // Real teachers data state
  const [teachers, setTeachers] = useState<{id: number, fullName: string}[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  
  // Real rooms data state
  const [rooms, setRooms] = useState<{id: number, nom: string}[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)

  // Fetch teachers and rooms based on department (default INFO)
  useEffect(() => {
    const fetchDependencies = async () => {
      setLoadingTeachers(true)
      setLoadingRooms(true)
      try {
        const [teachersRes, roomsRes] = await Promise.all([
          api.get(`/campushub-user-service/api/users/teachers/department/INFO`),
          api.get(`/campushub-salle-service/api/salles?filiere=INFO`)
        ])
        setTeachers(teachersRes.data)
        // roomsRes.data contient les objets salles complets avec id et nom
        setRooms(roomsRes.data)
      } catch (err) {
        console.error("Error fetching dependencies", err)
      } finally {
        setLoadingTeachers(false)
        setLoadingRooms(false)
      }
    }
    fetchDependencies()
  }, [])

  // Fetch subjects when level or semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      const levelStr = formData.level || "L1"
      const levelMap: Record<string, number> = { "L1": 1, "L2": 2, "L3": 3, "M1": 4, "M2": 5 }
      const semester = formData.semester || 1
      
      setLoadingSubjects(true)
      try {
        const response = await api.get(`/campushub-scheduling-service/api/subjects?niveau=${levelMap[levelStr]}&semestre=${semester}`)
        setSubjects(response.data)
      } catch (err) {
        console.error("Error fetching subjects", err)
      } finally {
        setLoadingSubjects(false)
      }
    }
    
    if (isOpen) fetchSubjects()
  }, [formData.level, formData.semester, isOpen])

  const [showRecurrence, setShowRecurrence] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  // Real conflict state
  const [conflict, setConflict] = useState<string | null>(null)
  
  useEffect(() => {
    const checkConflict = async () => {
      if (!formData.room || !formData.startTime || formData.day === undefined) return
      
      console.log("Checking conflict for:", formData);
      try {
        const response = await api.post("/campushub-scheduling-service/api/scheduling/check-conflicts", formData)
        if (response.data === true) {
          setConflict("Un autre cours est déjà programmé dans cette salle à cette heure.")
        } else {
          setConflict(null)
        }
      } catch (err) {
        console.error("Conflict check failed", err)
      }
    }
    checkConflict()
  }, [formData.room, formData.startTime, formData.day])

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
        teacherId: undefined,
        roomId: undefined,
        startTime: "08:00",
        endTime: "10:00",
        day: 0,
        description: "",
        semester: 1,
        academicYear: "2025-2026",
      })
    }
    setHasChanges(false)
    setActiveTab("general")
  }, [event, isNew])

  const handleChange = (field: keyof ScheduleEvent, value: string | number) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      
      // Si startTime ou endTime change, on recalcule la durée si nécessaire
      // Note: On ne force pas la recalcul ici pour éviter les boucles, 
      // la durée est calculée dynamiquement via getCurrentDuration() pour l'affichage.
      return next
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (formData.title && formData.type && formData.startTime && formData.endTime) {
      try {
        let payload;
        let endpoint = "/campushub-scheduling-service/api/scheduling/events";
        
        // Nettoyer l'ID temporaire avant l'envoi au backend
        const cleanFormData = { ...formData };
        if (cleanFormData.id && cleanFormData.id.startsWith("new-")) {
          delete cleanFormData.id;
        }

        if (showRecurrence && recurrenceEndDate) {
          const seriesId = `serie-${Date.now()}`;
          const endDate = new Date(recurrenceEndDate);
          const recurringEvents: ScheduleEvent[] = [];
          
          let startDate = new Date(workingDate);
          const targetDay = formData.day ?? 0;
          const currentDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
          startDate.setDate(startDate.getDate() + (targetDay - currentDay));

          const step = recurrenceFreq === "daily" ? 1 : (recurrenceFreq === "weekly" ? 7 : 14);
          
          let loopDate = new Date(startDate);
          while (loopDate <= endDate) {
            recurringEvents.push({
              ...(cleanFormData as ScheduleEvent),
              seriesId: seriesId,
              day: targetDay,
              academicYear: formData.academicYear || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
              semester: formData.semester || 1,
            });
            loopDate.setDate(loopDate.getDate() + step);
          }
          payload = recurringEvents;
          endpoint = "/campushub-scheduling-service/api/scheduling/batch-save";
        } else {
          payload = { 
            ...cleanFormData, 
            seriesId: formData.seriesId || null,
            academicYear: formData.academicYear || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
            semester: formData.semester || 1
          };
        }

        console.log("Payload envoyé au backend :", payload);

        await api.post(endpoint, payload);
        toast.success("Enregistré avec succès !");
        onSave(payload as any);
        onClose();
        setHasChanges(false);
      } catch (e) {
        toast.error("Erreur de sauvegarde");
        console.error(e);
      }
    }
  };

  const handleDurationChange = (minutes: number) => {
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(":").map(Number)
      const totalMinutes = h * 60 + m + minutes
      const newH = Math.floor(totalMinutes / 60)
      const newM = totalMinutes % 60
      const newEndTime = `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`
      
      setFormData((prev) => ({ ...prev, endTime: newEndTime }))
      setHasChanges(true)
    }
  }

  const getCurrentDuration = () => {
    if (!formData.startTime || !formData.endTime) return 60
    const [sh, sm] = formData.startTime.split(":").map(Number)
    const [eh, em] = formData.endTime.split(":").map(Number)
    return (eh * 60 + em) - (sh * 60 + sm)
  }

  const calculateDuration = () => {
    const minutes = getCurrentDuration()
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
                {/* Academic Year */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Année Scolaire</Label>
                  <Select
                    value={formData.academicYear || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`}
                    onValueChange={(v) => handleChange("academicYear", v)}
                  >
                    <SelectTrigger className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                      <SelectValue placeholder="Sélectionner l'année" />
                    </SelectTrigger>
                    <SelectContent className="border-blue-500/20">
                      {Array.from({ length: 2 }, (_, i) => {
                        const start = new Date().getFullYear() - 1 + i;
                        const yearRange = `${start}-${start + 1}`;
                        return (
                          <SelectItem 
                            key={yearRange} 
                            value={yearRange}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
                            {yearRange}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Niveau académique
                  </Label>
                  <Select
                    value={formData.level || "L1"}
                    onValueChange={(v) => handleChange("level", v)}
                  >
                    <SelectTrigger id="level" className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                      <SelectValue placeholder="Sélectionner le niveau" />
                    </SelectTrigger>
                    <SelectContent className="border-blue-500/20">
                      {["L1", "L2", "L3", "M1", "M2"].map((lvl) => (
                        <SelectItem 
                          key={lvl} 
                          value={lvl}
                          className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                        >
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Semester */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Semestre</Label>
                  <Select
                    value={formData.semester?.toString() || "1"}
                    onValueChange={(v) => handleChange("semester", parseInt(v))}
                  >
                    <SelectTrigger className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="border-blue-500/20">
                      {[1, 2].map((sem) => (
                        <SelectItem 
                          key={sem} 
                          value={sem.toString()}
                          className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                        >
                          Semestre {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Cours / Matière
                  </Label>
                  <Select
                    value={formData.title || ""}
                    onValueChange={(v) => {
                      const selected = subjects.find(s => s.name === v || s.code === v);
                      setFormData(prev => ({ 
                        ...prev, 
                        title: selected?.name || v, 
                        subjectCode: selected?.code || "" 
                      }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger id="title" className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors flex justify-start text-left">
                      {loadingSubjects ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      <SelectValue placeholder="Sélectionner une UE" className="text-left" />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-md border-blue-500/20">
                      {subjects.length > 0 ? (
                        subjects.map((sub) => (
                          <SelectItem 
                            key={sub.code} 
                            value={sub.name || sub.code || "unknown"}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
                            <div className="flex flex-col min-w-0 w-full overflow-hidden">
                              <span className="font-medium truncate w-full">{sub.name}</span>
                              <span className="text-xs text-muted-foreground truncate w-full">{sub.code}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-subject" disabled>Aucune matière disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
                      <SelectTrigger className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="border-blue-500/20">
                        {weekDays.map((day, index) => (
                          <SelectItem 
                            key={day} 
                            value={index.toString()}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Durée</Label>
                    <Select
                      value={getCurrentDuration().toString()}
                      onValueChange={(v) => handleDurationChange(parseInt(v))}
                    >
                      <SelectTrigger className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-blue-400" />
                          <SelectValue placeholder="Durée" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-blue-500/20">
                        {durationOptions.map((opt) => (
                          <SelectItem 
                            key={opt.value} 
                            value={opt.value.toString()}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <SelectTrigger className="flex-1 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        <SelectValue placeholder="Début" />
                      </SelectTrigger>
                      <SelectContent className="border-blue-500/20">
                        {timeOptions.map((time) => (
                          <SelectItem 
                            key={`start-${time}`} 
                            value={time}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex h-10 w-10 items-center justify-center">
                      <GripVertical className="h-4 w-4 rotate-90 text-blue-400/50" />
                    </div>

                    <Select
                      value={formData.endTime}
                      onValueChange={(v) => handleChange("endTime", v)}
                    >
                      <SelectTrigger className="flex-1 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        <SelectValue placeholder="Fin" />
                      </SelectTrigger>
                      <SelectContent className="border-blue-500/20">
                        {timeOptions.map((time) => (
                          <SelectItem 
                            key={`end-${time}`} 
                            value={time}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
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
                    value={formData.teacherId?.toString() || ""}
                    onValueChange={(v) => handleChange("teacherId", parseInt(v))}
                  >
                    <SelectTrigger className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors flex justify-start text-left">
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent className="border-blue-500/20">
                      {loadingTeachers ? (
                        <SelectItem value="loading" disabled>Chargement...</SelectItem>
                      ) : teachers.length > 0 ? (
                        teachers.map((prof) => (
                          <SelectItem 
                            key={prof.id} 
                            value={prof.id.toString()}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
                            <span className="truncate">{prof.fullName}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Aucun enseignant trouvé</SelectItem>
                      )}
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
                    value={formData.roomId?.toString() || ""}
                    onValueChange={(v) => handleChange("roomId", parseInt(v))}
                  >
                    <SelectTrigger className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors flex justify-start text-left">
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent className="border-blue-500/20">
                      {loadingRooms ? (
                        <SelectItem value="loading" disabled>Chargement...</SelectItem>
                      ) : rooms.length > 0 ? (
                        rooms.map((room) => (
                          <SelectItem 
                            key={room.id} 
                            value={room.id.toString()}
                            className="focus:bg-blue-500/20 focus:text-blue-400 border-l-2 border-transparent focus:border-blue-500"
                          >
                            <span className="truncate">{room.nom}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Aucune salle trouvée</SelectItem>
                      )}
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
                    className="min-h-[100px] bg-blue-500/10 border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2">
                        <Repeat className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Récurrence</p>
                        <p className="text-xs text-muted-foreground">
                          Répéter cet événement
                        </p>
                      </div>
                    </div>
                    <Switch 
                        checked={showRecurrence} 
                        onCheckedChange={setShowRecurrence}
                        className="data-[state=checked]:bg-blue-500"
                    />
                  </div>

                  {showRecurrence && (
                    <div className="mt-4 space-y-3 border-t border-blue-500/10 pt-4">
                      <Select value={recurrenceFreq} onValueChange={setRecurrenceFreq}>
                        <SelectTrigger className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-blue-500/20">
                          <SelectItem value="daily" className="focus:bg-blue-500/20 focus:text-blue-400">Quotidien</SelectItem>
                          <SelectItem value="weekly" className="focus:bg-blue-500/20 focus:text-blue-400">Hebdomadaire</SelectItem>
                          <SelectItem value="biweekly" className="focus:bg-blue-500/20 focus:text-blue-400">Bi-hebdomadaire</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-muted-foreground">Jusqu&apos;au:</span>
                        <Input 
                            type="date" 
                            className="bg-blue-500/10 border-blue-500/20 focus:border-blue-500" 
                            value={recurrenceEndDate}
                            onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        />
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
                {conflict && (
                  <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-amber-400">Conflit détecté</p>
                        <p className="mt-1 text-xs text-muted-foreground">{conflict}</p>
                      </div>
                    </div>
                  </div>
                )}
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
