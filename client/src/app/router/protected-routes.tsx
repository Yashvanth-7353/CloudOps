import { Navigate, Outlet } from 'react-router-dom';

// This will check auth state from context/store
const ProtectedRoutes = () => {
  const isAuthenticated = true; // TODO: Get from auth context

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
