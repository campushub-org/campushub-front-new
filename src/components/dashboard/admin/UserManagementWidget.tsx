import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, GraduationCap, Briefcase } from 'lucide-react';

const userStats = [
  { icon: <Users className="h-6 w-6 text-blue-500" />, label: 'Total Users', value: '1500' },
  { icon: <User className="h-6 w-6 text-green-500" />, label: 'Admin', value: '5' },
  { icon: <GraduationCap className="h-6 w-6 text-purple-500" />, label: 'Teacher', value: '80' },
  { icon: <Briefcase className="h-6 w-6 text-orange-500" />, label: 'Student', value: '1415' },
];

const UserManagementWidget: React.FC = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Gestion des Utilisateurs</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {userStats.map((item, index) => (
          <div key={index} className="flex items-center space-x-4 rounded-md border p-4">
            {item.icon}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserManagementWidget;
