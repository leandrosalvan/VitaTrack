import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
