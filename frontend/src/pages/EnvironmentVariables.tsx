import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Loader2, RefreshCw, Search, Eye, EyeOff, Copy, MoreHorizontal } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { useToast } from '@/components/ui/ToastProvider';
import { projectService, deploymentService } from '@/services/auth-service';

type EnvItem = {
  key?: string;
  value?: string;
};

type ProjectRecord = {
  _id?: string;
  repositoryName?: string;
  repositoryUrl?: string;
  repositoryOwner?: string;
  environmentVariables?: EnvItem[];
  updatedAt?: string;
  createdAt?: string;
};

type ProjectVariable = {
  key: string;
  updatedAt?: string;
};

type ProjectEnvGroup = {
  projectName: string;
  updatedAt?: string;
  variables: ProjectVariable[];
};

const DEFAULT_SCOPE = 'Production, Preview, and Development';
const INITIAL_VISIBLE_VARIABLES = 6;

const deriveProjectName = (deployment: DeploymentRecord) => {
  if (deployment.repositoryName?.trim()) return deployment.repositoryName.trim();

  const rawUrl = deployment.repositoryUrl?.trim();
  if (!rawUrl) return 'Unnamed project';

  const parts = rawUrl.replace(/\.git$/i, '').split('/').filter(Boolean);
  return parts[parts.length - 1] || 'Unnamed project';
};

const normalizeDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatShortDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

