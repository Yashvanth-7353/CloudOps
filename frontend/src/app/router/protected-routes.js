import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth-provider';
// This will check auth state from context/store
const ProtectedRoutes = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/login", replace: true });
};
export default ProtectedRoutes;
