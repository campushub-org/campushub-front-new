import { ScheduleEvent } from "./schedule-data";

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Récupère l'intégralité des créneaux depuis le backend
 * et les retourne sous forme de ScheduleEvent[].
 */
export async function fetchAllEvents(): Promise<ScheduleEvent[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/api/v1/scheduling/events`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }

  return response.json();
}