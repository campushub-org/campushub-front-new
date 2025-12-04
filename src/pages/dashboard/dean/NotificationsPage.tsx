import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DeanNotificationsPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ici s'afficheront les notifications pour le Doyen.</p>
      </CardContent>
    </Card>
  );
};

export default DeanNotificationsPage;
