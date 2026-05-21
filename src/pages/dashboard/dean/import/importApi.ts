// ─────────────────────────────────────────────
//  importApi.ts
//  Appels API — module d'import (Doyen)
// ─────────────────────────────────────────────

import {
  TeacherImportRow,
  RoomImportRow,
  ScheduleEventImportRow,
  ImportResult,
  DEFAULT_PASSWORD,
} from "./import.types";

const GATEWAY = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// ── Helpers ───────────────────────────────────

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Remplace la fonction postOne par cette version enrichie
async function postOne(url: string, body: unknown): Promise<{ ok: boolean; message?: string; status?: number }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, message: text || `HTTP ${res.status}`, status: res.status };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

// ── Import Enseignants ────────────────────────

export async function importTeachers(rows: TeacherImportRow[]): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, success: 0, failed: 0, errors: [] };

  for (const row of rows) {
    const payload = {
      username: row.username ?? row.email.split("@")[0],
      fullName: row.fullName ?? "",
      email: row.email,
      password: row.password ?? DEFAULT_PASSWORD,
      role: "TEACHER",
      department: row.department ?? "",
      grade: row.grade ?? "",
      officeNumber: row.officeNumber ?? "",
    };

    const { ok, message } = await postOne(`${GATEWAY}/api/auth/register`, payload);
    if (ok) {
      result.success++;
    } else {
      result.failed++;
      result.errors.push(`${row.email} — ${message}`);
    }
  }
  return result;
}
// ── Import Salles ─────────────────────────────
export async function importRooms(rows: RoomImportRow[]): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, success: 0, failed: 0, errors: [] };

  for (const row of rows) {
    const { ok, message, status } = await postOne(`${GATEWAY}/api/salles`, row);
    if (ok) {
      result.success++;
    } else {
      result.failed++;
      const identifier = row.code ?? row.nom ?? "Salle inconnue";

      if (status === 500 || (message ?? "").toLowerCase().includes("duplicate") || (message ?? "").toLowerCase().includes("constraint")) {
        result.errors.push(
          `${identifier} — La salle "${identifier}" ne peut pas être importée : ` +
          `un enregistrement possédant le même code existe déjà en base de données. ` +
          `Modifiez le champ "code" dans votre fichier avant de réimporter.`
        );
      } else if (status === 400) {
        result.errors.push(`${identifier} — Données invalides. Vérifiez le format des champs de cette salle.`);
      } else {
        result.errors.push(`${identifier} — ${message}`);
      }
    }
  }
  return result;
}

// ── Import Cours (batch) ──────────────────────

export async function importScheduleEvents(rows: ScheduleEventImportRow[]): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, success: 0, failed: 0, errors: [] };

  try {
const res = await fetch(`${GATEWAY}/api/scheduling/batch-save`, {
  method: "POST",
  headers: authHeaders(),
  body: JSON.stringify(rows),
});
    if (!res.ok) {
      const text = await res.text();
      result.failed = rows.length;
      result.errors.push(`Erreur batch : ${text || `HTTP ${res.status}`}`);
    } else {
      result.success = rows.length;
    }
  } catch (e) {
    result.failed = rows.length;
    result.errors.push((e as Error).message);
  }

  return result;
}
