import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ScheduleEvent, sampleEvents } from "./schedule-data";

const BASE_URL = import.meta.env.VITE_API_URL;

async function fetchAllEvents(): Promise<ScheduleEvent[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/api/v1/scheduling/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

interface ScheduleContextType {
  events:      ScheduleEvent[];
  isLoading:   boolean;
  error:       string | null;
  addEvent:    (event: ScheduleEvent) => void;
  updateEvent: (event: ScheduleEvent) => void;
  deleteEvent: (eventId: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [events,    setEvents]    = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    fetchAllEvents()
      .then((data) => {
        setEvents(data.length > 0 ? data : sampleEvents);
      })
      .catch((err) => {
        console.warn("API indisponible, utilisation des données locales.", err);
        setEvents(sampleEvents);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const addEvent    = (event: ScheduleEvent) =>
    setEvents((prev) => [...prev, event]);

  const updateEvent = (event: ScheduleEvent) =>
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));

  const deleteEvent = (eventId: string) =>
    setEvents((prev) => prev.filter((e) => e.id !== eventId));

  return (
    <ScheduleContext.Provider
      value={{ events, isLoading, error, addEvent, updateEvent, deleteEvent }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule doit être utilisé dans un ScheduleProvider");
  return ctx;
};
