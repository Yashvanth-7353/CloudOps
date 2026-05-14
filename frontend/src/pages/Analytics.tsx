import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock3, Loader2, ShieldAlert, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { analyticsService } from '@/services/auth-service';

type DashboardAnalytics = {
  summary?: {
    totalDeployments?: number;
    successfulDeployments?: number;
    activeDeployments?: number;
    successRate?: number;
    avgDeployTimeMs?: number;
    totalDeployTimeMs?: number;
  };
  statusBreakdown?: Array<{ status: string; count: number }>;
  frameworkBreakdown?: Array<{ framework: string; count: number }>;
  deploymentTrend?: Array<{ date: string; count: number; success: number; failed: number }>;
};

type CostAnalytics = {
  totalEstimatedCostUsd?: number;
  averageDailyCostUsd?: number;
  costByDay?: Array<{ date: string; deployments: number; estimatedCostUsd: number }>;
};

type PerformanceAnalytics = {
  sampleSize?: number;
  failureRate?: number;
  avgDeployTimeMs?: number;
  p50DeployTimeMs?: number;
  p95DeployTimeMs?: number;
  slowestDeployments?: Array<{
    deploymentId: string;
    repositoryName: string;
    totalTimeMs: number;
    status: string;
    createdAt: string;
  }>;
};

type DeploymentsAnalytics = {
  topRepositories?: Array<{
    repositoryName: string;
    count: number;
    successRate: number;
  }>;
};

const STATUS_COLORS: Record<string, string> = {
  success: '#34d399',
  failed: '#fb7185',
  running: '#22d3ee',
  deploying: '#38bdf8',
  queued: '#f59e0b',
  default: '#a78bfa',
};

