import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AdminPage } from '../pages/AdminPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { useAuthStore } from '../store/auth.store';
import React from 'react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminGuard() {
  const user = useAuthStore((s) => s.user);
  return user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <AuthGuard><HomePage /></AuthGuard> },
      { path: 'orders', element: <AuthGuard><OrderHistoryPage /></AuthGuard> },
      { path: 'admin', element: <AuthGuard><AdminGuard /></AuthGuard> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
]);
