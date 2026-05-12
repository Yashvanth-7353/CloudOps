import React, { Suspense } from 'react';
import { Layout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Activity, Zap, AlertCircle, TrendingUp } from 'lucide-react';

// Lazy load RepoList
const RepoList = React.lazy(() => import('@/components/dashboard/RepoList'));

/**
 * Dashboard Page
 * Main application dashboard for authenticated users
 */

export default function DashboardPage() {
  const stats = [
    { icon: Activity, label: 'Active Deployments', value: '12', color: 'text-accent' },
    { icon: Zap, label: 'Total Uptime', value: '99.9%', color: 'text-primary' },
    { icon: TrendingUp, label: 'Performance', value: '+24%', color: 'text-success' },
    { icon: AlertCircle, label: 'Alerts', value: '2', color: 'text-warning' },
  ];

  return (
    <Layout showNavbar={true}>
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
                    <div>
                      <p className="text-text-secondary text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} opacity-60`}>
                      <Icon className="w-10 h-10" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Repositories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className=""
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4">Repositories</h2>
            <div className="mb-6">
              <p className="text-text-secondary">Manage connected GitHub repositories and deploy with one click.</p>
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
    </Layout>
  );
}
