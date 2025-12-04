import React from 'react';
import { Navigate } from 'react-router-dom';

// This is a placeholder for the logic that will determine the user's role
// In a real app, you would get this from a context, a hook, or a store
const getUserRole = () => {
  // For now, let's hardcode a role. We'll change this later.
  // Possible values: 'student', 'teacher', 'admin', 'dean'
  const role = localStorage.getItem('userRole') || 'student';
  return role;
};

const Dashboard: React.FC = () => {
  const userRole = getUserRole();

  switch (userRole) {
    case 'student':
      return <Navigate to="/dashboard/student" />;
    case 'teacher':
      return <Navigate to="/dashboard/teacher" />;
    case 'admin':
      return <Navigate to="/dashboard/admin" />;
    case 'dean':
      return <Navigate to="/dashboard/dean" />;
    default:
      // If role is unknown, redirect to login
      return <Navigate to="/signin" />;
  }
};

export default Dashboard;
