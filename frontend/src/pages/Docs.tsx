import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { BookOpen, Sparkles, ShieldCheck, Cloud, BarChart3, Rocket } from 'lucide-react';

const docsSections = [
  {
    title: 'Quick Start',
    description: 'Get CloudOps installed, connected to your repository, and deploying in minutes with a guide that walks through each step.',
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Deployment Pipeline',
    description: 'Learn how CloudOps automates build, test, and deploy stages for AWS infrastructure with pipelines and rollbacks.',
    icon: <Rocket className="w-6 h-6 text-accent" />,
  },
  {
    title: 'Security',
    description: 'See secure auth, GitHub integration, secrets management, and role-based access control for teams.',
    icon: <ShieldCheck className="w-6 h-6 text-success" />,
  },
  {
    title: 'Monitoring',
    description: 'Use analytics, logs, alerts, and cost insights to keep your applications healthy and optimized.',
    icon: <BarChart3 className="w-6 h-6 text-warning" />,
  },
  {
    title: 'Cloud Integrations',
    description: 'Connect AWS, containers, and third-party services using established CloudOps integrations.',
    icon: <Cloud className="w-6 h-6 text-cyan-300" />,
  },
  {
    title: 'API Reference',
    description: 'Consume CloudOps API endpoints for deployments, repositories, and analytics from your CI/CD workflows.',
    icon: <BookOpen className="w-6 h-6 text-white" />,
  },
];

export default function DocsPage() {
  return (
    <Layout showNavbar>
      <main className="space-y-10 py-24">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-primary">Documentation</p>
                <h1 className="text-4xl sm:text-5xl font-semibold text-white">CloudOps Docs</h1>
                <p className="text-white/70 leading-8">
                  Everything you need to understand CloudOps. From setup to deployments, from GitHub integration to analytics and observability.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="#getting-started" className="btn btn-secondary">
                  Getting Started
                </a>
                <a href="#deployment-pipeline" className="btn btn-secondary">
                  Deployment Guide
                </a>
                <a href="#monitoring" className="btn btn-secondary">
                  Monitoring
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-3">
          {docsSections.map((section) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-elevated rounded-[1.5rem] border border-white/10 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.2)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 mb-5">
                {section.icon}
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">{section.title}</h2>
              <p className="text-white/70 leading-7">{section.description}</p>
            </motion.article>
          ))}
        </section>

        <section id="getting-started" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">Getting Started</h2>
                <p className="text-white/70 mt-2 max-w-2xl">
                  Follow the first steps to connect your GitHub repository, configure your AWS environment, and run your first deployment.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
                <Sparkles className="w-4 h-4" /> Quick start guide
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Connect repo',
                  detail: 'Authorize CloudOps with GitHub and select the repository you want to deploy.',
                },
                {
                  step: '02',
                  title: 'Configure pipeline',
                  detail: 'Set up build commands, environments, and AWS target configuration.',
                },
                {
                  step: '03',
                  title: 'Deploy live',
                  detail: 'Trigger your first deployment and monitor status from the dashboard.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-3xl border border-white/10 p-6 bg-[rgba(255,255,255,0.03)]">
                  <div className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Step {item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 leading-7">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="deployment-pipeline" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <h2 className="text-3xl font-semibold text-white">Deployment Pipeline</h2>
            <p className="text-white/70 mt-4 leading-8">
              CloudOps runs your build, test, and deploy stages automatically. Define your environment, choose branches, and let CloudOps handle releases with rollback safety.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Build container images or serverless artifacts using your repo settings.',
                'Run pre-deploy validation and tests before production updates.',
                'Deploy safely to AWS with environment promotion and monitoring.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-white/75">
                  <span className="mt-1 text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <h2 className="text-3xl font-semibold text-white">Integrations</h2>
            <p className="text-white/70 mt-4 leading-8">
              Use GitHub, AWS, container registries, and third-party services to create a deployment pipeline that fits your team’s stack.
            </p>
            <div className="mt-8 grid gap-3">
              {['GitHub OAuth', 'AWS IAM & Secrets', 'Docker & Container Registry', 'Monitoring & Alerts'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="monitoring" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-white">Monitoring & Analytics</h2>
              <p className="text-white/70 leading-8">
                Track deployment health, CPU/memory usage, logs, and cost trends across your cloud infrastructure. Alerts keep your team ahead of issues.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-black">1</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Usage dashboards</h3>
                  <p className="text-white/70">Visualize deployment metrics and server health.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-white/70">Performance tracking</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-white/70">Cost optimization</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
