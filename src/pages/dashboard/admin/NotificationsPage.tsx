import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminNotificationsPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications Administrateur</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ici s'afficheront les notifications pour l'administrateur.</p>
      </CardContent>
    </Card>
  );
};

export default AdminNotificationsPage;
