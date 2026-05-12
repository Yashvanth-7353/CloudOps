import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import LiveProgressBar from '@/components/deployments/LiveProgressBar';
import TerminalStream from '@/components/deployments/TerminalStream';
import DeploymentTimeline from '@/components/deployments/DeploymentTimeline';
import DeployControls from '@/components/deployments/DeployControls';
import { DashboardLayout } from '@/components/layout';

const STEPS = ['Cloning Repository', 'Installing Dependencies', 'Building Docker Image', 'Pushing to AWS', 'Deployment Successful'];

export default function DeploymentLogsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [liveUrl, setLiveUrl] = useState('https://preview.cloudops.app/your-app');

  useEffect(() => {
    let timer: any;
    if (!running) return;

    // simulate progress
    timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 8;
        if (next >= 100) {
          // advance to next step
          setProgress(0);
          setCurrentStep(s => Math.min(STEPS.length - 1, s + 1));
          return 0;
        }
        return Math.min(100, next);
      });
    }, 700);

    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    // add logs based on currentStep
    if (!running) return;
    const lines = sampleLogsForStep(currentStep);
    let idx = 0;
    const id = setInterval(() => {
      if (idx >= lines.length) { clearInterval(id); return; }
      setLogs(prev => [...prev, lines[idx]]);
      idx += 1;
    }, 450);
    return () => clearInterval(id);
  }, [currentStep, running]);

  useEffect(() => {
    // finish when reach final step
    if (currentStep >= STEPS.length - 1) {
      setRunning(false);
      setProgress(100);
    }
  }, [currentStep]);

  const timeline = useMemo(() => STEPS.map((label, i) => ({ label, status: i < currentStep ? 'success' : i === currentStep && running ? 'running' : i === currentStep ? 'running' : 'pending' })), [currentStep, running]);

  const start = () => {
    setLogs([]);
    setCurrentStep(0);
    setProgress(0);
    setRunning(true);
  };

  const restart = () => {
    start();
  };

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-3xl font-bold text-white">Deployment Logs</h1>
            <p className="text-white/60">Real-time deployment activity and terminal output.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="backdrop-blur-md bg-[rgba(6,10,20,0.6)] border border-white/6 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-2/3">
                    <LiveProgressBar steps={STEPS} current={currentStep} progress={progress} />
                  </div>

                  <div className="flex items-center gap-3">
                    <DeployControls liveUrl={liveUrl} onCopy={() => { /* feedback could be added */ }} onRestart={restart} />
                    <button onClick={start} className="px-3 py-2 rounded-md bg-primary text-black font-semibold">Start</button>
                  </div>
                </div>

                <TerminalStream logs={logs} />
              </div>

              <div className="backdrop-blur-md bg-[rgba(6,10,20,0.5)] border border-white/6 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Deployment Timeline</h3>
                <DeploymentTimeline steps={timeline as any} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="backdrop-blur-md bg-[rgba(6,10,20,0.5)] border border-white/6 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
                <div className="text-sm text-white/70 mb-3">Live URL</div>
                <div className="flex items-center gap-2">
                  <a href={liveUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md bg-white/6 hover:bg-white/8 truncate">{liveUrl}</a>
                </div>
              </div>

              <div className="backdrop-blur-md bg-[rgba(6,10,20,0.5)] border border-white/6 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                <div className="text-sm text-white/70 mb-2">{running ? 'Running' : currentStep >= STEPS.length -1 ? 'Completed' : 'Idle'}</div>
                <div className="text-xs text-white/60">Last updated: {new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

function sampleLogsForStep(step: number) {
  switch (step) {
    case 0:
      return [
        `Cloning into 'repo'...`,
        `remote: Enumerating objects: 54, done.`,
        `Receiving objects: 100% (54/54), 12.34 KiB | 1.23 MiB/s, done.`,
      ];
    case 1:
      return [
        `Installing dependencies...`,
        `npm WARN deprecated package@1.0.0: critical fix available`,
        `added 234 packages in 12.3s`,
      ];
    case 2:
      return [
        `Building Docker image...`,
        `Step 1/12 : FROM node:18-alpine`,
        ` ---> Using cache`,
        `Successfully built abcdef123456`,
      ];
    case 3:
      return [
        `Pushing image to AWS ECR...`,
        `Login Succeeded`,
        `Pushed: 12/12 layers`,
      ];
    case 4:
      return [`Deployment complete. Application available at: ${'https://preview.cloudops.app/your-app'}`];
    default:
      return [`Working...`];
  }
}
