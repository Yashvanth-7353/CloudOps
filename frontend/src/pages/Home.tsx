import { motion } from 'framer-motion';
import { Hero, Features } from '@/components/sections';
import { Layout } from '@/components/layout';
import { ArrowRight } from 'lucide-react';

/**
 * Home Page
 * Landing page with hero section and feature overview
 */

export default function HomePage() {
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
              { number: '5000+', label: 'Deployments Monthly' },
              { number: '99.9%', label: 'Platform Uptime' },
              { number: '500+', label: 'Active Users' },
              { number: '< 2min', label: 'Deploy Time' },
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
                <div className="text-text-secondary mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
