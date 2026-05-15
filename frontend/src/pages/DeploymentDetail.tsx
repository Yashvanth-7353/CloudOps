import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  ExternalLink,
  GitBranch,
  Globe2,
  HardDriveDownload,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { deploymentService } from '@/services/auth-service';
import LiveProgressBar from '@/components/deployments/LiveProgressBar';
import TerminalStream from '@/components/deployments/TerminalStream';
import DeploymentTimeline from '@/components/deployments/DeploymentTimeline';

type DeploymentLog = {
  timestamp?: string;
  source?: string;
  level?: string;
  message?: string;
};

type DeploymentDetails = {
  _id?: string;
  deploymentId?: string;
  projectId?: string | null;
  userId?: string;
  repositoryName?: string;
  repositoryUrl?: string;
  branch?: string;
  status?: string;
  phase?: string;
  framework?: string;
  publicUrl?: string;
  startedAt?: string;
  completedAt?: string;
  totalTime?: number;
  createdAt?: string;
  commitHash?: string;
  commitShortHash?: string;
  commitMessage?: string;
  commitAuthor?: string;
  commitDate?: string;
  dockerImageUri?: string;
  dockerImageTag?: string;
  infrastructure?: {
    provider?: string;
    targetType?: string;
    region?: string;
    target?: {
      type?: string;
      awsRegion?: string;
      instanceType?: string;
      keyName?: string | null;
      securityGroupIds?: string[];
      vpcId?: string | null;
      host?: string;
      user?: string;
      publicHost?: string | null;
      publicUrl?: string | null;
    };
    ecr?: {
      repositoryArn?: string | null;
      repositoryName?: string | null;
      repositoryUri?: string | null;
      imageUri?: string | null;
      imageTag?: string | null;
    };
    ec2?: {
      instanceId?: string | null;
      publicIp?: string | null;
      privateIp?: string | null;
      instanceType?: string | null;
      keyName?: string | null;
      securityGroupIds?: string[];
      vpcId?: string | null;
    };
    container?: {
      name?: string | null;
      imageName?: string | null;
      port?: number | null;
    };
    liveUrl?: string;
    deployState?: string;
  };
  error?: {
    message?: string;
    phase?: string;
  };
  metadata?: Record<string, any>;
};

const STEPS = [
  'Preparing Deployment',
  'Cloning Repository',
  'Detecting Framework',
  'Generating Dockerfile',
  'Building Docker Image',
  'Pushing to AWS ECR',
  'Launching EC2',
  'Starting Container',
  'Deployment Successful',
];

