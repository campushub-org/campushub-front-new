// ─────────────────────────────────────────────
//  import.types.ts
//  Types & constantes du module d'import (Doyen)
// ─────────────────────────────────────────────

export type ImportFormat = "json" | "csv" | "pdf";

export type ImportStatus = "idle" | "parsing" | "uploading" | "success" | "error";

// ── Enseignant ────────────────────────────────
export interface TeacherImportRow {
  username?: string;
  fullName?: string;
  email: string;
  department?: string;
  password?: string;
  grade?: string;
  officeNumber?: string;
}
// ── Salle ─────────────────────────────────────
export interface RoomImportRow {
  name: string;
  capacity: number;
  building?: string;
  type?: string; // "AMPHI" | "TD" | "TP" | "LABO"
}

// ── Cours / ScheduleEvent ─────────────────────
export interface ScheduleEventImportRow {
  title: string;
  teacherId: number;
  roomId: number;
  dayOfWeek: number;       // 0 = Lundi … 6 = Dimanche
  startTime: string;       // "HH:mm"
  endTime: string;
  color?: string;
  type?: string;           // "COURS" | "TD" | "TP"
  academicYear?: string;
  semester?: number;
}

// ── Résultat d'un import ──────────────────────
export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

// ── État local d'un onglet d'import ───────────
export interface ImportTabState {
  status: ImportStatus;
  preview: unknown[];
  result: ImportResult | null;
  errorMessage: string | null;
}

// ── Libellés ─────────────────────────────────
export const DAY_LABELS: Record<number, string> = {
  0: "Lundi",
  1: "Mardi",
  2: "Mercredi",
  3: "Jeudi",
  4: "Vendredi",
  5: "Samedi",
  6: "Dimanche",
};

export const DEFAULT_PASSWORD = "Campushub@2025";

export const ACCEPTED_FORMATS = ".json,.csv,.pdf";
