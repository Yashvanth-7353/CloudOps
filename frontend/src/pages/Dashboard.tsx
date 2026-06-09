import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Clock3,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import {
  PageHeader,
  MetricCard,
  Alert,
  StatusBadge,
  Card,
  Skeleton,
  EmptyState,
  Button,
} from '@/components/ui';
import { analyticsService } from '@/services/auth-service';
import { formatDuration, formatRelativeDate } from '@/lib/utils';

const RepoList = React.lazy(() => import('@/components/dashboard/RepoList'));

type DashboardSummary = {
  totalDeployments?: number;
  successfulDeployments?: number;
  activeDeployments?: number;
  successRate?: number;
  avgDeployTimeMs?: number;
};

type DashboardData = {
  summary?: DashboardSummary;
  recentDeployments?: Array<{
    _id: string;
    repositoryName?: string;
    framework?: string;
    status?: string;
    totalTime?: number;
    createdAt?: string;
    publicUrl?: string;
  }>;
};

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await analyticsService.getDashboard();
      return response.data as DashboardData;
    },
    refetchInterval: 30000,
  });

  const summary = dashboardData?.summary || {};

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Deployments',
      value: String(summary.totalDeployments || 0),
      description: 'All time',
    },
    {
      icon: CheckCircle2,
      label: 'Success Rate',
      value: `${Number(summary.successRate || 0).toFixed(1)}%`,
      description: 'Successful runs',
    },
    {
      icon: Activity,
      label: 'Active',
      value: String(summary.activeDeployments || 0),
      description: 'Currently running',
    },
    {
      icon: Clock3,
      label: 'Avg Deploy Time',
      value: formatDuration(summary.avgDeployTimeMs || 0),
      description: 'Mean duration',
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Monitor deployments, infrastructure health, and repository activity at a glance."
        actions={
          <Link to="/deployments">
            <Button variant="outline" size="sm" className="gap-2">
              View all deployments
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {error && (
        <Alert variant="destructive" title="Failed to load dashboard" className="mb-6">
          Could not fetch analytics data. Your deployments are still accessible from the deployments page.
        </Alert>
      )}

      {/* Metrics */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <MetricCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            loading={isLoading}
            delay={index * 0.08}
          />
        ))}
      </div>

      {/* Recent deployments */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent Deployments</h2>
          <Link to="/deployments" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-4 h-3 w-1/2" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </Card>
            ))}
          </div>
        ) : dashboardData?.recentDeployments && dashboardData.recentDeployments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardData.recentDeployments.slice(0, 6).map((deployment, index) => (
              <motion.div
                key={deployment._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.06 }}
              >
                <Link to={`/deployments/${deployment._id}`}>
                  <Card className="group h-full border-border/60 bg-card/80 p-5 transition-all hover:border-primary/30 hover:shadow-glow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground group-hover:text-primary">
                          {deployment.repositoryName || 'Unknown Repository'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {deployment.framework || 'Unknown'} · {formatDuration(deployment.totalTime)}
                        </p>
                      </div>
                      <StatusBadge status={deployment.status} />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatRelativeDate(deployment.createdAt)}</span>
                      {deployment.publicUrl && (
                        <span
                          className="inline-flex items-center gap-1 text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Live
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No deployments yet"
            description="Connect a GitHub repository and deploy your first project to see activity here."
            action={{ label: 'Go to repositories', onClick: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) }}
          />
        )}
      </section>

      {/* Repositories */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">GitHub Repositories</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect a repository to deploy and manage from CloudOps.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="h-24 w-full" />
                </Card>
              ))}
            </div>
          }
        >
          <RepoList />
        </Suspense>
      </section>
    </DashboardLayout>
  );
}
