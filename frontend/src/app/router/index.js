import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { Routes as RouterRoutes, Route, useLocation } from 'react-router-dom';
import ProtectedRoutes from './protected-routes';
import { lazy, Suspense } from 'react';
import { DashboardStatsLoadingState, AnalyticsChartSkeleton, NavbarLoadingState, DeploymentLogsSkeleton, } from '@/components/skeletons';
import DeployProject from '../../pages/DeployProject';
// Lazy load pages
const HomePage = lazy(() => import('@/pages/Home'));
const LoginPage = lazy(() => import('@/pages/Login'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
const BillingPage = lazy(() => import('@/pages/Billing'));
const PricingPage = lazy(() => import('@/pages/Pricing'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const DeploymentLogsPage = lazy(() => import('@/pages/DeploymentLogs'));
const LiveProjectsPage = lazy(() => import('@/pages/LiveProjects'));
const DocsPage = lazy(() => import('@/pages/Docs'));
const pageVariants = {
    initial: { opacity: 0, y: 18, scale: 0.99 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12, scale: 0.99 },
};
const pageTransition = {
    duration: 0.3,
    ease: 'easeInOut',
};
const PageLoader = () => (_jsx("div", { className: "page-shell page-shell--wide", children: _jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx(NavbarLoadingState, {}), _jsx(DashboardStatsLoadingState, {}), _jsx(AnalyticsChartSkeleton, {})] }), _jsx("div", { className: "space-y-4", children: _jsx(DeploymentLogsSkeleton, {}) })] }) }));
function Routes() {
    const location = useLocation();
    return (_jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { variants: pageVariants, initial: "initial", animate: "animate", exit: "exit", transition: pageTransition, className: "relative z-10", children: _jsx(Suspense, { fallback: _jsx(PageLoader, {}), children: _jsxs(RouterRoutes, { location: location, children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoutes, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "/billing", element: _jsx(BillingPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/deployments", element: _jsx(DeploymentLogsPage, {}) }), _jsx(Route, { path: "/deployment-logs", element: _jsx(DeploymentLogsPage, {}) }), _jsx(Route, { path: "/live-projects", element: _jsx(LiveProjectsPage, {}) }), _jsx(Route, { path: "/deploy/:owner/:repo", element: _jsx(DeployProject, {}) })] }), _jsx(Route, { path: "/docs", element: _jsx(DocsPage, {}) }), _jsx(Route, { path: "*", element: _jsxs("div", { className: "page-shell page-shell--wide text-center", children: [_jsx("h1", { className: "text-4xl font-semibold text-white", children: "404" }), _jsx("p", { className: "mt-3 text-white/65", children: "Page Not Found" })] }) })] }, location.pathname) }) }, location.pathname) }));
}
export default Routes;
