import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  titre: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

const AdminNotificationsPage: React.FC = () => {
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
        const response = await api.get<Notification[]>(`/campushub-notification-service/api/notifications/user/${userId}`);
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
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start p-4 rounded-lg border ${
                    notif.isRead ? 'bg-muted/50' : 'bg-primary/10'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notif.titre}
                    </p>
                    <p className={`text-sm ${notif.isRead ? 'text-muted-foreground/80' : 'text-foreground/90'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto self-center"></div>
                  )}
                </div>
              ))
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

export default AdminNotificationsPage;
