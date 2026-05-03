import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarDays, Trash2 } from "lucide-react";
import { reservationApi } from "@/lib/reservationApi";
import { DAY_LABELS, TYPE_LABELS } from "@/lib/reservation.types";

interface Props { teacherId: number; }

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  APPROVED:  { label: "Confirmé",   variant: "default" },
  PENDING:   { label: "En attente", variant: "secondary" },
  REJECTED:  { label: "Annulé",     variant: "destructive" },
};

const MyReservationsList: React.FC<Props> = ({ teacherId }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState<number | null>(null);

  const fetchReservations = () => {
    if (!teacherId) return;
    setLoading(true);
    reservationApi.getMyReservations(teacherId)
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, [teacherId]);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Confirmer la révocation de cette réservation ?")) return;
    setCancelling(id);
    try {
      await reservationApi.cancelReservation(id, teacherId);
      // Mise à jour locale immédiate sans recharger toute la liste
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: "REJECTED" } : r)
      );
    } catch (err) {
      alert("Erreur lors de la révocation. Veuillez réessayer.");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Mes réservations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune réservation pour l'instant.
          </p>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const statusCfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
              const isActive  = r.status !== "REJECTED";
              return (
                <div key={r.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {DAY_LABELS[r.dayOfWeek]} • {r.startTime} – {r.endTime} • {r.roomName} • Semaine {r.weekNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[r.type] ?? r.type}
                    </Badge>
                    <Badge variant={statusCfg.variant} className="text-xs">
                      {statusCfg.label}
                    </Badge>
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        disabled={cancelling === r.id}
                        onClick={() => handleCancel(r.id)}
                        title="Révoquer cette réservation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyReservationsList;