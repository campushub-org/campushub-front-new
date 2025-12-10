import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { Bell, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Notification {
  id: number;
  titre: string;
  isRead: boolean;
  createdAt: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  // Add other fields from the backend model if needed
  // niveau: string;
  // matiere: string;
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
        title: "Nouvelle création de support",
        message: `Le support de cours "${notification.titre}" a été créé.`,
        type: 'info',
        Icon: Bell,
      };
    case 'SOUMIS':
      return {
        title: "Soumission de support",
        message: `Le support de cours "${notification.titre}" a été soumis pour validation.`,
        type: 'warning',
        Icon: AlertTriangle,
      };
    case 'VALIDÉ':
      return {
        title: "Validation de support",
        message: `Félicitations ! Votre support de cours "${notification.titre}" a été validé.`,
        type: 'success',
        Icon: CheckCircle,
      };
    case 'REJETÉ':
      return {
        title: "Rejet de support",
        message: `Votre support de cours "${notification.titre}" a été rejeté.`,
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

const TeacherNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentification requise.");
        setLoading(false);
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        setError("Impossible de récupérer les informations de l'utilisateur depuis le token.");
        setLoading(false);
        return;
      }

      const userId = decoded.id;

      try {
        const response = await api.get<Notification[]>(`/campushub-notification-service/api/notifications/teacher/${userId}`);
        setNotifications(response.data);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Chargement des notifications...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const { title, message, type, Icon } = getNotificationDetails(notif);
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start p-4 rounded-lg border ${
                      notif.isRead ? 'bg-muted/50' : typeToColorClass[type as keyof typeof typeToColorClass]
                    }`}
                  >
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
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto self-center"></div>
                    )}
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

export default TeacherNotificationsPage;
