import React from 'react';

// Widgets for Dean Dashboard
import MaterialsToValidateWidget from '@/components/dashboard/dean/MaterialsToValidateWidget';
import GlobalPlanningOverviewWidget from '@/components/dashboard/dean/GlobalPlanningOverviewWidget';
import KeyStatisticsWidget from '@/components/dashboard/dean/KeyStatisticsWidget';
import DeanReportsWidget from '@/components/dashboard/dean/DeanReportsWidget';


const DeanDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-flow-row-dense">
      <div className="lg:col-span-2 h-full">
        <MaterialsToValidateWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <GlobalPlanningOverviewWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <KeyStatisticsWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <DeanReportsWidget />
      </div>
    </div>
  );
};

export default DeanDashboard;
