import { motion } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const steps = ['Connect repo', 'Configure', 'Deploy', 'Monitor'];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 inline-block rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          GitHub → AWS / Azure in minutes
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          Deploy cloud apps
          <span className="block text-primary">without the complexity</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          CloudOps handles builds, deployments, environment variables, and monitoring — so you can ship from GitHub to production in a few clicks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button size="lg" className="gap-2 px-6" onClick={() => navigate('/login')}>
            <Github className="h-4 w-4" />
            Get started free
          </Button>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate('/docs')}>
            Read the docs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Mini pipeline preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-auto mt-14 max-w-lg"
        >
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  animate={{ scale: i === 1 ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {i + 1}
                </motion.div>
                <span className="text-center text-[10px] font-medium text-muted-foreground sm:text-xs">{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
