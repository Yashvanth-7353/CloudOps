import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import DeploymentPipelineVisualization from '@/components/deployments/DeploymentPipelineVisualization';

const DeploymentPipelineShowcase: React.FC = () => {
  const [showFullScreenLogs, setShowFullScreenLogs] = useState(false);

  const handleFullScreenLogs = () => {
    setShowFullScreenLogs(true);
  };

  const handleCloseFullScreen = () => {
    setShowFullScreenLogs(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                CloudOps <span className="text-cyan-400">Deployment Pipeline</span>
              </h1>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-full text-xs font-semibold">
                Demo
              </span>
            </div>
          </div>
        </motion.nav>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DeploymentPipelineVisualization
            deploymentId="deploy-prod-2024-001"
            deploymentName="Production Deployment v1.2.3"
            repoName="cloudops/main"
            repoUrl="https://github.com/yourusername/cloudops"
            branch="main"
            commitId="abc123def456gh789ij0klmnopqrstu"
            commitMessage="feat: Add deployment visualization and monitoring"
            deploymentUrl="https://app.cloudops.dev"
            status="in-progress"
            overallProgress={62}
            onRetry={() => console.log('Retry deployment')}
            onCancel={() => console.log('Cancel deployment')}
            onRollback={() => console.log('Rollback deployment')}
            onFullScreenLogs={handleFullScreenLogs}
            onClearLogs={() => console.log('Clear logs')}
          />
        </div>

        {/* Full Screen Logs Modal */}
        {showFullScreenLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseFullScreen}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Full Deployment Logs</h2>
                <button
                  onClick={handleCloseFullScreen}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Logs Content */}
              <div
                className="flex-1 overflow-y-auto font-mono text-sm bg-slate-900/50 p-6 space-y-2"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(15, 23, 42, 0.5) 2px, rgba(15, 23, 42, 0.5) 4px)',
                }}
              >
                {[
                  { time: '14:32:01', msg: 'Starting deployment pipeline...', level: 'info' },
                  { time: '14:32:02', msg: 'GitHub webhook received successfully', level: 'success' },
                  { time: '14:32:05', msg: 'Build environment initialized', level: 'info' },
                  { time: '14:32:12', msg: 'npm install completed: 245 packages installed', level: 'success' },
                  { time: '14:32:25', msg: 'Docker image built successfully: cloudops:v1.2.3', level: 'success' },
                  { time: '14:32:30', msg: 'Uploading image to AWS ECR...', level: 'info' },
                  { time: '14:32:45', msg: 'Image pushed to AWS ECR successfully', level: 'success' },
                  { time: '14:32:50', msg: 'Creating new ECS task definition...', level: 'info' },
                  { time: '14:33:02', msg: 'Updating ECS service with new task...', level: 'info' },
                  { time: '14:33:15', msg: 'Configuring NGINX routing...', level: 'info' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 hover:bg-slate-800/30 px-2 py-1 rounded">
                    <span className="text-slate-500 flex-shrink-0">[{log.time}]</span>
                    <span className={`${
                      log.level === 'success' ? 'text-emerald-400' :
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warning' ? 'text-amber-400' :
                      'text-cyan-400'
                    }`}>
                      {log.msg}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DeploymentPipelineShowcase;
