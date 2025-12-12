import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const UnauthenticatedRoute: React.FC = () => {
  const isAuthenticated = localStorage.getItem('token'); // Ou toute autre méthode de vérification

  if (isAuthenticated) {
    // Si l'utilisateur est authentifié, rediriger vers le tableau de bord
    return <Navigate to="/dashboard" replace />;
  }

  // Si l'utilisateur n'est pas authentifié, rendre les routes enfants
  return <Outlet />;
};

export default UnauthenticatedRoute;