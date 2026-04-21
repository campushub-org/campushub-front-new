import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  CheckCheck, 
  Clock, 
  MoreVertical,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const DeanNotificationsPage: React.FC = () => {
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
    const handleNewNotif = () => fetchNotifications();
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
      toast.success("Toutes les notifications lues.");
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
      toast.success("Notifications vidées.");
    } catch (err) {
      toast.error("Échec de la suppression groupée.");
    }
  };

  const getNotificationStyle = (status: Notification['statut']) => {
    switch (status) {
      case 'SOUMIS': return { icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100' };
      case 'VALIDÉ': return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
      default: return { icon: Bell, color: 'text-blue-500 bg-blue-50 border-blue-100' };
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'ALL' || !n.isRead);

  return (
    <TooltipProvider>
      <style>{`
        main:has(#dean-notifications-area) { padding: 0 !important; overflow: hidden !important; }
        div:has(> #dean-notifications-area).max-w-7xl { max-width: none !important; margin: 0 !important; width: 100% !important; }
      `}</style>

      <div id="dean-notifications-area" className="flex flex-col h-[calc(100vh-4rem)] w-full bg-background overflow-hidden border-t border-border/50">
        
        {/* Header Ultra Épuré - Juste le Titre et les Filtres */}
        <div className="px-6 py-8 space-y-6 shrink-0 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 rounded-xl font-bold text-xs uppercase gap-2 border-border/60 hover:bg-muted"
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some(n => !n.isRead)}
              >
                <CheckCheck size={16} /> Tout marquer lu
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 rounded-xl font-bold text-xs uppercase gap-2 border-rose-100 text-rose-600 hover:bg-rose-50"
                onClick={handleDeleteAll}
                disabled={notifications.length === 0}
              >
                <Trash2 size={16} /> Tout supprimer
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl w-fit border border-border/40">
            <button
              onClick={() => setFilter('ALL')}
              className={cn(
                "px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                filter === 'ALL' 
                  ? "bg-background text-primary shadow-sm border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Tout ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={cn(
                "px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                filter === 'UNREAD' 
                  ? "bg-background text-primary shadow-sm border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Non lues ({notifications.filter(n => !n.isRead).length})
            </button>
          </div>
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-auto px-6 pb-12">
          <div className="max-w-4xl pl-2">
            {loading ? (
              <div className="p-12 text-center space-y-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mise à jour...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((notif) => {
                    const style = getNotificationStyle(notif.statut);
                    const Icon = style.icon;
                    
                    return (
                      <motion.div
                        key={notif.userNotificationId}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "group flex items-start gap-5 p-6 transition-all bg-card border border-border/60 rounded-2xl relative hover:shadow-md",
                          !notif.isRead ? "border-primary/20 shadow-sm shadow-primary/5" : "opacity-80"
                        )}
                      >
                        {!notif.isRead && (
                          <div className="absolute right-6 top-6 h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                        
                        <div className={cn("p-3 rounded-2xl border shrink-0", style.color)}>
                          <Icon size={24} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className={cn("font-bold text-base", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                              {notif.statut === 'SOUMIS' ? 'Nouveau dossier à valider' : 
                               notif.statut === 'VALIDÉ' ? 'Dossier archivé' : 'Alerte Système'}
                            </h3>
                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">
                               • {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className={cn("text-sm leading-relaxed max-w-2xl", !notif.isRead ? "text-muted-foreground" : "text-muted-foreground/60")}>
                            L'enseignant a soumis <span className="font-bold">"{notif.titre}"</span> pour le cours de <span className="font-bold">{notif.matiere}</span>.
                          </p>
                          
                          <div className="flex items-center gap-6 pt-2">
                            {!notif.isRead && (
                              <button 
                                onClick={() => handleMarkAsRead(notif.userNotificationId)}
                                className="text-xs font-black uppercase text-primary hover:underline"
                              >
                                Marquer comme lu
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(notif.userNotificationId)}
                              className="text-xs font-black uppercase text-muted-foreground hover:text-rose-600 transition-colors"
                            >
                              Supprimer
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
                            <DropdownMenuItem onClick={() => handleDelete(notif.userNotificationId)} className="rounded-lg gap-2 text-rose-600 focus:text-rose-600 font-bold text-xs uppercase">
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
              <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-3xl bg-card/30">
                <Bell className="h-16 w-16 text-muted-foreground/10 mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground/60 tracking-tight text-center">Aucune notification</h3>
                <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest mt-1">Flux à jour</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DeanNotificationsPage;
