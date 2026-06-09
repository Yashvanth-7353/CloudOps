import { motion } from 'framer-motion';
import { Github, Settings, Rocket, Activity } from 'lucide-react';

const steps = [
  {
    icon: Github,
    step: '01',
    title: 'Connect GitHub',
    description: 'Sign in with GitHub and link the repositories you want to deploy.',
  },
  {
    icon: Settings,
    step: '02',
    title: 'Configure project',
    description: 'Choose AWS, Azure, or local. Set environment variables and deploy options.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Deploy',
    description: 'CloudOps builds your container, pushes to the cloud, and starts your service.',
  },
  {
    icon: Activity,
    step: '04',
    title: 'Monitor',
    description: 'View logs, check status, and track metrics from your dashboard.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Four steps from code to production.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+28px)] top-8 hidden h-px w-[calc(100%-56px)] bg-border lg:block" aria-hidden />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
