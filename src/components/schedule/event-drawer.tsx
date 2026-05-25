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
  Bell,
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
  planId?: string
  workingDate: Date
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
  planId,
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
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })
  
  // Real subjects data state
  const [subjects, setSubjects] = useState<{code: string, name: string}[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  
  // Real teachers data state
  const [teachers, setTeachers] = useState<{id: number, fullName: string}[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  
  // Assignments for the selected subject
  const [assignments, setAssignments] = useState<{id: number, teacherName: string, role: string}[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  
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

  // Fetch assignments when subject changes
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!formData.subjectCode) {
        setAssignments([])
        return
      }
      setLoadingAssignments(true)
      try {
        const response = await api.get(`/campushub-scheduling-service/api/scheduling/assignments/subject/${formData.subjectCode}`)
        setAssignments(response.data)
      } catch (err) {
        console.error("Error fetching assignments", err)
      } finally {
        setLoadingAssignments(false)
      }
    }
    fetchAssignments()
  }, [formData.subjectCode])

  useEffect(() => {
    if (event) {
      setFormData(event)
      setHasChanges(false)
    } else {
      setFormData({
        type: "lecture",
        startTime: "08:00",
        endTime: "10:00",
        day: 0,
      })
    }
  }, [event])

  // Charger les matières au montage
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true)
      try {
        const response = await api.get('/campushub-scheduling-service/api/subjects')
        setSubjects(response.data)
      } catch (err) {
        console.error("Error fetching subjects", err)
      } finally {
        setLoadingSubjects(false)
      }
    }
    
    if (isOpen) fetchSubjects()
  }, [isOpen])

  const [isSaving, setIsSaving] = useState(false)
  const [conflict, setConflict] = useState(false)

  const handleSave = async () => {
    if (formData.title || formData.subjectCode) {
      setIsSaving(true)
      try {
        let endpoint = "/campushub-scheduling-service/api/scheduling/events";
        if (formData.id && !formData.id.toString().startsWith("new-")) {
            endpoint = `${endpoint}/${formData.id}`;
        }
        
        // Nettoyer l'ID temporaire avant l'envoi au backend
        const cleanFormData = { ...formData };
        if (cleanFormData.id && cleanFormData.id.toString().startsWith("new-")) {
          delete cleanFormData.id;
        }

        const payload = { 
          ...cleanFormData, 
          planId: planId || formData.planId, 
          seriesId: formData.seriesId || null ,
          academicYear: formData.academicYear || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
          semester: formData.semester || 1
        };

        console.log("Payload envoyé au backend :", payload);

        if (formData.id && !formData.id.toString().startsWith("new-")) {
            await api.put(endpoint, payload);
        } else {
            await api.post(endpoint, payload);
        }

        toast.success("Enregistré avec succès !");
        onSave(payload as any);
        onClose();
        setHasChanges(false);
      } catch (e) {
        toast.error("Erreur de sauvegarde");
        console.error(e);
      } finally {
        setIsSaving(false);
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

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl animate-in slide-in-from-right duration-300 sm:w-[500px] border-l border-border/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl p-2.5 shadow-sm", formData.type ? courseTypeColors[formData.type].bg : "bg-primary/10")}>
            <Calendar className={cn("h-5 w-5", formData.type ? courseTypeColors[formData.type].text : "text-primary")} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {isNew ? "Nouvel événement" : "Modifier l'événement"}
            </h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {formData.type ? courseTypeLabels[formData.type] : "Chargement..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && onDuplicate && (
            <Button variant="ghost" size="icon" onClick={() => onDuplicate(event as ScheduleEvent)} className="h-9 w-9">
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {!isNew && onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(event!.id)} className="h-9 w-9 text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl mb-8">
            <TabsTrigger value="general" className="rounded-lg font-bold text-xs uppercase tracking-widest">Général</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg font-bold text-xs uppercase tracking-widest">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8 animate-in fade-in duration-300">
            {/* Type Selector */}
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70 ml-1">Type d'activité</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(courseTypeLabels) as [CourseType, string][]).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFormData({ ...formData, type })
                      setHasChanges(true)
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all",
                      formData.type === type
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-primary/20"
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", courseTypeColors[type].bg)}>
                        <div className={cn("h-2 w-2 rounded-full", type === "lecture" ? "bg-blue-500" : type === "td" ? "bg-emerald-500" : "bg-amber-500")} />
                    </div>
                    <span className="text-[10px] font-bold uppercase">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Fields */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70 ml-1">Matière / Unité d'enseignement</Label>
                <Select 
                  value={formData.subjectCode} 
                  onValueChange={(v) => {
                    const sub = subjects.find(s => s.code === v)
                    setFormData({ ...formData, subjectCode: v, title: sub?.name })
                    setHasChanges(true)
                  }}
                >
                  <SelectTrigger className="h-12 bg-muted/30 border-border/60 rounded-xl focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary/60" />
                      <SelectValue placeholder="Sélectionner une matière" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60">
                    {loadingSubjects ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      subjects.map(s => (
                        <SelectItem key={s.code} value={s.code} className="py-2.5 rounded-lg">
                           <div className="flex flex-col">
                             <span className="font-bold text-sm">{s.name}</span>
                             <span className="text-[10px] font-mono opacity-50 uppercase">{s.code}</span>
                           </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70 ml-1">Jour</Label>
                    <Select 
                      value={formData.day?.toString()} 
                      onValueChange={(v) => {
                        setFormData({ ...formData, day: parseInt(v) })
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger className="h-12 bg-muted/30 border-border/60 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary/60" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70 ml-1">Salle</Label>
                    <Select 
                      value={formData.roomId?.toString()} 
                      onValueChange={(v) => {
                        const r = rooms.find(room => room.id.toString() === v)
                        setFormData({ ...formData, roomId: parseInt(v), room: r?.nom })
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger className="h-12 bg-muted/30 border-border/60 rounded-xl">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary/60" />
                          <SelectValue placeholder="Salle" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map(r => (
                          <SelectItem key={r.id} value={r.id.toString()}>{r.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70 ml-1">Enseignant responsable</Label>
                <Select 
                  value={formData.teacherId?.toString()} 
                  onValueChange={(v) => {
                    const t = teachers.find(prof => prof.id.toString() === v)
                    setFormData({ ...formData, teacherId: parseInt(v), professor: t?.fullName })
                    setHasChanges(true)
                  }}
                >
                  <SelectTrigger className="h-12 bg-muted/30 border-border/60 rounded-xl">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary/60" />
                      <SelectValue placeholder="Choisir l'intervenant" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8 animate-in fade-in duration-300">
            {/* Time & Duration */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-background p-2 shadow-sm">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">Horaire & Durée</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{calculateDuration()}</p>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] py-1 px-3 rounded-full bg-background">
                  {formData.startTime} — {formData.endTime}
                </Badge>
              </div>

              <div className="grid gap-6 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Heure de début</Label>
                    <Input 
                      type="time" 
                      value={formData.startTime} 
                      onChange={(e) => {
                        setFormData({ ...formData, startTime: e.target.value })
                        setHasChanges(true)
                      }}
                      className="h-11 bg-background border-border/60 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Heure de fin</Label>
                    <Input 
                      type="time" 
                      value={formData.endTime} 
                      onChange={(e) => {
                        setFormData({ ...formData, endTime: e.target.value })
                        setHasChanges(true)
                      }}
                      className="h-11 bg-background border-border/60 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Raccourcis de durée</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {durationOptions.slice(1, 5).map((opt) => (
                      <Button
                        key={opt.value}
                        variant={getCurrentDuration() === opt.value ? "secondary" : "ghost"}
                        size="sm"
                        className={cn("h-10 rounded-xl font-bold text-xs border border-transparent", getCurrentDuration() === opt.value && "border-primary/20")}
                        onClick={() => handleDurationChange(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 px-1">
              <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70 ml-1">Notes & Consignes</Label>
              <Textarea
                placeholder="Objectifs du cours, matériel requis, chapitres abordés..."
                className="min-h-[120px] bg-muted/30 border-border/60 rounded-2xl focus:bg-background transition-all resize-none p-4 text-sm"
                value={formData.description || ""}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  setHasChanges(true)
                }}
              />
            </div>
            
            {/* Conflict Warning */}
            {conflict && (
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">Conflit détecté</p>
                    <p className="mt-1 text-xs text-amber-500/80">
                      Cet enseignant ou cette salle est déjà occupé sur ce créneau.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-muted/20 p-6 backdrop-blur-md">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-border/60 hover:bg-muted" onClick={onClose}>
            Annuler
          </Button>
          <Button
            className="flex-[2] h-12 rounded-xl font-black gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleSave}
            disabled={isSaving || (!formData.title && !formData.subjectCode)}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isNew ? "CRÉER LA SÉANCE" : "ENREGISTRER"}
          </Button>
        </div>
      </div>
    </div>
  )
}
