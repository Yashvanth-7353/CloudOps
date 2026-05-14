import { AnimatePresence, motion } from 'framer-motion';
import { Routes as RouterRoutes, Route, useLocation } from 'react-router-dom';
import ProtectedRoutes from './protected-routes';
import { lazy, Suspense } from 'react';
import {
  DashboardStatsLoadingState,
  AnalyticsChartSkeleton,
  NavbarLoadingState,
  DeploymentLogsSkeleton,
} from '@/components/skeletons';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/Home'));
const LoginPage = lazy(() => import('@/pages/Login'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
const BillingPage = lazy(() => import('@/pages/Billing'));
const PricingPage = lazy(() => import('@/pages/Pricing'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const DeployedProjectsPage = lazy(() => import('@/pages/DeployedProjects'));
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

const PageLoader = () => (
  <div className="page-shell page-shell--wide">
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <NavbarLoadingState />
        <DashboardStatsLoadingState />
        <AnalyticsChartSkeleton />
      </div>
      <div className="space-y-4">
        <DeploymentLogsSkeleton />
      </div>
    </div>
  </div>
);

function Routes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className=""
      >
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/deployed-projects" element={<DeployedProjectsPage />} />
              <Route path="/deployments" element={<DeploymentLogsPage />} />
              <Route path="/deployment-logs" element={<DeploymentLogsPage />} />
              <Route path="/live-projects" element={<LiveProjectsPage />} />
            </Route>

            <Route path="/docs" element={<DocsPage />} />

            <Route
              path="*"
              element={
                <div className="page-shell page-shell--wide text-center">
                  <h1 className="text-4xl font-semibold text-white">404</h1>
                  <p className="mt-3 text-white/65">Page Not Found</p>
                </div>
              }
            />
          </RouterRoutes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default Routes;
