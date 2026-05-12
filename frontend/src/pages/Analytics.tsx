import React from 'react';
import { DashboardLayout } from '@/components/layout';
import StatsCards from '@/components/analytics/StatsCards';
import CPUChart from '@/components/analytics/CPUChart';
import MemoryChart from '@/components/analytics/MemoryChart';
import DeployFrequencyChart from '@/components/analytics/DeployFrequencyChart';
import MonthlyCostChart from '@/components/analytics/MonthlyCostChart';
import ApplicationHealth from '@/components/analytics/ApplicationHealth';

export default function AnalyticsPage(){
  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-white/60">Cluster and application metrics across deployments.</p>
          </div>

          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <CPUChart />
              <MemoryChart />
            </div>

            <div className="space-y-4">
              <DeployFrequencyChart />
              <MonthlyCostChart />
              <ApplicationHealth />
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
