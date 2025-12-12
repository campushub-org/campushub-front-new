import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Bell, CheckCircle, XCircle, AlertTriangle, ChevronDown } from 'lucide-react';

interface Notification {
  id: number; // Ceci est l'ID de la Notification globale
  userNotificationId: number; // Ceci est l'ID de l'entrée UserNotification
  titre: string;
  isRead: boolean;
  createdAt: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  niveau: string;
  matiere: string;
  filiere: string; // Ajout de la filière
}

const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

const getNotificationDetails = (notification: Notification) => {
  switch (notification.statut) {
    case 'BROUILLON':
      return {
        title: "Création d'un support de cours",
        message: `Le support de cours "${notification.titre}" a été créé et est en attente de soumission.`,
        type: 'info',
        Icon: Bell,
      };
    case 'SOUMIS':
      return {
        title: "Nouveau support de cours soumis",
        message: `Le support de cours "${notification.titre}" a été soumis pour validation.`,
        type: 'warning',
        Icon: AlertTriangle,
      };
    case 'VALIDÉ':
      return {
        title: "Support de cours validé",
        message: `Le support de cours "${notification.titre}" a été validé.`,
        type: 'success',
        Icon: CheckCircle,
      };
    case 'REJETÉ':
      return {
        title: "Support de cours rejeté",
        message: `Le support de cours "${notification.titre}" a été rejeté.`,
        type: 'error',
        Icon: XCircle,
      };
    default:
      return {
        title: "Notification inconnue",
        message: 'Notification inconnue.',
        type: 'info',
        Icon: Bell,
      };
  }
};

const DeanNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Get user ID from token
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded ? decoded.id : null;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = getUserId();
      if (!userId) {
        setError("Authentification requise.");
        setLoading(false);
        return;
      }

      try {
        // Nouvelle route pour récupérer les notifications d'un utilisateur spécifique
        const response = await api.get<Notification[]>(`/campushub-notification-service/api/notifications/user/${userId}`);
        setNotifications(response.data.map(n => ({ ...n, isRead: n.isRead === null ? false : n.isRead })));
      } catch (err) {
        setError("Impossible de charger les notifications.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const typeToColorClass = {
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    error: 'bg-red-100 border-red-400 text-red-700',
  };
  
  const handleToggleExpand = (userNotificationId: number) => {
    setExpandedId(expandedId === userNotificationId ? null : userNotificationId);
    setConfirmDeleteId(null); // Reset confirm delete on toggle
  };

  const handleMarkAsRead = async (e: React.MouseEvent, userNotificationId: number) => {
    e.stopPropagation();
    const userId = getUserId();
    if (!userId) return;

    const originalNotifications = [...notifications];
    const updatedNotifications = notifications.map(n => n.userNotificationId === userNotificationId ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifications);

    try {
      // Nouvelle route et envoi de l'userId pour marquer comme lue
      await api.put(`/campushub-notification-service/api/notifications/mark-as-read/${userNotificationId}`);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      setNotifications(originalNotifications);
      // Optionally, show an error message to the user
    }
  };

  const handleDelete = (e: React.MouseEvent, userNotificationId: number) => {
    e.stopPropagation();
    setConfirmDeleteId(userNotificationId);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, userNotificationId: number) => {
    e.stopPropagation();
    const userId = getUserId();
    if (!userId) return;

    const originalNotifications = [...notifications];
    const updatedNotifications = notifications.filter(n => n.userNotificationId !== userNotificationId);
    setNotifications(updatedNotifications);
    setConfirmDeleteId(null);

    try {
      // Nouvelle route et envoi de l'userId pour la suppression
      await api.delete(`/campushub-notification-service/api/notifications/${userNotificationId}`);
    } catch (err) {
      console.error("Failed to delete notification", err);
      setNotifications(originalNotifications);
      // Optionally, show an error message to the user
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications de soumission de support</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Chargement des notifications...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const { title, message, type, Icon } = getNotificationDetails(notif);
                const isExpanded = expandedId === notif.userNotificationId; // Utilisation de userNotificationId
                return (
                  <div
                    key={notif.userNotificationId} // Utilisation de userNotificationId comme clé unique
                    className={`rounded-lg border ${
                      notif.isRead ? 'bg-muted/50' : typeToColorClass[type as keyof typeof typeToColorClass]
                    }`}
                  >
                    <div className="p-4 flex items-start" onClick={() => handleToggleExpand(notif.userNotificationId)} style={{ cursor: 'pointer' }}>
                      <div className="flex-shrink-0">
                        <Icon className={`w-5 h-5 ${
                          notif.isRead ? 'text-muted-foreground' : 'text-current'
                        }`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {title}
                        </p>
                        <p className={`text-sm ${notif.isRead ? 'text-muted-foreground/80' : 'text-foreground/90'}`}>
                          {message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center">
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 self-center"></div>
                        )}
                        <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40' : 'max-h-0'}`}
                    >
                      <div className="px-4 pb-4">
                        <p className="text-sm"><strong>Niveau:</strong> {notif.niveau}</p>
                        <p className="text-sm"><strong>Matière:</strong> {notif.matiere}</p>
                        <p className="text-sm"><strong>Filière:</strong> {notif.filiere}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-4 flex space-x-2">
                      {!notif.isRead && (
                        <Button variant="outline" size="sm" onClick={(e) => handleMarkAsRead(e, notif.userNotificationId)}>
                          Marquer comme lue
                        </Button>
                      )}
                      {confirmDeleteId !== notif.userNotificationId ? (
                        <Button variant="destructive" size="sm" onClick={(e) => handleDelete(e, notif.userNotificationId)}>
                          Supprimer
                        </Button>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={(e) => handleConfirmDelete(e, notif.userNotificationId)}>
                          Confirmer la suppression
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Vous n'avez aucune notification.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeanNotificationsPage;
