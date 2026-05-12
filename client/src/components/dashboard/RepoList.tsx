import React, { useMemo, useState } from 'react';
import RepoCard, { Repo } from './RepoCard';
import { motion, AnimatePresence } from 'framer-motion';

const sampleRepos: Repo[] = [
  { id: '1', name: 'cloudops-frontend', framework: 'React', updatedAt: new Date().toISOString(), status: 'success' },
  { id: '2', name: 'api-gateway', framework: 'Express', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'deploying' },
  { id: '3', name: 'worker-cron', framework: 'Node', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), status: 'failed' },
  { id: '4', name: 'infra-templates', framework: 'Terraform', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'success' },
  { id: '5', name: 'mobile-app', framework: 'React Native', updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'idle' },
];

const frameworks = ['All', 'React', 'Express', 'Node', 'Terraform', 'React Native'];

const RepoList: React.FC = () => {
  const [query, setQuery] = useState('');
  const [framework, setFramework] = useState('All');
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
  const [repos, setRepos] = useState<Repo[]>(sampleRepos);

  const filtered = useMemo(() => {
    let list = repos.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
    if (framework !== 'All') list = list.filter(r => r.framework === framework);
    list = list.sort((a, b) => (sort === 'latest' ? +new Date(b.updatedAt) - +new Date(a.updatedAt) : +new Date(a.updatedAt) - +new Date(b.updatedAt)));
    return list;
  }, [repos, query, framework, sort]);

  const handleDeploy = (id: string) => {
    setRepos(prev => prev.map(r => (r.id === id ? { ...r, status: 'deploying' } : r)));
    // simulate deploy
    setTimeout(() => {
      setRepos(prev => prev.map(r => (r.id === id ? { ...r, status: 'success', updatedAt: new Date().toISOString() } : r)));
    }, 1800);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full md:w-72 px-3 py-2 rounded-lg bg-white/5 placeholder-white/50 text-white focus:outline-none"
          />

          <select value={framework} onChange={e => setFramework(e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 text-white">
            {frameworks.map(f => (
              <option key={f} value={f} className="bg-[#071026]">{f}</option>
            ))}
          </select>

          <select value={sort} onChange={e => setSort(e.target.value as any)} className="px-3 py-2 rounded-lg bg-white/5 text-white">
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-white/70">{filtered.length} repositories</div>
        </div>
      </div>

      <AnimatePresence>
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(repo => (
            <motion.div key={repo.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <RepoCard repo={repo} onDeploy={handleDeploy} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RepoList;
