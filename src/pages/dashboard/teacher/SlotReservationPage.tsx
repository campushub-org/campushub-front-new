import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { CalendarPlus, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { reservationApi } from "@/lib/reservationApi";
import {
  SlotReservationRequest, SlotReservationResponse, FreeSlot,
  getISOWeekNumber, DAY_LABELS, TYPE_LABELS
} from "@/lib/reservation.types";
import MyReservationsList from "@/components/dashboard/teacher/MyReservationsList";
import api from "@/lib/api";

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
  { label: "08:00 – 10:00", start: "08:00", end: "10:00" },
  { label: "10:15 – 12:15", start: "10:15", end: "12:15" },
  { label: "12:30 – 14:30", start: "12:30", end: "14:30" },
  { label: "14:45 – 16:45", start: "14:45", end: "16:45" },
  { label: "17:00 – 19:00", start: "17:00", end: "19:00" },
];

interface FormValues {
  subjectCode: string;
  type: "LECTURE" | "TD" | "TP" | "EXAM";
  salleId: string;
  niveauNum: string;
  slotIndex: string;
  dayOfWeek: string;
  weekOffset: string;
  semester: string;
}

const SlotReservationPage: React.FC = () => {
  const [isLoading,       setIsLoading]       = useState(false);
  const [response,        setResponse]        = useState<SlotReservationResponse | null>(null);
  const [submitted,       setSubmitted]       = useState(false);
  const [refreshKey,      setRefreshKey]      = useState(0);
  const [formKey,         setFormKey]         = useState(0);
  const successRef = useRef<HTMLDivElement>(null);

  const [salles,          setSalles]          = useState<Salle[]>([]);
  const [subjects,        setSubjects]        = useState<Subject[]>([]);
  const [loadingSalles,   setLoadingSalles]   = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const teacherId   = Number(localStorage.getItem("userId")   || "0");
  const teacherName =        localStorage.getItem("userName") || "Enseignant";
  const academicYear = "2024-2025";

  const { handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      type: "LECTURE", dayOfWeek: "0", weekOffset: "0", semester: "1", slotIndex: "0",
    },
  });

  const watchedNiveau   = watch("niveauNum");
  const watchedSemester = watch("semester");
  const watchedSubject  = watch("subjectCode");
  const watchedSalle    = watch("salleId");
  const watchedType     = watch("type");

  const isFormComplete = !!(
    watchedNiveau && watchedSemester && watchedSubject && watchedSalle && watchedType
  );

  useEffect(() => {
    api.get("/campushub-salle-service/api/salles")
      .then(r => setSalles(r.data))
      .catch(console.error)
      .finally(() => setLoadingSalles(false));
  }, []);

  useEffect(() => {
    if (!watchedNiveau || !watchedSemester) return;
    setLoadingSubjects(true);
    setValue("subjectCode", "");
    api.get(`/campushub-scheduling-service/api/subjects`, {
      params: { niveau: watchedNiveau, semester: watchedSemester }
    })
      .then(r => setSubjects(r.data))
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, [watchedNiveau, watchedSemester]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResponse(null);

    const slot        = STANDARD_SLOTS[Number(values.slotIndex)];
    const salle       = salles.find(s => String(s.id) === values.salleId)!;
    const subject     = subjects.find(s => s.code === values.subjectCode)!;
    const niveauLabel = NIVEAUX.find(n => String(n.value) === values.niveauNum)?.label ?? values.niveauNum;

    const today      = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + Number(values.weekOffset) * 7);

    const request: SlotReservationRequest = {
      teacherId, teacherName,
      title:       subject?.name ?? values.subjectCode,
      subjectCode: values.subjectCode,
      type:        values.type,
      roomId:      salle.id,
      roomName:    salle.nom,
      dayOfWeek:   Number(values.dayOfWeek),
      startTime:   slot.start,
      endTime:     slot.end,
      weekNumber:  getISOWeekNumber(targetDate),
      year:        targetDate.getFullYear(),
      niveau:      niveauLabel,
      academicYear,
      semester:    Number(values.semester),
    };

    try {
      const result = await reservationApi.requestSlot(request);
      setResponse(result);
      if (result.success) {
        setSubmitted(true);
        setRefreshKey(k => k + 1);
        setTimeout(() => successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      }
    } catch {
      setResponse({ success: false, message: "Erreur de connexion au serveur. Réessayez.", freeSlots: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewReservation = () => {
    reset();
    setResponse(null);
    setSubmitted(false);
    setSubjects([]);
    setFormKey(k => k + 1);
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <CalendarPlus className="h-8 w-8 text-primary" />
          Réserver un Créneau
        </h1>
        <p className="text-muted-foreground mt-1">
          Proposez un créneau horaire. Le système vérifiera automatiquement les conflits.
        </p>
      </div>

      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle className="text-lg">Informations du créneau</CardTitle>
          <CardDescription>
            Sélectionnez les informations dans les listes. Le système vérifie les conflits automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── 2 colonnes principales ── */}
            <div className="grid grid-cols-2 gap-6">

              {/* COLONNE GAUCHE */}
              <div className="space-y-5">

                <div className="space-y-1.5">
                  <Label>Niveau *</Label>
                  <Select onValueChange={v => setValue("niveauNum", v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir un niveau" /></SelectTrigger>
                    <SelectContent>
                      {NIVEAUX.map(n => (
                        <SelectItem key={n.value} value={String(n.value)}>{n.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Semestre *</Label>
                  <Select defaultValue="1" onValueChange={v => setValue("semester", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semestre 1</SelectItem>
                      <SelectItem value="2">Semestre 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Matière *</Label>
                  {loadingSubjects ? (
                    <Skeleton className="h-10 w-full rounded-md" />
                  ) : (
                    <Select onValueChange={v => setValue("subjectCode", v)} disabled={subjects.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !watchedNiveau
                            ? "Sélectionnez d'abord un niveau"
                            : subjects.length === 0
                            ? "Aucune matière disponible"
                            : "Choisir une matière"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.name} <span className="text-muted-foreground text-xs ml-1">({s.code})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Type de séance *</Label>
                  <Select defaultValue="LECTURE" onValueChange={v => setValue("type", v as FormValues["type"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* COLONNE DROITE */}
              <div className="space-y-5">

                <div className="space-y-1.5">
                  <Label>Salle *</Label>
                  {loadingSalles ? (
                    <Skeleton className="h-10 w-full rounded-md" />
                  ) : (
                    <Select onValueChange={v => setValue("salleId", v)}>
                      <SelectTrigger><SelectValue placeholder="Choisir une salle" /></SelectTrigger>
                      <SelectContent>
                        {salles.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.nom} <span className="text-muted-foreground text-xs ml-1">({s.code})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Jour *</Label>
                  <Select defaultValue="0" onValueChange={v => setValue("dayOfWeek", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAY_LABELS.map((label, i) => (
                        <SelectItem key={i} value={String(i)}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Semaine *</Label>
                  <Select defaultValue="0" onValueChange={v => setValue("weekOffset", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Semaine courante</SelectItem>
                      <SelectItem value="1">Semaine prochaine</SelectItem>
                      <SelectItem value="2">Dans 2 semaines</SelectItem>
                      <SelectItem value="3">Dans 3 semaines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Créneau horaire *</Label>
                  <Select defaultValue="0" onValueChange={v => setValue("slotIndex", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STANDARD_SLOTS.map((slot, i) => (
                        <SelectItem key={i} value={String(i)}>{slot.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            <Separator />

            {/* Bouton */}
            <div className="flex justify-start">
              {!submitted ? (
                <Button type="submit" className="px-8 gap-2" disabled={isLoading || !isFormComplete}>
                  {isLoading
                    ? <><Clock className="h-4 w-4 animate-spin" /> Vérification en cours...</>
                    : <><CalendarPlus className="h-4 w-4" /> Soumettre la réservation</>
                  }
                </Button>
              ) : (
                <Button type="button" variant="outline" className="px-8 gap-2" onClick={handleNewReservation}>
                  <CalendarPlus className="h-4 w-4" />
                  Soumettre une nouvelle réservation
                </Button>
              )}
            </div>

            {/* Message de succès */}
            {response?.success && (
              <div ref={successRef}>
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <AlertTitle className="text-green-600">Réservation confirmée !</AlertTitle>
                  <AlertDescription className="text-green-700 mt-1 text-sm">
                    Votre créneau a bien été enregistré et apparaît dans la liste ci-dessous.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Message de conflit */}
            {response && !response.success && (
              <Alert className="border-orange-500 bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <AlertTitle className="text-orange-600">Conflit détecté</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-sm text-orange-700 mb-3">{response.message}</p>
                  {response.freeSlots && response.freeSlots.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Créneaux libres disponibles :</p>
                      {response.freeSlots.map((slot, i) => (
                        <FreeSlotCard key={i} slot={slot} />
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

          </form>
        </CardContent>
      </Card>

      {/* Liste des réservations */}
      <MyReservationsList key={refreshKey} teacherId={teacherId} />

    </div>
  );
};

const FreeSlotCard: React.FC<{ slot: FreeSlot }> = ({ slot }) => (
  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 px-3 py-2">
    <span className="text-sm font-medium text-green-800 dark:text-green-300">{slot.dayLabel}</span>
    <Badge variant="outline" className="text-green-700 border-green-400 text-xs">
      {slot.startTime} – {slot.endTime}
    </Badge>
  </div>
);

export default SlotReservationPage;