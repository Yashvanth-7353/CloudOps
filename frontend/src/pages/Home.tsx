import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { Hero, Features, HowItWorks } from '@/components/sections';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <Hero />
      <HowItWorks />
      <Features />

      {/* CTA */}
      <section className="border-t border-border px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12"
        >
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Ready to deploy?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Connect your GitHub account and ship your first project in under five minutes.
          </p>
          <Button size="lg" className="mt-6 gap-2" onClick={() => navigate('/login')}>
            <Github className="h-4 w-4" />
            Start with GitHub
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
}
