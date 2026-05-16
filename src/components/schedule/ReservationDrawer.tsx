import { useState, useEffect } from "react"
import {
  X, Clock, MapPin, BookOpen, CheckCircle2, AlertTriangle, Save, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { weekDays } from "@/lib/schedule-data"
import { reservationApi } from "@/lib/reservationApi"
import {
  SlotReservationRequest, SlotReservationResponse, FreeSlot,
  getISOWeekNumber, TYPE_LABELS
} from "@/lib/reservation.types"
import api from "@/lib/api"

interface Salle   { id: number; nom: string; code: string; }
interface Subject { code: string; name: string; niveau: number; semester: number; }

const NIVEAUX = [
  { value: 1, label: "L1" },
  { value: 2, label: "L2" },
  { value: 3, label: "L3" },
  { value: 4, label: "M1" },
  { value: 5, label: "M2" },
];

const STANDARD_SLOTS = [
  { label: "08:00 - 10:00", start: "08:00", end: "10:00" },
  { label: "10:15 - 12:15", start: "10:15", end: "12:15" },
  { label: "12:30 - 14:30", start: "12:30", end: "14:30" },
  { label: "14:45 - 16:45", start: "14:45", end: "16:45" },
  { label: "17:00 - 19:00", start: "17:00", end: "19:00" },
];

interface ReservationDrawerProps {
  isOpen: boolean;
  initialDay?: number;
  initialTime?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReservationDrawer({
  isOpen,
  initialDay = 0,
  initialTime = "08:00",
  onClose,
  onSuccess,
}: ReservationDrawerProps) {

  const teacherId   = Number(localStorage.getItem("userId")   || "0");
  const teacherName =        localStorage.getItem("userName") || "Enseignant";
  const academicYear = "2024-2025";

  const [niveauNum,   setNiveauNum]   = useState("");
  const [semester,    setSemester]    = useState("1");
  const [subjectCode, setSubjectCode] = useState("");
  const [type,        setType]        = useState<"LECTURE"|"TD"|"TP"|"EXAM">("LECTURE");
  const [salleId,     setSalleId]     = useState("");
  const [dayOfWeek,   setDayOfWeek]   = useState(String(initialDay));
  const [weekOffset,  setWeekOffset]  = useState("0");
  const [slotIndex,   setSlotIndex]   = useState("0");

  const [salles,          setSalles]          = useState<Salle[]>([]);
  const [subjects,        setSubjects]        = useState<Subject[]>([]);
  const [loadingSalles,   setLoadingSalles]   = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [isLoading,  setIsLoading]  = useState(false);
  const [response,   setResponse]   = useState<SlotReservationResponse | null>(null);
  const [submitted,  setSubmitted]  = useState(false);

  // Reset quand le drawer s'ouvre
  useEffect(() => {
    if (isOpen) {
      setDayOfWeek(String(initialDay));
      const matchingSlot = STANDARD_SLOTS.findIndex(s => s.start === initialTime);
      setSlotIndex(matchingSlot >= 0 ? String(matchingSlot) : "0");
      setNiveauNum("");
      setSemester("1");
      setSubjectCode("");
      setType("LECTURE");
      setSalleId("");
      setWeekOffset("0");
      setResponse(null);
      setSubmitted(false);
    }
  }, [isOpen, initialDay, initialTime]);

  // Charger les salles
  useEffect(() => {
    api.get("/campushub-salle-service/api/salles")
      .then(r => setSalles(r.data))
      .catch(console.error)
      .finally(() => setLoadingSalles(false));
  }, []);

  // Charger les matières quand niveau/semestre change
  useEffect(() => {
    if (!niveauNum || !semester) return;
    setLoadingSubjects(true);
    setSubjectCode("");
    api.get("/campushub-scheduling-service/api/subjects", {
      params: { niveau: niveauNum, semester }
    })
      .then(r => setSubjects(r.data))
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, [niveauNum, semester]);

  const isFormComplete = !!(niveauNum && semester && subjectCode && salleId && type);

  const handleSubmit = async () => {
    if (!isFormComplete) return;
    setIsLoading(true);
    setResponse(null);

    const slot        = STANDARD_SLOTS[Number(slotIndex)];
    const salle       = salles.find(s => String(s.id) === salleId)!;
    const subject     = subjects.find(s => s.code === subjectCode)!;
    const niveauLabel = NIVEAUX.find(n => String(n.value) === niveauNum)?.label ?? niveauNum;

    const today      = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + Number(weekOffset) * 7);

    const request: SlotReservationRequest = {
      teacherId,
      teacherName,
      title:       subject?.name ?? subjectCode,
      subjectCode,
      type,
      roomId:      salle.id,
      roomName:    salle.nom,
      dayOfWeek:   Number(dayOfWeek),
      startTime:   slot.start,
      endTime:     slot.end,
      weekNumber:  getISOWeekNumber(targetDate),
      year:        targetDate.getFullYear(),
      niveau:      niveauLabel,
      academicYear,
      semester:    Number(semester),
    };

    try {
      const result = await reservationApi.requestSlot(request);
      setResponse(result);
      if (result.success) {
        setSubmitted(true);
        onSuccess();
      }
    } catch {
      setResponse({ success: false, message: "Erreur de connexion au serveur.", freeSlots: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeSlotClick = (slot: FreeSlot) => {
    setDayOfWeek(String(slot.dayOfWeek));
    const matchingSlot = STANDARD_SLOTS.findIndex(
      s => s.start === slot.startTime && s.end === slot.endTime
    );
    if (matchingSlot >= 0) setSlotIndex(String(matchingSlot));
    setResponse(null);
  };

  const handleNewReservation = () => {
    setResponse(null);
    setSubmitted(false);
    setSubjectCode("");
    setSalleId("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-card shadow-2xl",
        "border-l border-border flex flex-col",
        "transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>

        {/* Header */}
        <div className="border-b border-border p-4 bg-primary/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-primary/10 border-l-4 border-primary">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Réserver un créneau</h2>
                <p className="text-sm text-muted-foreground">
                  {weekDays[Number(dayOfWeek)]} • {STANDARD_SLOTS[Number(slotIndex)]?.label}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Niveau + Semestre */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Niveau *</Label>
              <Select onValueChange={setNiveauNum}>
                <SelectTrigger className="bg-primary/5 border-primary/20">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {NIVEAUX.map(n => (
                    <SelectItem key={n.value} value={String(n.value)}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Semestre *</Label>
              <Select defaultValue="1" onValueChange={setSemester}>
                <SelectTrigger className="bg-primary/5 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semestre 1</SelectItem>
                  <SelectItem value="2">Semestre 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Matière */}
          <div className="space-y-1.5">
            <Label>Matière *</Label>
            {loadingSubjects ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Select onValueChange={setSubjectCode} disabled={subjects.length === 0}>
                <SelectTrigger className="bg-primary/5 border-primary/20">
                  <SelectValue placeholder={
                    !niveauNum ? "Sélectionnez d'abord un niveau"
                    : subjects.length === 0 ? "Aucune matière disponible"
                    : "Choisir une matière"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name}
                      <span className="text-muted-foreground text-xs ml-1">({s.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Type de séance */}
          <div className="space-y-1.5">
            <Label>Type de séance *</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val as "LECTURE"|"TD"|"TP"|"EXAM")}
                  className={cn(
                    "rounded-lg border-2 p-2.5 text-center text-sm transition-all",
                    type === val
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-secondary/30 hover:bg-secondary text-muted-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Salle */}
          <div className="space-y-1.5">
            <Label><MapPin className="inline h-3.5 w-3.5 mr-1" />Salle *</Label>
            {loadingSalles ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Select onValueChange={setSalleId}>
                <SelectTrigger className="bg-primary/5 border-primary/20">
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  {salles.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nom}
                      <span className="text-muted-foreground text-xs ml-1">({s.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Separator />

          {/* Jour + Semaine */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Jour *</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="bg-primary/5 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((label, i) => (
                    <SelectItem key={i} value={String(i)}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Semaine *</Label>
              <Select defaultValue="0" onValueChange={setWeekOffset}>
                <SelectTrigger className="bg-primary/5 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Semaine courante</SelectItem>
                  <SelectItem value="1">Semaine prochaine</SelectItem>
                  <SelectItem value="2">Dans 2 semaines</SelectItem>
                  <SelectItem value="3">Dans 3 semaines</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Créneau horaire */}
          <div className="space-y-1.5">
            <Label><Clock className="inline h-3.5 w-3.5 mr-1" />Créneau horaire *</Label>
            <Select value={slotIndex} onValueChange={setSlotIndex}>
              <SelectTrigger className="bg-primary/5 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STANDARD_SLOTS.map((slot, i) => (
                  <SelectItem key={i} value={String(i)}>{slot.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message de succès */}
          {response?.success && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-600">Réservation confirmée !</AlertTitle>
              <AlertDescription className="text-green-700 text-sm mt-1">
                Votre créneau a bien été enregistré.
              </AlertDescription>
            </Alert>
          )}

          {/* Message de conflit + créneaux libres */}
          {response && !response.success && (
            <Alert className="border-orange-500 bg-orange-500/10">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <AlertTitle className="text-orange-600">Conflit détecté</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="text-sm text-orange-700 mb-3">{response.message}</p>
                {response.freeSlots && response.freeSlots.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">
                      Créneaux libres — cliquez pour sélectionner :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {response.freeSlots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleFreeSlotClick(slot)}
                          className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/20 px-3 py-1.5 text-xs font-medium text-green-800 dark:text-green-300 hover:bg-green-100 transition-colors"
                        >
                          <span>{slot.dayLabel}</span>
                          <Badge variant="outline" className="text-green-700 border-green-400 text-xs px-1.5">
                            {slot.startTime} – {slot.endTime}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 shrink-0 bg-card">
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !isFormComplete}
                className="gap-2"
              >
                {isLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Vérification...</>
                  : <><Save className="h-4 w-4" /> Soumettre la réservation</>
                }
              </Button>
            ) : (
              <Button variant="outline" onClick={handleNewReservation} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Nouvelle réservation
              </Button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}