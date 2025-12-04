import React from 'react';

// Widgets
import UpcomingExamsWidget from '@/components/dashboard/student/UpcomingExamsWidget';
import OverallProgressWidget from '@/components/dashboard/student/OverallProgressWidget';
import QuickInfoWidget from '@/components/dashboard/student/QuickInfoWidget';

const StudentDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-flow-row-dense">
      <div className="lg:col-span-2 h-full">
        <UpcomingExamsWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <OverallProgressWidget />
      </div>
      <div className="lg:col-span-4">
        <QuickInfoWidget />
      </div>
    </div>
  );
};

export default StudentDashboard;
