import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const isAuthenticated = () => {
  // In a real app, this would involve checking a token, maybe calling an API.
  // For now, we'll use a simple placeholder in localStorage.
  return localStorage.getItem('isAuthenticated') === 'true';
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
