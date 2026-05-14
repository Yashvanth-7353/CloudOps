import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  Globe2,
  GitBranch,
  HardDriveDownload,
  Loader2,
  RefreshCw,
  Search,
  Server,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { deploymentService } from '@/services/auth-service';

type DeploymentRecord = {
  _id: string;
  projectId?: string | null;
  repositoryName?: string;
  repositoryUrl?: string;
  branch?: string;
  status?: string;
  phase?: string;
  framework?: string;
  publicUrl?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  totalTime?: number;
  error?: {
    message?: string;
  };
  metadata?: Record<string, any>;
};

const statusStyles: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  deploying: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20',
  running: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20',
  building: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  pushing: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  pending: 'bg-white/6 text-white/60 border-white/10',
  failed: 'bg-rose-500/15 text-rose-300 border-rose-400/20',
  cancelled: 'bg-white/6 text-white/60 border-white/10',
  stopped: 'bg-white/6 text-white/60 border-white/10',
};

const formatDate = (value?: string) => {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
};

const formatDuration = (ms?: number) => {
  if (!ms || Number.isNaN(ms)) return 'Pending';
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${remaining}s`;
};

export default function DeploymentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deploymentId = searchParams.get('deploymentId') || '';
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (deploymentId) {
      navigate(`/deployments/${encodeURIComponent(deploymentId)}`, { replace: true });
    }
  }, [deploymentId, navigate]);

  useEffect(() => {
    let cancelled = false;

    const fetchDeployments = async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await deploymentService.getAll();
        const raw = response?.data?.data || response?.data?.deployments || response?.data || [];
        const nextDeployments = Array.isArray(raw) ? raw : [];

        if (cancelled) return;
        setDeployments(nextDeployments.sort((a: DeploymentRecord, b: DeploymentRecord) => {
          const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return bTime - aTime;
        }));
        setError(null);
      } catch (fetchError: any) {
        if (cancelled) return;
        setError(fetchError?.response?.data?.error || fetchError?.message || 'Unable to load deployments.');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void fetchDeployments();
    const timer = setInterval(() => void fetchDeployments(true), 8000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const filteredDeployments = useMemo(() => {
    return deployments.filter((deployment) => {
      const matchesQuery = `${deployment.repositoryName || ''} ${deployment.repositoryUrl || ''} ${deployment.framework || ''} ${deployment.phase || ''}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deployment.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [deployments, query, statusFilter]);

  const statusCounts = useMemo(() => {
    return deployments.reduce<Record<string, number>>((acc, deployment) => {
      const key = deployment.status || 'pending';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [deployments]);

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/60">
                <HardDriveDownload className="h-3.5 w-3.5" />
                Deployments
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Deployed repositories</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/60">
                Review every deployment stored in MongoDB, open a deployment card, and inspect the live status, project info, and logs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                void (async () => {
                  try {
                    const response = await deploymentService.getAll();
                    const raw = response?.data?.data || response?.data?.deployments || response?.data || [];
                    setDeployments(Array.isArray(raw) ? raw : []);
                    setError(null);
                  } catch (refreshError: any) {
                    setError(refreshError?.response?.data?.error || refreshError?.message || 'Unable to refresh deployments.');
                  } finally {
                    setRefreshing(false);
                  }
                })();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </motion.div>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total', value: deployments.length, tone: 'text-white' },
              { label: 'Successful', value: statusCounts.success || 0, tone: 'text-emerald-300' },
              { label: 'Running', value: (statusCounts.running || 0) + (statusCounts.deploying || 0), tone: 'text-cyan-300' },
              { label: 'Failed', value: statusCounts.failed || 0, tone: 'text-rose-300' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-[rgba(8,12,20,0.75)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <div className="text-xs uppercase tracking-[0.24em] text-white/45">{item.label}</div>
                <div className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-lg">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search repository, framework, or phase"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40"
                />
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                <Filter className="ml-2 h-4 w-4 text-white/45" />
                {['all', 'success', 'deploying', 'running', 'failed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium capitalize transition ${statusFilter === status ? 'bg-cyan-500/20 text-cyan-200' : 'text-white/60 hover:text-white'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : filteredDeployments.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-10 text-center text-white/60">
              No deployments found.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDeployments.map((deployment) => {
                const status = deployment.status || 'pending';
                const badgeClass = statusStyles[status] || statusStyles.pending;
                const liveUrl = deployment.publicUrl || deployment.metadata?.liveUrl;

                return (
                  <motion.button
                    key={deployment._id}
                    type="button"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/deployments/${deployment._id}`)}
                    className="group rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,28,0.96),rgba(8,12,20,0.9))] p-5 text-left shadow-[0_30px_80px_rgba(0,0,0,0.3)] transition hover:border-cyan-400/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                          <Server className="h-3.5 w-3.5" />
                          {deployment.framework || 'Deployment'}
                        </div>
                        <h3 className="mt-3 truncate text-xl font-semibold text-white">
                          {deployment.repositoryName || 'Unnamed repository'}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-white/55">
                          <GitBranch className="h-4 w-4" />
                          {deployment.branch || 'main'}
                        </div>
                      </div>

                      <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${badgeClass}`}>
                        {status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-white/70">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <span className="text-white/45">Phase</span>
                        <span className="font-medium text-white">{deployment.phase || 'preparation'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <span className="text-white/45">Updated</span>
                        <span className="font-medium text-white">{formatDate(deployment.updatedAt || deployment.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <span className="text-white/45">Total time</span>
                        <span className="font-medium text-white">{formatDuration(deployment.totalTime)}</span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2 text-sm text-white/65">
                        <Clock3 className="h-4 w-4" />
                        <span>Deployment ID: {deployment._id}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-white/65">
                        <Globe2 className="h-4 w-4" />
                        {liveUrl ? (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="truncate text-cyan-300 hover:text-cyan-200"
                          >
                            {liveUrl}
                          </a>
                        ) : (
                          <span className="text-white/35">Live URL pending</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 text-sm font-medium text-cyan-300">
                      Open details <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
