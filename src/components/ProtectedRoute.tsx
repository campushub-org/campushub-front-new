import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';

const ProtectedRoute: React.FC = () => {
  if (!isAuthenticated()) {
    // If not authenticated (or token expired), redirect to the sign-in page
    return <Navigate to="/signin" />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
