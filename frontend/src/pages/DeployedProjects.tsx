import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { ExternalLink, FolderGit2 } from 'lucide-react';
import { axiosClient } from '@/services/api/axios-client';

interface Project {
  _id: string;
  repositoryName: string;
  repositoryUrl: string;
  status: 'connected' | 'deploying' | 'active' | 'failed';
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  active:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  connected:  'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  deploying:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  failed:     'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export default function DeployedProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosClient.get('/api/projects')
      .then((res) => setProjects(res.data.projects || []))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <main className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-1">Deployed Projects</h1>
          <p className="text-white/60">All repositories connected to your CloudOps workspace.</p>
        </motion.div>

        {loading && (
          <div className="text-white/50">Loading projects…</div>
        )}

        {error && (
          <div className="text-rose-400">{error}</div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center text-white/50">
            No projects found. Connect a repository from the Dashboard.
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-cyan-300 shrink-0">
                      <FolderGit2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{project.repositoryName}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status] ?? STATUS_STYLES.connected}`}>
                    {project.status}
                  </span>
                </div>

                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-cyan-400/80 hover:text-cyan-300 transition-colors truncate"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {project.repositoryUrl}
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
