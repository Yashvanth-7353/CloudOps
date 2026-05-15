import React, { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock3, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { analyticsService } from '@/services/auth-service';

// Lazy load RepoList
const RepoList = React.lazy(() => import('@/components/dashboard/RepoList'));

/**
 * Dashboard Page
 * Main application dashboard for authenticated users
 */

type DashboardSummary = {
  totalDeployments?: number;
  successfulDeployments?: number;
  activeDeployments?: number;
  successRate?: number;
  avgDeployTimeMs?: number;
  totalDeployTimeMs?: number;
};

type DashboardData = {
  summary?: DashboardSummary;
  statusBreakdown?: Array<{ status: string; count: number }>;
  frameworkBreakdown?: Array<{ framework: string; count: number }>;
  deploymentTrend?: Array<{ date: string; count: number; success: number; failed: number }>;
  recentDeployments?: Array<any>;
};

const formatDuration = (ms = 0) => {
  if (!ms || Number.isNaN(ms)) return '0s';
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${remaining}s`;
};

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await analyticsService.getDashboard();
      return response.data as DashboardData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const summary = dashboardData?.summary || {};

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Deployments',
      value: String(summary.totalDeployments || 0),
      color: 'text-accent',
      description: 'All time deployments'
    },
    {
      icon: CheckCircle2,
      label: 'Success Rate',
      value: `${Number(summary.successRate || 0).toFixed(1)}%`,
      color: 'text-success',
      description: 'Successful deployments'
    },
    {
      icon: Activity,
      label: 'Active Deployments',
      value: String(summary.activeDeployments || 0),
      color: 'text-primary',
      description: 'Currently running'
    },
    {
      icon: Clock3,
      label: 'Avg Deploy Time',
      value: formatDuration(summary.avgDeployTimeMs || 0),
      color: 'text-warning',
      description: 'Average completion time'
    },
  ];

  return (
    <DashboardLayout>
      <main className="space-y-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Dashboard
            </h1>
            <p className="text-text-secondary text-lg">
              Welcome back! Here's what's happening with your deployments.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="backdrop-blur-md bg-surface-glass/30 border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
                      <p className="text-text-secondary text-xs mb-2">{stat.description}</p>
                      {isLoading ? (
                        <div className="h-8 bg-surface-glass/50 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                      )}
                    </div>
                    <div className={`${stat.color} opacity-60`}>
                      <Icon className="w-10 h-10" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>Failed to load dashboard data</span>
              </div>
            </div>
          )}

          {/* Recent Deployments Preview */}
          {dashboardData?.recentDeployments && dashboardData.recentDeployments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-4">Recent Deployments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.recentDeployments.slice(0, 6).map((deployment: any, index: number) => (
                  <motion.div
                    key={deployment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="backdrop-blur-md bg-surface-glass/20 border border-border/30 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-medium text-sm truncate">
                          {deployment.repositoryName || 'Unknown Repository'}
                        </p>
                        <p className="text-text-secondary text-xs">
                          {deployment.framework || 'Unknown'} • {formatDuration(deployment.totalTime)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deployment.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : deployment.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {deployment.status}
                      </div>
                    </div>
                    <p className="text-text-secondary text-xs">
                      {new Date(deployment.createdAt).toLocaleDateString()}
                    </p>
                    {deployment.publicUrl && (
                      <a
                        href={deployment.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 text-xs mt-2 inline-block"
                      >
                        View Live →
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Repositories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className=""
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4">GitHub repositories</h2>
            <div className="mb-6">
              <p className="text-text-secondary">Connect a GitHub repo to load live repository cards and manage them from CloudOps.</p>
            </div>

            <div>
              {/* Lazy load RepoList to avoid heavy initial bundle if desired */}
              <Suspense fallback={<div>Loading repositories...</div>}>
                <RepoList />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </main>
    </DashboardLayout>
  );
}
