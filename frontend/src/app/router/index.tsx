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
import DeployProject from '../../pages/DeployProject';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/Home'));
const LoginPage = lazy(() => import('@/pages/Login'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
const BillingPage = lazy(() => import('@/pages/Billing'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const DeploymentsPage = lazy(() => import('@/pages/Deployments'));
const DeploymentDetailPage = lazy(() => import('@/pages/DeploymentDetail'));
const LiveProjectsPage = lazy(() => import('@/pages/LiveProjects'));
const EnvironmentVariablesPage = lazy(() => import('@/pages/EnvironmentVariables'));
const DocsPage = lazy(() => import('@/pages/Docs'));
const DeploymentPipelineShowcase = lazy(() => import('@/pages/DeploymentPipelineShowcase'));

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
        className="relative z-10"
      >
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/demo/deployment-pipeline" element={<DeploymentPipelineShowcase />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/deployments" element={<DeploymentsPage />} />
              <Route path="/deployment-logs" element={<DeploymentsPage />} />
              <Route path="/deployments/:id" element={<DeploymentDetailPage />} />
              <Route path="/live-projects" element={<LiveProjectsPage />} />
              <Route path="/environment-variables" element={<EnvironmentVariablesPage />} />
              <Route path="/deploy/:owner/:repo" element={<DeployProject />} />
            </Route>

            <Route path="/docs" element={<DocsPage />} />

            <Route
              path="*"
              element={
                <div className="page-shell page-shell--wide text-center">
                  <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
                  <p className="mt-3 text-muted-foreground">Page not found</p>
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