const formatDuration = (ms = 0) => {
  if (!ms || Number.isNaN(ms)) return '0s';
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${remaining}s`;
};

const formatUsd = (value = 0) => `$${value.toFixed(4)}`;

const chartTooltipStyle = {
  background: 'rgba(2, 6, 23, 0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
};

export default function AnalyticsPage(){
  const [days, setDays] = useState(30);
  const queryParams = useMemo(() => ({ days }), [days]);

  const dashboardQuery = useQuery({
    queryKey: ['analytics-dashboard-live', queryParams],
    queryFn: async () => {
      const response = await analyticsService.getDashboard(queryParams);
      const payload = response.data as any;
      return (payload?.data || payload || {}) as DashboardAnalytics;
    },
  });

  const deploymentsQuery = useQuery({
    queryKey: ['analytics-deployments-live', queryParams],
    queryFn: async () => {
      const response = await analyticsService.getDeploymentAnalytics(queryParams);
      const payload = response.data as any;
      return (payload?.data || payload || {}) as DeploymentsAnalytics;
    },
  });

  const costsQuery = useQuery({
    queryKey: ['analytics-costs-live', queryParams],
    queryFn: async () => {
      const response = await analyticsService.getCostAnalytics(queryParams);
      const payload = response.data as any;
      return (payload?.data || payload || {}) as CostAnalytics;
    },
  });

  const performanceQuery = useQuery({
    queryKey: ['analytics-performance-live', queryParams],
    queryFn: async () => {
      const response = await analyticsService.getPerformanceMetrics(queryParams);
      const payload = response.data as any;
      return (payload?.data || payload || {}) as PerformanceAnalytics;
    },
  });

  const loading = dashboardQuery.isLoading || deploymentsQuery.isLoading || costsQuery.isLoading || performanceQuery.isLoading;
  const loadError = dashboardQuery.error || deploymentsQuery.error || costsQuery.error || performanceQuery.error;

  const dashboard = dashboardQuery.data || {};
  const performance = performanceQuery.data || {};
  const costs = costsQuery.data || {};
  const deployments = deploymentsQuery.data || {};

  const statCards = [
    {
      label: 'Total deployments',
      value: String(dashboard.summary?.totalDeployments || 0),
      icon: <TrendingUp className="h-5 w-5" />,
      tone: 'text-cyan-200',
    },
    {
      label: 'Success rate',
      value: `${Number(dashboard.summary?.successRate || 0).toFixed(1)}%`,
      icon: <CheckCircle2 className="h-5 w-5" />,
      tone: 'text-emerald-200',
    },
    {
      label: 'Avg deploy time',
      value: formatDuration(performance.avgDeployTimeMs || dashboard.summary?.avgDeployTimeMs || 0),
      icon: <Clock3 className="h-5 w-5" />,
      tone: 'text-amber-200',
    },
    {
      label: 'Failure rate',
      value: `${Number(performance.failureRate || 0).toFixed(1)}%`,
      icon: <ShieldAlert className="h-5 w-5" />,
      tone: 'text-rose-200',
    },
  ];

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-white/60">Real deployment analytics powered by your MongoDB deployment history.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
              {[7, 30, 90].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDays(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${days === value ? 'bg-cyan-500/20 text-cyan-200' : 'text-white/60 hover:text-white'}`}
                >
                  {value}d
                </button>
              ))}
            </div>
          </div>

          {loadError && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{(loadError as any)?.message || 'Failed to load analytics data.'}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading analytics...
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                  <div key={card.label} className="rounded-xl border border-white/10 bg-[rgba(12,16,26,0.7)] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">{card.label}</div>
                      <div className={`rounded-lg border border-white/10 bg-white/5 p-2 ${card.tone}`}>{card.icon}</div>
                    </div>
                    <div className="mt-3 text-2xl font-bold text-white">{card.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-[rgba(12,16,26,0.7)] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Deployment trend</h3>
                      <div className="text-xs text-white/60">Daily</div>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <AreaChart data={dashboard.deploymentTrend || []}>
                          <defs>
                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Area type="monotone" dataKey="count" stroke="#22d3ee" fill="url(#trendGradient)" strokeWidth={2} />
                          <Line type="monotone" dataKey="success" stroke="#34d399" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="failed" stroke="#fb7185" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[rgba(12,16,26,0.7)] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Estimated infrastructure cost</h3>
                      <div className="text-xs text-white/60">{formatUsd(costs.totalEstimatedCostUsd || 0)} total</div>
                    </div>
                    <div style={{ width: '100%', height: 240 }}>
                      <ResponsiveContainer>
                        <LineChart data={costs.costByDay || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                          <Tooltip contentStyle={chartTooltipStyle} formatter={(value: any) => [formatUsd(Number(value || 0)), 'Cost']} />
                          <Line type="monotone" dataKey="estimatedCostUsd" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-[rgba(12,16,26,0.7)] p-4">
                    <h3 className="mb-3 text-sm font-semibold text-white">Status distribution</h3>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={dashboard.statusBreakdown || []}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {(dashboard.statusBreakdown || []).map((entry, index) => (
                              <Cell key={`${entry.status}-${index}`} fill={STATUS_COLORS[entry.status] || STATUS_COLORS.default} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[rgba(12,16,26,0.7)] p-4">
                    <h3 className="mb-3 text-sm font-semibold text-white">Framework usage</h3>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <BarChart data={dashboard.frameworkBreakdown || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="framework" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[rgba(12,16,26,0.7)] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Slowest deployments</h3>
                  <div className="space-y-2">
                    {(performance.slowestDeployments || []).length === 0 ? (
                      <div className="text-sm text-white/50">No timed deployments found in this window.</div>
                    ) : (
                      (performance.slowestDeployments || []).map((item) => (
                        <div key={item.deploymentId} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          <div className="text-sm font-medium text-white">{item.repositoryName}</div>
                          <div className="mt-1 text-xs text-white/60">
                            {formatDuration(item.totalTimeMs)} | {new Date(item.createdAt).toLocaleString()} | {item.status}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[rgba(12,16,26,0.7)] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Top repositories</h3>
                  <div className="space-y-2">
                    {(deployments.topRepositories || []).length === 0 ? (
                      <div className="text-sm text-white/50">No repository activity found in this window.</div>
                    ) : (
                      (deployments.topRepositories || []).map((item) => (
                        <div key={item.repositoryName} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          <div className="text-sm font-medium text-white">{item.repositoryName}</div>
                          <div className="mt-1 text-xs text-white/60">
                            {item.count} deployments | {item.successRate.toFixed(1)}% success
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
