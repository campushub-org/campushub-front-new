import React from 'react';

// Widgets for Teacher Dashboard
import CourseMaterialsWidget from '@/components/dashboard/teacher/CourseMaterialsWidget';
import TeacherScheduleWidget from '@/components/dashboard/teacher/TeacherScheduleWidget';
import ValidationStatusWidget from '@/components/dashboard/teacher/ValidationStatusWidget';

const TeacherDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-flow-row-dense">
      {/* Course Materials and Schedule take more space */}
      <div className="lg:col-span-2 h-full">
        <CourseMaterialsWidget />
      </div>
      <div className="lg:col-span-2 h-full">
        <TeacherScheduleWidget />
      </div>
      {/* Validation Status as a smaller info card */}
      <div className="lg:col-span-4"> {/* Span full width on large screens */}
        <ValidationStatusWidget />
      </div>
    </div>
  );
};

export default TeacherDashboard;
