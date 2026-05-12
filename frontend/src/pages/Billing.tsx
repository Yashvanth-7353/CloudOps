import React from 'react';
import { DashboardLayout } from '@/components/layout';
import CostSummaryCards from '@/components/billing/CostSummaryCards';
import CostBreakdownChart from '@/components/billing/CostBreakdownChart';
import CostPredictionChart from '@/components/billing/CostPredictionChart';
import CostSuggestions from '@/components/billing/CostSuggestions';

export default function BillingPage(){
  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Billing & Cost Analysis</h1>
            <p className="text-white/60">AWS cost breakdown, trends, and optimization opportunities.</p>
          </div>

          <CostSummaryCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <CostBreakdownChart />
              <CostPredictionChart />
            </div>

            <div className="space-y-4">
              <CostSuggestions />
              <div className="backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Usage Analytics</h3>
                <div className="text-sm text-white/70">Top services by spend, hourly usage, and anomalous billing events will appear here.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
