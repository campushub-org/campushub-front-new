import React, { useEffect, useState } from "react";
import { CalendarDays, Trash2, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { reservationApi } from "@/lib/reservationApi";
import { DAY_LABELS, TYPE_LABELS } from "@/lib/reservation.types";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  APPROVED:  { label: "Confirmé",   variant: "default" },
  PENDING:   { label: "En attente", variant: "secondary" },
  REJECTED:  { label: "Annulé",     variant: "destructive" },
};

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [cancelling,   setCancelling]   = useState<number | null>(null);
  const [deletingAll,  setDeletingAll]  = useState(false);

  const teacherId = Number(localStorage.getItem("userId") || "0");

  const fetchReservations = () => {
    setLoading(true);
reservationApi.getMyReservations(teacherId)
  .then(data => setReservations(data.filter((r: any) => r.status !== "REJECTED")))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, [teacherId]);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Confirmer la révocation de cette réservation ?")) return;
    setCancelling(id);
    try {
      await reservationApi.cancelReservation(id, teacherId);
setReservations(prev => prev.filter(r => r.id !== id));
    } catch {
      alert("Erreur lors de la révocation. Veuillez réessayer.");
    } finally {
      setCancelling(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Supprimer toutes vos réservations ? Cette action est irréversible.")) return;
    setDeletingAll(true);
    try {
      const actives = reservations.filter(r => r.status !== "REJECTED");
      await Promise.all(actives.map(r => reservationApi.cancelReservation(r.id, teacherId)));
setReservations([]);
    } catch {
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    } finally {
      setDeletingAll(false);
    }
  };

  const activeCount = reservations.filter(r => r.status !== "REJECTED").length;

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Mes Réservations
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos demandes de créneaux horaires.
          </p>
        </div>
        {activeCount > 0 && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={deletingAll}
            onClick={handleDeleteAll}
          >
            <Trash className="h-4 w-4" />
            Tout supprimer ({activeCount})
          </Button>
        )}
      </div>

      {/* Contenu */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">
            {loading ? "Chargement..." : `${reservations.length} réservation${reservations.length > 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">Aucune réservation pour l'instant.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map(r => {
                const statusCfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                const isActive  = r.status !== "REJECTED";
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:bg-accent/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {DAY_LABELS[r.dayOfWeek]} • {r.startTime} – {r.endTime} • {r.roomName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Semaine {r.weekNumber} • Niveau {r.niveau}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
    </div>
  );
};

export default MyReservationsPage;