import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NotificationsPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ici s'afficheront les notifications de l'étudiant.</p>
        {/* Le contenu de la page des notifications viendra ici */}
      </CardContent>
    </Card>
  );
};

export default NotificationsPage;
