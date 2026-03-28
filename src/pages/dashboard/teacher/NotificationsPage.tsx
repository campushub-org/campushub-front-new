import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  CheckCheck, 
  Clock, 
  Info,
  MoreVertical,
  Inbox,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: number;
  userNotificationId: number;
  titre: string;
  isRead: boolean;
  createdAt: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  niveau: string;
  matiere: string;
}

const TeacherNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const decodeToken = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded ? decoded.id : null;
  };

  const fetchNotifications = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await api.get<Notification[]>(`/campushub-notification-service/api/notifications/user/${userId}`);
      setNotifications(response.data.map(n => ({ ...n, isRead: !!n.isRead })));
    } catch (err) {
      toast.error("Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotif = () => {
      fetchNotifications();
    };

    window.addEventListener('notification_received', handleNewNotif);
    return () => window.removeEventListener('notification_received', handleNewNotif);
  }, []);

  const handleMarkAsRead = async (userNotificationId: number) => {
    try {
      await api.put(`/campushub-notification-service/api/notifications/mark-as-read/${userNotificationId}`);
      setNotifications(prev => prev.map(n => n.userNotificationId === userNotificationId ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Échec de la mise à jour.");
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.userNotificationId);
    if (unreadIds.length === 0) return;

    try {
      await Promise.all(unreadIds.map(id => api.put(`/campushub-notification-service/api/notifications/mark-as-read/${id}`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Toutes les notifications sont lues.");
    } catch (err) {
      toast.error("Échec de l'opération.");
    }
  };

  const handleDelete = async (userNotificationId: number) => {
    try {
      await api.delete(`/campushub-notification-service/api/notifications/${userNotificationId}`);
      setNotifications(prev => prev.filter(n => n.userNotificationId !== userNotificationId));
      toast.success("Notification supprimée.");
    } catch (err) {
      toast.error("Échec de la suppression.");
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;
    try {
      await Promise.all(notifications.map(n => api.delete(`/campushub-notification-service/api/notifications/${n.userNotificationId}`)));
      setNotifications([]);
      toast.success("Toutes les notifications ont été supprimées.");
    } catch (err) {
      toast.error("Échec de la suppression groupée.");
    }
  };

  const getNotificationStyle = (status: Notification['statut']) => {
    switch (status) {
      case 'VALIDÉ': return { 
        icon: CheckCircle2, 
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
        label: 'Succès'
      };
      case 'REJETÉ': return { 
        icon: XCircle, 
        color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
        label: 'Alerte'
      };
      case 'SOUMIS': return { 
        icon: Clock, 
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
        label: 'Info'
      };
      default: return { 
        icon: Info, 
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
        label: 'Message'
      };
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'ALL' || !n.isRead);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Notifications Enseignant</h1>
          <p className="text-muted-foreground">Suivez les retours du doyen sur vos supports déposés.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg h-10 font-semibold gap-2"
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some(n => !n.isRead)}
          >
            <CheckCheck size={18} /> Tout lire
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg h-10 font-semibold gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={18} /> Tout supprimer
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl w-fit border border-border/50">
        <button
          onClick={() => setFilter('ALL')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
            filter === 'ALL' 
              ? "bg-background text-primary shadow-sm border border-border/50" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 relative",
            filter === 'UNREAD' 
              ? "bg-background text-primary shadow-sm border border-border/50" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Non lues ({notifications.filter(n => !n.isRead).length})
          {notifications.some(n => !n.isRead) && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground font-medium">Chargement de vos messages...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notif) => {
                  const style = getNotificationStyle(notif.statut);
                  const Icon = style.icon;
                  
                  return (
                    <motion.div
                      key={notif.userNotificationId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "group flex items-start gap-4 p-5 transition-all hover:bg-muted/30 relative",
                        !notif.isRead && "bg-primary/[0.02]"
                      )}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      
                      <div className={cn("p-2.5 rounded-xl border shrink-0", style.color)}>
                        <Icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={cn("font-bold text-sm truncate", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                            {notif.statut === 'VALIDÉ' ? 'Dossier Approuvé' : 
                             notif.statut === 'REJETÉ' ? 'Dossier Rejeté' : 
                             notif.statut === 'SOUMIS' ? 'Support Soumis' : 'Mise à jour dossier'}
                          </h3>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase whitespace-nowrap bg-muted px-2 py-0.5 rounded-md">
                            {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className={cn("text-sm leading-relaxed", !notif.isRead ? "text-muted-foreground" : "text-muted-foreground/60")}>
                          Le doyen a mis à jour le statut de votre support <span className="font-semibold">"{notif.titre}"</span> à <span className="lowercase font-bold">{notif.statut}</span>.
                        </p>
                        
                        {/* Quick Actions Footer */}
                        <div className="flex items-center gap-3 pt-2">
                          {!notif.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notif.userNotificationId)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <CheckCheck size={14} /> Marquer comme lu
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(notif.userNotificationId)}
                            className="text-xs font-bold text-muted-foreground hover:text-rose-600 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-40">
                          {!notif.isRead && (
                            <DropdownMenuItem onClick={() => handleMarkAsRead(notif.userNotificationId)} className="rounded-lg gap-2">
                              <CheckCheck size={14} /> Lire
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(notif.userNotificationId)} className="rounded-lg gap-2 text-rose-600 focus:text-rose-600">
                            <Trash2 size={14} /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-16 text-center space-y-4">
              <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto text-muted-foreground/30">
                <Inbox size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Boîte de réception vide</h3>
                <p className="text-sm text-muted-foreground">Aucun nouveau message {filter === 'UNREAD' ? 'non lu' : ''} concernant vos supports.</p>
              </div>
              {filter === 'UNREAD' && (
                <Button variant="outline" size="sm" onClick={() => setFilter('ALL')} className="rounded-lg font-semibold">
                  Historique complet
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherNotificationsPage;
