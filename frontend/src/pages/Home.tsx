import { motion } from 'framer-motion';
import { Hero, Features } from '@/components/sections';
import { Layout } from '@/components/layout';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/interceptors';

/**
 * Home Page
 * Landing page with hero section and feature overview
 * Shows login page if not authenticated
 */

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/api/analytics/dashboard');
        if (!mounted) return;
        if (res?.data?.success && res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      } catch (e) {
        // ignore - keep demo values
      }
    })();
    return () => { mounted = false; };
  }, []);

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#06070f] to-[#0b1020] text-white">
        <div className="max-w-full mx-auto min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
            {/* Left: Illustration */}
            <div className="lg:col-span-7 relative flex items-center justify-center p-8 order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#061025] via-[#0b1a2b] to-transparent opacity-60" />
              <div className="relative z-10 max-w-4xl w-full">
                <div className="mb-6">
                  <motion.h1
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    Deploy to AWS without
                    <br /> DevOps complexity.
                  </motion.h1>
                  <motion.p className="mt-4 text-white/70 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    CloudOps automates builds, deployments, and monitoring so your team can focus on product.
                  </motion.p>
                </div>

                <div className="mt-8">
                  <CloudIllustration />
                </div>

                {/* Floating devops elements */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute right-8 top-12 hidden md:block">
                  <div className="p-3 rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg"> </div>
                </motion.div>
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="lg:col-span-5 flex items-center justify-center p-8 order-1 lg:order-2">
              <div className="w-full max-w-lg">
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
                  <div className="mb-6 text-center">
                    <div className="text-sm text-white/60">Welcome to</div>
                    <div className="text-2xl font-bold">CloudOps</div>
                    <div className="text-sm text-white/60">Secure DevOps automation for teams</div>
                  </div>

                  <LoginCard />

                  <div className="mt-6 text-center text-xs text-white/50">
                    By signing in you agree to our Terms and that you have read our Privacy Policy.
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, show the dashboard/home content
  return (
    <Layout showNavbar={true}>
      {/* Hero Section */}
      <Hero />

      {/* Features Section - Bento Grid */}
      <Features />

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative backdrop-blur-md bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 rounded-2xl p-8 md:p-16 text-center overflow-hidden"
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 pointer-events-none animate-gradient-rotate" />

            <div className="relative z-10">
              <h3 className="text-2xl md:text-4xl font-bold text-text-primary mb-4">
                Ready to Deploy Faster?
              </h3>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                Join hundreds of developers and start deploying to AWS in minutes, not hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-surface-glass/50 backdrop-blur-md border-2 border-border hover:border-accent text-text-primary rounded-lg font-semibold transition-all duration-300"
                >
                  Schedule Demo
                </motion.button>
              </div>

              <p className="text-sm text-text-secondary mt-6">
                No credit card required. Free tier includes unlimited deployments.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: metrics ? `${metrics.monthlyDeployments}` : '5000+', label: 'Deployments Monthly' },
              { number: metrics ? `${metrics.uptime}` : '99.9%', label: 'Platform Uptime' },
              { number: metrics ? `${metrics.activeUsers}` : '500+', label: 'Active Users' },
              { number: metrics && metrics.avgDeployTimeMs ? `${Math.round((metrics.avgDeployTimeMs||0)/1000)}s` : '< 2min', label: 'Deploy Time' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <p className="text-text-secondary mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
