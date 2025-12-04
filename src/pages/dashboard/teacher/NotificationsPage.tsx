import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const teacherNotifications = [
  { id: 1, message: 'Votre support "Algèbre Linéaire - Chap. 1" a été validé.', time: 'il y a 2h' },
  { id: 2, message: 'Une nouvelle demande de disponibilité a été soumise.', time: 'hier' },
  { id: 3, message: 'Une nouvelle demande de disponibilité a été soumise.', time: '3 jours ago' },
];

const TeacherNotificationsPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {teacherNotifications.length > 0 ? (
          <div className="space-y-4">
            {teacherNotifications.map(notification => (
              <div key={notification.id} className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucune nouvelle notification.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherNotificationsPage;