export default function EnvironmentVariablesPage() {
  const { notify } = useToast();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [selectedVar, setSelectedVar] = useState<{
    projectId: string;
    projectName: string;
    key: string;
    updatedAt?: string;
  } | null>(null);
  const [occurrences, setOccurrences] = useState<Array<{
    source: 'project' | 'deployment';
    id?: string;
    projectId?: string | null;
    repositoryName?: string | null;
    repositoryUrl?: string | null;
    value?: string | null;
  }>>([]);
  const [selectedOccurrenceIndex, setSelectedOccurrenceIndex] = useState(0);
  const [revealValue, setRevealValue] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchDeploymentData = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await projectService.getAll();
      const raw = response?.data?.projects || response?.data?.data || response?.data || [];
      setProjects(Array.isArray(raw) ? raw : []);
      // Also fetch recent deployments to pick up env vars stored on deployments
      try {
        const depRes = await deploymentService.getAll({ limit: 500 });
        const depRaw = depRes?.data?.data || depRes?.data || [];
        setDeployments(Array.isArray(depRaw) ? depRaw : []);
      } catch (e) {
        setDeployments([]);
      }
      setError(null);
    } catch (fetchError: any) {
      setError(fetchError?.response?.data?.error || fetchError?.message || 'Unable to load environment variables.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchDeploymentData();
  }, []);

  // When a variable is selected, derive its current value from deployments
  useEffect(() => {
    if (!selectedVar) {
      setSelectedValue(null);
      setRevealValue(false);
      return;
    }
    const { projectId, key, projectName } = selectedVar;

    // Build occurrences: find all projects and deployments that contain this key
    const occs: Array<any> = [];

    for (const p of projects) {
      const envVars = Array.isArray(p.environmentVariables) ? p.environmentVariables : [];
      const match = envVars.find((v) => v?.key === key);
      if (match) {
        occs.push({
          source: 'project',
          id: String(p._id),
          projectId: String(p._id),
          repositoryName: p.repositoryName || null,
          repositoryUrl: p.repositoryUrl || null,
          value: match.value ?? null,
        });
      }
    }

    for (const d of deployments) {
      const envVars = Array.isArray(d.environmentVariables) ? d.environmentVariables : [];
      const match = envVars.find((v) => v?.key === key);
      if (match) {
        occs.push({
          source: 'deployment',
          id: String(d._id || d.deploymentId || ''),
          projectId: d.projectId || null,
          repositoryName: d.repositoryName || null,
          repositoryUrl: d.repositoryUrl || null,
          value: match.value ?? null,
        });
      }
    }

    setOccurrences(occs);
    const chosen = occs.length ? occs[0] : null;
    setSelectedOccurrenceIndex(0);
    const valueToEdit = chosen?.value ?? null;
    setSelectedValue(valueToEdit);
    setRevealValue(false);
    setEditingValue(valueToEdit ?? '');
  }, [selectedVar, projects, deployments]);

  useEffect(() => {
    if (!selectedVar) {
      setSelectedProjectId(null);
      return;
    }

    setSelectedProjectId(selectedVar.projectId);
  }, [selectedVar]);

  const groupedProjects = useMemo<ProjectEnvGroup[]>(() => {
    const groupMap = new Map<string, { updatedAt?: string; variableMap: Map<string, ProjectVariable> }>();

    for (const project of projects) {
      const envVars = Array.isArray(project.environmentVariables) ? project.environmentVariables : [];

      // Merge env vars from related deployments (include failed and success)
      const relatedDeployments = deployments.filter((d) => {
        if (!d) return false;
        if (d.projectId && project._id && String(d.projectId) === String(project._id)) return true;
        // fallback match by repository name/url
        const repoNameMatch = project.repositoryName && d.repositoryName && project.repositoryName === d.repositoryName;
        const repoUrlMatch = project.repositoryUrl && d.repositoryUrl && project.repositoryUrl === d.repositoryUrl;
        return repoNameMatch || repoUrlMatch;
      });

      for (const d of relatedDeployments) {
        const deployEnv = Array.isArray(d.environmentVariables) ? d.environmentVariables : [];
        if (deployEnv.length) {
          // append deployment env vars if they are not already present
          for (const ev of deployEnv) {
            if (!ev || !ev.key) continue;
            const existsInProject = envVars.some((p) => p?.key === ev.key);
            if (!existsInProject) envVars.push({ key: ev.key, value: ev.value });
          }
        }
      }
      if (!envVars.length) continue;

      const projectName = deriveProjectName(project);
      if (!groupMap.has(projectName)) {
        groupMap.set(projectName, { updatedAt: project.updatedAt || project.createdAt, variableMap: new Map() });
      }

      const currentGroup = groupMap.get(projectName);
      if (!currentGroup) continue;

      const currentUpdated = normalizeDate(currentGroup.updatedAt);
      const nextUpdated = normalizeDate(project.updatedAt || project.createdAt);
      if (!currentUpdated || (nextUpdated && nextUpdated > currentUpdated)) {
        currentGroup.updatedAt = project.updatedAt || project.createdAt;
      }

      for (const envVar of envVars) {
        const rawKey = envVar?.key?.trim();
        if (!rawKey) continue;

        const existing = currentGroup.variableMap.get(rawKey);
        const candidateUpdatedAt = project.updatedAt || project.createdAt;

        if (!existing) {
          currentGroup.variableMap.set(rawKey, {
            key: rawKey,
            updatedAt: candidateUpdatedAt,
          });
          continue;
        }

        const existingDate = normalizeDate(existing.updatedAt);
        const candidateDate = normalizeDate(candidateUpdatedAt);
        if (!existingDate || (candidateDate && candidateDate > existingDate)) {
          existing.updatedAt = candidateUpdatedAt;
        }
      }
    }

    return Array.from(groupMap.entries())
      .map(([projectName, group]) => ({
        projectName,
        updatedAt: group.updatedAt,
        variables: Array.from(group.variableMap.values()).sort((a, b) => a.key.localeCompare(b.key)),
      }))
      .sort((a, b) => a.projectName.localeCompare(b.projectName));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return groupedProjects;

    return groupedProjects
      .map((project) => {
        const projectMatches = project.projectName.toLowerCase().includes(normalizedQuery);
        if (projectMatches) return project;

        const matchedVariables = project.variables.filter((item) => {
          const keyMatch = item.key.toLowerCase().includes(normalizedQuery);
          const valueMatch = (() => {
            // try to find value from projects/deployments for this key
            const key = item.key;
            const foundInProject = projects.find((p) => deriveProjectName(p) === project.projectName && Array.isArray(p.environmentVariables) && p.environmentVariables.some((v) => v?.key === key && String(v?.value || '').toLowerCase().includes(normalizedQuery)));
            if (foundInProject) return true;
            const foundInDeployment = deployments.some((d) => Array.isArray(d.environmentVariables) && d.environmentVariables.some((v) => v?.key === key && String(v?.value || '').toLowerCase().includes(normalizedQuery)));
            return foundInDeployment;
          })();
          return keyMatch || valueMatch;
        });
        return {
          ...project,
          variables: matchedVariables,
        };
      })
        .filter((project) => project.variables.length > 0 || project.projectName.toLowerCase().includes(normalizedQuery));
  }, [groupedProjects, query]);

  const totalVariableCount = useMemo(
    () => groupedProjects.reduce((count, project) => count + project.variables.length, 0),
    [groupedProjects]
  );

  const selectedRepoDisplay = useMemo(() => {
    if (!selectedVar) return null;
    const { projectId, projectName } = selectedVar;

    // First try projects
    const project = projects.find((p) => String(p._id) === String(projectId) || deriveProjectName(p) === projectName);
    if (project) return project.repositoryName || project.repositoryUrl || null;

    // Then try deployments
    const dep = deployments.find((d) => {
      if (!d) return false;
      if (d.projectId && projectId && String(d.projectId) === String(projectId)) return true;
      const repoNameMatch = projectName && d.repositoryName && projectName === d.repositoryName;
      const repoUrlMatch = project && d.repositoryUrl && project.repositoryUrl === d.repositoryUrl;
      return repoNameMatch || repoUrlMatch;
    });
    if (dep) return dep.repositoryName || dep.repositoryUrl || null;

    return null;
  }, [selectedVar, projects, deployments]);

  return (
    <DashboardLayout>
      <main className="space-y-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/60">
                <Database className="h-3.5 w-3.5" />
                Environment Variables
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Project environment variables</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/60">
                View all environment variable keys grouped by project. Keys are collected from deployment records and shown without attention tags.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchDeploymentData(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </motion.div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[rgba(8,12,20,0.75)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="text-xs uppercase tracking-[0.24em] text-white/45">Projects</div>
              <div className="mt-3 text-3xl font-semibold text-white">{groupedProjects.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[rgba(8,12,20,0.75)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="text-xs uppercase tracking-[0.24em] text-white/45">Variables</div>
              <div className="mt-3 text-3xl font-semibold text-cyan-300">{totalVariableCount}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[rgba(8,12,20,0.75)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="text-xs uppercase tracking-[0.24em] text-white/45">Data Source</div>
              <div className="mt-3 text-lg font-semibold text-white/90">Projects</div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="relative w-full lg:max-w-lg">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects or environment keys"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 grid gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-10 text-center text-white/60">
              No environment variables found for your projects.
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {filteredProjects.map((project) => {
                const isExpanded = Boolean(expandedProjects[project.projectName]);
                const visibleVariables = isExpanded
                  ? project.variables
                  : project.variables.slice(0, INITIAL_VISIBLE_VARIABLES);

                return (
                  <motion.section
                    key={project.projectName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-white">{project.projectName}</h2>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                          {project.variables.length}
                        </span>
                      </div>
                      <div className="text-sm text-white/50">Updated {formatShortDate(project.updatedAt)}</div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/8">
                      <table className="w-full min-w-[760px]">
                        <thead>
                          <tr className="bg-white/5 text-left text-xs uppercase tracking-[0.18em] text-white/45">
                            <th className="px-4 py-3">Variable</th>
                            <th className="px-4 py-3">Environment</th>
                            <th className="px-4 py-3">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleVariables.map((variable) => (
                            <tr
                              key={`${project.projectName}:${variable.key}`}
                              className="border-t border-white/6 text-sm text-white/85 hover:bg-white/3 cursor-pointer"
                              onClick={() => {
                                const matchingProject = projects.find((item) => deriveProjectName(item) === project.projectName);
                                setSelectedVar({
                                  projectId: String(matchingProject?._id || ''),
                                  projectName: project.projectName,
                                  key: variable.key!,
                                  updatedAt: variable.updatedAt,
                                });
                              }}
                            >
                              <td className="px-4 py-3 font-mono text-[13px] text-cyan-200">{variable.key}</td>
                              <td className="px-4 py-3 text-white/70">{DEFAULT_SCOPE}</td>
                              <td className="px-4 py-3 text-white/70">{formatShortDate(variable.updatedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {project.variables.length > INITIAL_VISIBLE_VARIABLES && (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedProjects((prev) => ({
                              ...prev,
                              [project.projectName]: !isExpanded,
                            }))
                          }
                          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                        >
                          {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                      </div>
                    )}
                  </motion.section>
                );
              })}
            </div>
          )}
        </div>
      </main>
  
      {/* Variable detail modal */}
      {selectedVar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedVar(null)} />
          <div className="relative z-60 w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
            <div className="rounded-2xl bg-[rgba(8,12,20,0.92)] border border-white/10 p-6 shadow-xl space-y-4">
              {/* Repo name */}
              {selectedRepoDisplay && (
                <div className="text-xs text-white/40">{selectedRepoDisplay}</div>
              )}

              {/* Env var key */}
              <div className="text-sm font-mono text-cyan-200">{selectedVar.key}</div>

              {/* Value input with actions */}
              <div>
                <label className="block text-xs text-white/60 mb-2">Value</label>
                <div className="flex items-center gap-2">
                  <input
                    type={revealValue ? 'text' : 'password'}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 rounded-lg border border-white/8 bg-white/5 px-4 py-3 font-mono text-sm text-white/80"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealValue((v) => !v)}
                    className="p-2 rounded-lg border border-white/8 bg-white/5 text-white/80"
                    aria-label="Toggle reveal value"
                  >
                    {revealValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (!editingValue) return;
                        if (navigator.clipboard && window.isSecureContext) {
                          await navigator.clipboard.writeText(String(editingValue));
                        } else {
                          const ta = document.createElement('textarea');
                          ta.value = String(editingValue);
                          ta.style.position = 'fixed';
                          ta.style.left = '-9999px';
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand('copy');
                          document.body.removeChild(ta);
                        }
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                        try { notify({ title: 'Copied', message: 'Value copied to clipboard', variant: 'success' }); } catch (e) { /* no-op */ }
                      } catch (err) {
                        console.error('Copy failed', err);
                        try { notify({ title: 'Copy failed', message: 'Unable to copy value', variant: 'error' }); } catch (e) { /* no-op */ }
                      }
                    }}
                    className="p-2 rounded-lg border border-white/8 bg-white/5 text-white/80"
                    aria-label="Copy value"
                    title={copied ? 'Copied' : 'Copy value'}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedVar) return;
                      const projectToUpdate = selectedProjectId;
                      if (!projectToUpdate) {
                        try { notify({ title: 'Save not available', message: 'Unable to determine project for this variable. Please refresh and try again.', variant: 'warning' }); } catch (e) { /* no-op */ }
                        return;
                      }

                      try {
                        const payload = { key: selectedVar.key, value: editingValue };
                        await projectService.update(projectToUpdate, payload);
                        await fetchDeploymentData();
                        setSelectedValue(editingValue);
                        setSelectedVar(null);
                        setEditingValue('');
                        setSelectedProjectId(null);
                        try { notify({ title: 'Saved', message: 'Environment variable updated', variant: 'success' }); } catch (e) { /* no-op */ }
                      } catch (err) {
                        console.error('Failed to save env var', err);
                        try { notify({ title: 'Save failed', message: 'Unable to save environment variable', variant: 'error' }); } catch (e) { /* no-op */ }
                      }
                    }}
                    className="rounded-lg px-4 py-2 bg-cyan-500/15 text-cyan-100"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
