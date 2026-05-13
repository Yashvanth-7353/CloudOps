import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { motion } from 'framer-motion';

type DeployedProject = {
  id: string;
  name: string;
  fullName: string;
  language?: string | null;
  deployedAt?: string;
  liveUrl?: string;
};

const DEPLOYED_PROJECTS_KEY = 'cloudops_deployed_projects';

const DeployedProjectCard: React.FC<{ project: DeployedProject }> = ({ project }) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.16em] text-cyan-300/70">Live Project</div>
          <h3 className="mt-2 text-lg font-semibold text-white">{project.name}</h3>
          <p className="mt-1 text-sm text-white/60">{project.fullName}</p>
        </div>

        <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
          Deployed
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
        <span className="rounded-full bg-white/5 px-3 py-1">{project.language || 'Repository'}</span>
        <span className="rounded-full bg-white/5 px-3 py-1">{project.deployedAt ? new Date(project.deployedAt).toLocaleString() : 'Just now'}</span>
      </div>
    </>
  );

  if (project.liveUrl) {
    return (
      <motion.a
        layout
        whileHover={{ y: -4 }}
        href={project.liveUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open live project ${project.name}`}
        className="block rounded-2xl border border-white/10 bg-[rgba(12,16,26,0.72)] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)] transition hover:border-cyan-300/40"
      >
        {content}
        <div className="mt-4 text-xs text-cyan-200">Open live link in new tab</div>
      </motion.a>
    );
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-[rgba(12,16,26,0.72)] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]"
    >
      {content}
      <div className="mt-4 text-xs text-white/45">Live link unavailable</div>
    </motion.div>
  );
};

export default function LiveProjectsPage() {
  const [deployedProjects, setDeployedProjects] = useState<DeployedProject[]>([]);

  useEffect(() => {
    const loadProjects = () => {
      try {
        const raw = localStorage.getItem(DEPLOYED_PROJECTS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        setDeployedProjects(Array.isArray(parsed) ? parsed : []);
      } catch {
        setDeployedProjects([]);
      }
    };

    loadProjects();
    window.addEventListener('cloudops:deployed-projects-updated', loadProjects as EventListener);
    window.addEventListener('storage', loadProjects);

    return () => {
      window.removeEventListener('cloudops:deployed-projects-updated', loadProjects as EventListener);
      window.removeEventListener('storage', loadProjects);
    };
  }, []);

  return (
    <DashboardLayout>
      <main className="space-y-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">Live Projects</h1>
            <p className="text-text-secondary text-lg">Only deployed repositories are shown here.</p>
          </motion.div>

          {deployedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {deployedProjects.map((project) => (
                <DeployedProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-center text-text-secondary">
              No live project.
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
