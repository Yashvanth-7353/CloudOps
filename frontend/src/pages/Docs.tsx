import { motion } from 'framer-motion';
import { BookOpen, Rocket, ShieldCheck, BarChart3, Cloud, Terminal } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const docsSections = [
  {
    title: 'Quick start',
    description: 'Install, connect GitHub, and run your first deployment in minutes.',
    icon: Rocket,
  },
  {
    title: 'Deployment pipeline',
    description: 'How CloudOps builds, pushes, and deploys to AWS and Azure.',
    icon: Terminal,
  },
  {
    title: 'Security',
    description: 'OAuth, secrets, and environment variable management.',
    icon: ShieldCheck,
  },
  {
    title: 'Monitoring',
    description: 'Analytics, logs, and deployment status tracking.',
    icon: BarChart3,
  },
  {
    title: 'Cloud integrations',
    description: 'AWS EC2/ECR and Azure ACI/ACR setup and configuration.',
    icon: Cloud,
  },
  {
    title: 'API reference',
    description: 'REST endpoints for deployments, repos, and analytics.',
    icon: BookOpen,
  },
];

export default function DocsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-primary">Documentation</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">CloudOps Docs</h1>
          <p className="mt-3 text-muted-foreground">
            Guides for setup, deployment, monitoring, and API usage.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docsSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full border-border bg-card transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{section.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
