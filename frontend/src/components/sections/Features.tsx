import { motion } from 'framer-motion';
import {
  Rocket,
  Container,
  Cloud,
  Terminal,
  BarChart3,
  KeyRound,
} from 'lucide-react';

const features = [
  {
    icon: Rocket,
    title: 'One-click deploy',
    description: 'Push from GitHub and deploy to AWS or Azure with an automated pipeline.',
  },
  {
    icon: Container,
    title: 'Docker builds',
    description: 'Automatic containerization — no Dockerfile guesswork required.',
  },
  {
    icon: Cloud,
    title: 'Multi-cloud',
    description: 'Deploy to EC2, ECR, Azure ACI, or run locally from the same dashboard.',
  },
  {
    icon: Terminal,
    title: 'Live logs',
    description: 'Watch build and deploy output in real time as your app goes live.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track success rates, deploy times, and infrastructure health at a glance.',
  },
  {
    icon: KeyRound,
    title: 'Env variables',
    description: 'Manage secrets and config per project without touching the cloud console.',
  },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-border bg-secondary/40 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Everything you need to ship
          </h2>
          <p className="mt-3 text-muted-foreground">
            One platform for the full deployment lifecycle — from repo to running service.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
