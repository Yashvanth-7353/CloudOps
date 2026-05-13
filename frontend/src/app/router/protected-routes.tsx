import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth-provider';

// This will check auth state from context/store
const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
