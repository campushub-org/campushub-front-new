import React from 'react';

// Widgets for Admin Dashboard
import UserManagementWidget from '@/components/dashboard/admin/UserManagementWidget';
import RoomResourceWidget from '@/components/dashboard/admin/RoomResourceWidget';
import PlanningOverviewWidget from '@/components/dashboard/admin/PlanningOverviewWidget';
import QuickReportsWidget from '@/components/dashboard/admin/QuickReportsWidget';

const AdminDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-flow-row-dense">
      <div className="lg:col-span-2 h-full">
        <UserManagementWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <RoomResourceWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <PlanningOverviewWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <QuickReportsWidget />
      </div>
    </div>
  );
};

export default AdminDashboard;
