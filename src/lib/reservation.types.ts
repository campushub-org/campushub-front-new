// Correspond exactement aux champs de ScheduleEvent + infos semaine
export interface SlotReservationRequest {
  teacherId: number;
  teacherName: string;
  title: string;
  subjectCode: string;
  type: "LECTURE" | "TD" | "TP" | "EXAM";
  roomId: number;
  roomName: string;
  dayOfWeek: number;       // 0=Lundi, 4=Vendredi
  startTime: string;       // "HH:mm"
  endTime: string;         // "HH:mm"
  weekNumber: number;      // Numéro ISO de la semaine
  year: number;
  niveau: string;          // "L1", "L2", "M1"...
  academicYear: string;    // "2024-2025"
  semester: number;        // 1 ou 2
}

export interface FreeSlot {
  dayOfWeek: number;
  dayLabel: string;
  startTime: string;
  endTime: string;
}

export interface ReservationResult {
  id: number;
  title: string;
  subjectCode: string;
  type: string;
  roomId: number;
  roomName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  weekNumber: number;
  year: number;
  niveau: string;
  status: string;
}

export interface SlotReservationResponse {
  success: boolean;
  message: string;
  reservation?: ReservationResult;
  freeSlots?: FreeSlot[];
}

// Utilitaire : numéro de semaine ISO à partir d'une date
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const TYPE_LABELS: Record<string, string> = {
  LECTURE: "Cours Magistral", TD: "Travaux Dirigés",
  TP: "Travaux Pratiques", EXAM: "Examen"
};