const phaseToStep: Record<string, number> = {
  preparation: 0,
  queued: 0,
  clone: 1,
  framework_detection: 2,
  dockerfile_generation: 3,
  docker_build: 4,
  push_ecr: 5,
  ec2_launch: 6,
  container_start: 7,
  nginx_setup: 7,
  complete: 8,
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

export default function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState<DeploymentDetails | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bringingDown, setBringingDown] = useState(false);
  const [bringDownConfirmOpen, setBringDownConfirmOpen] = useState(false);

  const deploymentKey = deployment?._id || deployment?.deploymentId || '';
  const metadata = (deployment?.metadata || {}) as Record<string, any>;
  const infrastructure = (deployment?.infrastructure || metadata.infrastructure || {}) as NonNullable<DeploymentDetails['infrastructure']> & Record<string, any>;
  const deploymentProvider = deployment?.deploymentService || infrastructure?.provider || 'aws';
  const targetType = infrastructure?.targetType || infrastructure?.target?.type || 'unknown';
  const commitHash = deployment?.commitShortHash || deployment?.commitHash || metadata?.repositoryInfo?.latestCommit?.shortHash || 'Unknown';
  const fullCommitHash = deployment?.commitHash || metadata?.repositoryInfo?.latestCommit?.hash || 'Unknown';
  const commitMessage = deployment?.commitMessage || metadata?.repositoryInfo?.latestCommit?.message || 'Unknown';
  const commitAuthor = deployment?.commitAuthor || metadata?.repositoryInfo?.latestCommit?.author || 'Unknown';
  const commitDate = deployment?.commitDate || metadata?.repositoryInfo?.latestCommit?.date;
  const ecrRepository = infrastructure?.ecr?.repositoryName || deployment?.metadata?.ecrRepository || 'Pending';
  const ecrRepositoryUri = infrastructure?.ecr?.repositoryUri || 'Pending';
  const ecrImageUri = infrastructure?.ecr?.imageUri || deployment?.dockerImageUri || metadata?.ecrImageUri || metadata?.dockerImageUri || 'Pending';
  const ecrImageTag = deployment?.dockerImageTag || infrastructure?.ecr?.imageTag || infrastructure?.acr?.imageTag || metadata?.dockerImageTag || 'Pending';
  const ec2InstanceId = infrastructure?.ec2?.instanceId || deployment?.metadata?.ec2InstanceId || 'Pending';
  const ec2PublicIp = infrastructure?.ec2?.publicIp || deployment?.metadata?.ec2PublicIp || 'Pending';
  const ec2PrivateIp = infrastructure?.ec2?.privateIp || deployment?.metadata?.ec2PrivateIp || 'Pending';
  const containerPort = infrastructure?.container?.port || deployment?.metadata?.containerPort || 80;
  const containerName = infrastructure?.container?.name || deployment?.metadata?.containerName || infrastructure?.aci?.containerName || 'Pending';
  const liveInfrastructureUrl = infrastructure?.liveUrl || deployment?.publicUrl || deployment?.metadata?.liveUrl;
  const dockerBuildTime = deployment?.dockerBuildTime || deployment?.buildTime || metadata?.dockerBuildTime;
  const dockerImageSize = deployment?.dockerImageSize || metadata?.dockerImageSize;
  const azureAcrRepository = infrastructure?.acr?.repositoryName || 'Pending';
  const azureAcrLoginServer = infrastructure?.acr?.loginServer || 'Pending';
  const azureAcrImageUri = infrastructure?.acr?.imageUri || ecrImageUri;
  const azureAcrImageName = infrastructure?.acr?.imageName || 'Pending';
  const azureAciContainerGroup = infrastructure?.aci?.containerGroupName || 'Pending';
  const azureAciResourceGroup = infrastructure?.aci?.resourceGroupName || infrastructure?.aci?.resourceGroup || 'Pending';
  const azureAciLocation = infrastructure?.aci?.location || infrastructure?.region || 'Pending';
  const azureAciFqdn = infrastructure?.aci?.fqdn || infrastructure?.aci?.ipAddress || 'Pending';
  const azureAciStatus = infrastructure?.aci?.status || 'Pending';
  const azureAciCpu = infrastructure?.aci?.cpu || 'Pending';
  const azureAciMemory = infrastructure?.aci?.memoryInGb || 'Pending';
  const isAwsDeployment = deploymentProvider === 'aws' || infrastructure?.provider === 'aws' || infrastructure?.targetType === 'aws';
  const isAzureDeployment = deploymentProvider === 'azure' || infrastructure?.provider === 'azure' || infrastructure?.targetType === 'azure';

  useEffect(() => {
    if (!id) {
      setError('Missing deployment id.');
      setLoading(false);
      return;
    }


    let disposed = false;

    const fetchDeployment = async () => {
      try {
        const [statusResponse, logsResponse] = await Promise.all([
          deploymentService.getById(id),
          deploymentService.getLogs(id, { limit: 250 }),
        ]);

        if (disposed) return;

        const statusPayload = statusResponse.data as any;
        const logsPayload = logsResponse.data as any;
        const nextDeployment = statusPayload?.deployment || statusPayload?.data || statusPayload || null;
        const nextLogs = Array.isArray(logsPayload?.logs) ? logsPayload.logs : [];

        setDeployment(nextDeployment);
        setLogs([...nextLogs].sort((a: DeploymentLog, b: DeploymentLog) => {
          const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
          return aTime - bTime;
        }));
        setError(null);
      } catch (fetchError: any) {
        if (disposed) return;
        setError(fetchError?.response?.data?.error || fetchError?.message || 'Unable to load deployment details.');
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    void fetchDeployment();
    const timer = setInterval(() => {
      const terminal = deployment?.status && ['success', 'failed', 'cancelled'].includes(deployment.status);
      if (!terminal) {
        void fetchDeployment();
      }
    }, 4000);

    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [id, deployment?.status]);

  const currentStep = useMemo(() => {
    if (!deployment) return 0;
    if (deployment.status === 'success') return STEPS.length - 1;
    return phaseToStep[deployment.phase || 'preparation'] ?? 0;
  }, [deployment]);

  const progress = useMemo(() => {
    if (!deployment) return 0;
    if (deployment.status === 'success') return 100;

    const stepPortion = Math.max(1, STEPS.length - 1);
    const base = (Math.min(currentStep, stepPortion) / stepPortion) * 100;

    if (deployment.status === 'failed' || deployment.status === 'cancelled') {
      return Math.max(5, Math.round(base));
    }

    return Math.min(95, Math.max(5, Math.round(base + 8)));
  }, [deployment, currentStep]);

  const timeline = useMemo(() => {
    return STEPS.map((label, index) => {
      if ((deployment?.status === 'failed' || deployment?.status === 'cancelled') && index === currentStep) {
        return { label, status: 'failed' };
      }
      if (index < currentStep) {
        return { label, status: 'success' };
      }
      if (index === currentStep && deployment && !['success', 'failed', 'cancelled'].includes(deployment.status || '')) {
        return { label, status: 'running' };
      }
      if (deployment?.status === 'success' && index === currentStep) {
        return { label, status: 'success' };
      }
      return { label, status: 'pending' };
    });
  }, [currentStep, deployment]);

  const renderedLogs = useMemo(() => {
    return logs.map((log) => {
      const ts = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
      const source = log.source ? `[${log.source}] ` : '';
      const level = log.level ? `${log.level.toUpperCase()}: ` : '';
      return `${ts ? `[${ts}] ` : ''}${source}${level}${log.message || ''}`.trim();
    });
  }, [logs]);

  const liveUrl = deployment?.publicUrl || deployment?.metadata?.liveUrl;
  const status = deployment?.status || 'pending';
  const badgeClass = statusStyles[status] || statusStyles.pending;
  const deploymentInstanceId = infrastructure?.ec2?.instanceId || (deployment?.metadata as any)?.ec2InstanceId || '';

  const handleBringDown = async () => {
    if (!deploymentInstanceId) {
      setError('No EC2 instance id found for this deployment.');
      return;
    }

    const effectiveEcrRepositoryName =
      infrastructure?.ecr?.repositoryName ||
      (deployment?.repositoryName ? `cloudops-${deployment.repositoryName}`.toLowerCase().substring(0, 256) : undefined);

    try {
      setBringingDown(true);
      setBringDownConfirmOpen(false); 
      

      await deploymentService.terminateAwsDeployment(deploymentInstanceId, {
        repositoryName: effectiveEcrRepositoryName,
        cleanupECR: true,
        deploymentId: deployment?._id,
      });

      setDeployment((current) =>
        current
          ? {
              ...current,
              status: 'closed',
              phase: 'complete',
              publicUrl: undefined,
            }
          : current
      );
    } catch (err: any) {
      console.error('Bring down error:', err);
      setError(err?.response?.data?.error || err?.message || 'Failed to bring down deployment');
    } finally {
      setBringingDown(false);
    }
  };

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/deployments')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to deployments
          </button>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && !deployment ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="h-[560px] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
              <div className="h-[560px] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            </div>
          ) : deployment ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="min-w-0 space-y-6">
                <div className="min-w-0 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/55">
                        <HardDriveDownload className="h-3.5 w-3.5" />
                        Deployment details
                      </div>
                      <h1 className="mt-4 text-3xl font-semibold text-white">
                        {deployment.repositoryName || 'Deployment'}
                      </h1>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60">
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${badgeClass}`}>{status}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <GitBranch className="h-4 w-4" />
                          {deployment.branch || 'main'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4" />
                          {formatDuration(deployment.totalTime)}
                        </span>
                      </div>
                    </div>

                    {liveUrl ? (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/15"
                      >
                        <Globe2 className="h-4 w-4" />
                        Open live URL
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
                        Live URL will appear after the deployment finishes.
                      </div>
                    )}
                    {isAwsDeployment && deployment.status === 'success' && (
                      <div className="mt-3 space-y-3">
                        <button
                          type="button"
                          disabled={bringingDown}
                          onClick={() => setBringDownConfirmOpen(true)}
                          className="ml-3 inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15"
                        >
                          {bringingDown ? 'Bringing down…' : 'Bring Down'}
                        </button>
                        {bringDownConfirmOpen && !bringingDown && (
                          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                            <div className="font-medium">Terminate the EC2 instance and clean up the ECR repository?</div>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => void handleBringDown()}
                                className="rounded-xl bg-rose-500 px-4 py-2 font-medium text-white transition hover:bg-rose-400"
                              >
                                Confirm bring down
                              </button>
                              <button
                                type="button"
                                onClick={() => setBringDownConfirmOpen(false)}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white/80 transition hover:bg-white/10"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {isAzureDeployment && deployment.status === 'success' && (
                      <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                        Azure deployments are managed through ACI/ACR. Use the Azure Portal to terminate resources.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Deployment ID', value: deploymentKey },
                      { label: 'Project ID', value: deployment.projectId || 'Not linked' },
                      { label: 'Framework', value: deployment.framework || 'auto-detected' },
                      { label: 'Started at', value: formatDate(deployment.startedAt || deployment.createdAt) },
                      { label: 'Completed at', value: formatDate(deployment.completedAt) },
                      { label: 'Phase', value: deployment.phase || 'preparation' },
                      { label: 'Live URL', value: liveInfrastructureUrl || 'Pending' },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{item.label}</div>
                        <div className="mt-2 break-words text-sm font-medium text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <h2 className="text-lg font-semibold text-white">Progress</h2>
                  <div className="mt-4">
                    <LiveProgressBar steps={STEPS} current={currentStep} progress={progress} />
                  </div>
                  <div className="mt-6">
                    <DeploymentTimeline steps={timeline as any} />
                  </div>
                </div>

                <div className="min-w-0 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <h2 className="text-lg font-semibold text-white">Deployment logs</h2>
                  <div className="mt-4">
                    {loading ? (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading logs...
                      </div>
                    ) : (
                      <TerminalStream logs={renderedLogs} />
                    )}
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-6">
                <div className="min-w-0 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <h2 className="text-lg font-semibold text-white">Project info</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {[
                      { label: 'Repository name', value: deployment.repositoryName || 'Unknown' },
                      { label: 'Repository URL', value: deployment.repositoryUrl || 'Unknown' },
                      { label: 'Branch', value: deployment.branch || 'main' },
                      { label: 'User ID', value: deployment.userId || 'Unknown' },
                      { label: 'Project ID', value: deployment.projectId || 'Not linked' },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{item.label}</div>
                        <div className="mt-2 break-words text-sm text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <h2 className="text-lg font-semibold text-white">Source and build</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Last commit', value: `${commitHash} ${fullCommitHash !== commitHash ? `(${fullCommitHash})` : ''}`.trim() },
                      { label: 'Commit author', value: commitAuthor },
                      { label: 'Commit message', value: commitMessage },
                      { label: 'Commit date', value: formatDate(commitDate) },
                      { label: 'Framework', value: deployment.framework || metadata?.framework || 'auto-detected' },
                      { label: 'Docker image tag', value: ecrImageTag },
                      { label: 'Docker image URI', value: ecrImageUri },
                      { label: 'Docker build time', value: dockerBuildTime ? formatDuration(dockerBuildTime) : 'Pending' },
                      { label: 'Docker image size', value: dockerImageSize ? `${(dockerImageSize / (1024 * 1024)).toFixed(2)} MB` : 'Pending' },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{item.label}</div>
                        <div className="mt-2 break-all text-sm font-medium text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <h2 className="text-lg font-semibold text-white">Infrastructure</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Provider', value: deploymentProvider },
                      { label: 'Target type', value: targetType },
                      { label: 'Region', value: infrastructure?.region || metadata?.target?.awsRegion || azureAciLocation || 'Pending' },
                      { label: 'Live URL', value: liveInfrastructureUrl || 'Pending' },
                      { label: 'Deploy state', value: infrastructure?.deployState || 'Pending' },
                      { label: 'Container name', value: containerName },
                      { label: 'Container port', value: containerPort },
                      { label: 'Instance type', value: infrastructure?.ec2?.instanceType || metadata?.target?.instanceType || 'Pending' },
                      { label: 'Public IP', value: ec2PublicIp },
                      { label: 'Private IP', value: ec2PrivateIp },
                      { label: 'ECR repository', value: ecrRepository },
                      { label: 'ECR repository URI', value: ecrRepositoryUri },
                      { label: 'ACR repository', value: azureAcrRepository },
                      { label: 'ACR login server', value: azureAcrLoginServer },
                      { label: 'ACR image URI', value: azureAcrImageUri },
                      { label: 'ACR image name', value: azureAcrImageName },
                      { label: 'ACI container group', value: azureAciContainerGroup },
                      { label: 'ACI resource group', value: azureAciResourceGroup },
                      { label: 'ACI location', value: azureAciLocation },
                      { label: 'ACI FQDN / IP', value: azureAciFqdn },
                      { label: 'ACI status', value: azureAciStatus },
                      { label: 'ACI CPU', value: azureAciCpu },
                      { label: 'ACI memory (GB)', value: azureAciMemory },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{item.label}</div>
                        <div className="mt-2 break-all text-sm font-medium text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {deployment.error?.message && (
                  <div className="min-w-0 rounded-3xl border border-rose-400/20 bg-rose-500/10 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                    <div className="flex items-center gap-2 text-rose-200">
                      <AlertTriangle className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Failure details</h2>
                    </div>
                    <p className="mt-3 text-sm text-rose-100/85">{deployment.error.message}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="mt-8 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-10 text-center text-white/60">
              Deployment not found.
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
