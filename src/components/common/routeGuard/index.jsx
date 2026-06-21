import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Route Guard: it controls access to certain routes based on the user's authentication status.
 */

/**
 * RequireAuth: it is used to wrap around routes that should only be accessible to authenticated users (like /homepage, /course/:id, etc.).
 */
export const RequireAuth = () => {
  const location = useLocation();

  const isAuthenticated = !!localStorage.getItem('refreshToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * RequireGuest: it is used to wrap around routes that should only be accessible to unauthenticated users (like /login, /signup, etc.).
 */
export const RequireGuest = () => {
  const isAuthenticated = !!localStorage.getItem('refreshToken');

  if (isAuthenticated) {
    return <Navigate to="/homepage" replace />;
  }

  return <Outlet />;
};
