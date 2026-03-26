import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Check,
  Inbox,
  FileText,
  ChevronRight,
  MessageSquare,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
  id: number;
  userNotificationId: number;
  titre: string;
  isRead: boolean;
  createdAt: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  niveau: string;
  matiere: string;
  description?: string;
  remarqueDoyen?: string;
}

const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

const getStatusConfig = (statut: string) => {
  switch (statut) {
    case 'VALIDÉ': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Approuvé' };
    case 'REJETÉ': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Rejeté' };
    case 'SOUMIS': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'En attente' };
    default: return { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Information' };
  }
};

const TeacherNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token || '');
    if (!decoded?.id) return;

    try {
      const response = await api.get<Notification[]>(`/campushub-notification-service/api/notifications/user/${decoded.id}`);
      setNotifications(response.data.map(n => ({ ...n, isRead: !!n.isRead })));
    } catch (err) {
      toast.error("Erreur de synchronisation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleAction = async (e: React.MouseEvent, id: number, action: 'read' | 'delete') => {
    e.stopPropagation();
    try {
      if (action === 'read') {
        await api.put(`/campushub-notification-service/api/notifications/mark-as-read/${id}`);
        setNotifications(prev => prev.map(n => n.userNotificationId === id ? { ...n, isRead: true } : n));
      } else {
        await api.delete(`/campushub-notification-service/api/notifications/${id}`);
        setNotifications(prev => prev.filter(n => n.userNotificationId !== id));
      }
    } catch (err) {
      toast.error("Erreur lors de l'action");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 animate-in fade-in duration-500">
      {/* Mini Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Inbox size={18} />
          <h1 className="text-sm font-bold uppercase tracking-widest">Centre de Notifications</h1>
          <Badge variant="secondary" className="ml-2 rounded-md font-bold px-1.5 py-0">
            {notifications.filter(n => !n.isRead).length} Nouveau
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-8 font-bold hover:bg-primary/5 text-primary" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}>
          Marquer tout comme lu
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chargement...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {notifications.map((notif) => {
                const style = getStatusConfig(notif.statut);
                const isExpanded = expandedId === notif.userNotificationId;
                
                return (
                  <motion.div
                    key={notif.userNotificationId}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "group transition-all duration-200 border-l-4",
                      !notif.isRead ? "border-l-primary bg-primary/[0.01]" : "border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    {/* Compact Header Line */}
                    <div 
                      className="flex items-center gap-4 p-4 cursor-pointer" 
                      onClick={() => setExpandedId(isExpanded ? null : notif.userNotificationId)}
                    >
                      <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110", style.bg, style.color)}>
                        <style.icon size={18} />
                      </div>

                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                        <div className="md:col-span-5 flex flex-col min-w-0">
                          <span className={cn("text-sm font-bold truncate", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                            {notif.titre}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="md:col-span-4 flex items-center gap-2 overflow-hidden">
                          <Badge variant="outline" className="text-[10px] font-bold bg-muted/50 border-none px-2 py-0 h-5 shrink-0">
                            {notif.matiere}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-bold bg-muted/50 border-none px-2 py-0 h-5 shrink-0">
                            {notif.niveau}
                          </Badge>
                        </div>

                        <div className="md:col-span-3 flex items-center justify-end gap-3 pr-2">
                           {!notif.isRead && (
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10"
                               onClick={(e) => handleAction(e, notif.userNotificationId, 'read')}
                             >
                               <Check size={16} />
                             </Button>
                           )}
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                             onClick={(e) => handleAction(e, notif.userNotificationId, 'delete')}
                           >
                             <Trash2 size={16} />
                           </Button>
                           <ChevronRight size={16} className={cn("text-muted-foreground transition-transform duration-300", isExpanded && "rotate-90")} />
                        </div>
                      </div>
                    </div>

                    {/* Rich Details Section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-t border-border/50"
                        >
                          <div className="p-6 ml-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Detailed Info */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-border/50 text-muted-foreground">
                                  <Info size={14} />
                                </div>
                                <div className="space-y-1">
                                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description du support</h5>
                                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                                    "{notif.description || "Aucune description fournie pour ce support."}"
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 px-4" onClick={() => window.location.href='/dashboard/teacher/support'}>
                                <FileText className="mr-2 h-4 w-4 text-primary" /> Voir le document complet
                              </Button>
                            </div>

                            {/* Status and Feedback */}
                            <div className="space-y-4">
                               <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-border/50 shadow-sm">
                                  <div className={cn("p-1.5 rounded-lg shrink-0", style.bg, style.color)}>
                                    <MessageSquare size={14} />
                                  </div>
                                  <div className="space-y-1">
                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retour Académique</h5>
                                    <p className="text-sm font-medium">
                                      {notif.remarqueDoyen ? `"${notif.remarqueDoyen}"` : "Aucune remarque particulière pour ce dossier."}
                                    </p>
                                  </div>
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-32 text-center flex flex-col items-center gap-4">
             <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-muted-foreground/30">
                <Bell size={32} />
             </div>
             <div>
                <h3 className="text-lg font-bold">Tout est calme</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Vos nouvelles notifications et mises à jour apparaîtront ici.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherNotificationsPage;
