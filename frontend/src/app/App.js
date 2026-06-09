import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Routes from './router';
import AppBackground from '@/components/layout/AppBackground';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { AuthProvider } from '@/app/providers/auth-provider';
import './App.css';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        },
    },
});
function App() {
    return (_jsx(ThemeProvider, { children: _jsx(ToastProvider, { children: _jsx(ErrorBoundary, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(Router, { basename: import.meta.env.BASE_URL !== './' ? import.meta.env.BASE_URL : undefined, children: _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 }, className: "relative min-h-screen overflow-hidden bg-background", children: [_jsx(AppBackground, {}), _jsx(Routes, {})] }) }) }) }) }) }) }));
}
export default App;
