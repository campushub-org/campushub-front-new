import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const isAuthenticated = () => {
  // Check for the presence of the authentication token.
  return localStorage.getItem('token') !== null;
};

const ProtectedRoute: React.FC = () => {
  if (!isAuthenticated()) {
    // If not authenticated, redirect to the sign-in page
    return <Navigate to="/signin" />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
