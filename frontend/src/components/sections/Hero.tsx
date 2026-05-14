import { motion } from 'framer-motion';
import { Github, Play, Cloud, ArrowRight, Zap } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

/**
 * Hero Section Component
 * Futuristic DevOps landing hero with animated deployment pipeline
 */

// Particle animation component
const FloatingParticle = ({ delay, duration, x, y }: {
  delay: number;
  duration: number;
  x: number;
  y: number;
}) => (
  <motion.div
    className="absolute w-1 h-1 bg-accent rounded-full opacity-60"
    animate={{
      y: [0, -100, 0],
      x: [0, Math.sin(delay) * 50, 0],
      opacity: [0.2, 0.8, 0.2],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
    style={{
      left: `${x}%`,
      top: `${y}%`,
      filter: 'blur(0.5px)',
    }}
  />
);

// Animated pipeline stage
const PipelineStage = ({
  icon: Icon,
  label,
  delay,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  delay: number;
  isActive: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="flex flex-col items-center gap-2"
  >
    <motion.div
      className={`w-16 h-16 rounded-lg flex items-center justify-center backdrop-blur-md border-2 transition-all ${
        isActive
          ? 'bg-primary/20 border-primary shadow-lg shadow-primary/50'
          : 'bg-surface-glass/50 border-border hover:border-primary/50'
      }`}
      animate={isActive ? { scale: 1.1 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={isActive ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: isActive ? 2 : 0.3, repeat: isActive ? Infinity : 0 }}
      >
        {Icon}
      </motion.div>
    </motion.div>
    <p className="text-sm font-medium text-text-secondary">{label}</p>
  </motion.div>
);

// Animated connector arrow
const ConnectorArrow = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="hidden md:flex items-center"
  >
    <motion.div
      animate={{ x: [0, 6, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, delay }}
    >
      <ArrowRight className="w-6 h-6 text-accent" />
    </motion.div>
  </motion.div>
);

// Main Hero Component
export default function Hero() {
  const navigate = useNavigate();
  // Pipeline animation states
  const stages = [
    { label: 'GitHub', icon: <Github className="w-8 h-8 text-accent" /> },
    { label: 'Docker Build', icon: <Cloud className="w-8 h-8 text-primary" /> },
    { label: 'Deploy to AWS', icon: <Zap className="w-8 h-8 text-accent" /> },
    { label: 'Live Website', icon: <Play className="w-8 h-8 text-primary" /> },
  ];

  // Particles array
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4,
    x: Math.random() * 100,
    y: Math.random() * 60,
  }));

  return (
    <section className="hero-section relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid opacity-30" />

        {/* Gradient overlays */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Floating particles */}
        {particles.map((particle) => (
          <FloatingParticle
            key={particle.id}
            delay={particle.delay}
            duration={particle.duration}
            x={particle.x}
            y={particle.y}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="px-4 py-2 rounded-full backdrop-blur-md bg-primary/10 border border-primary/30 text-sm font-medium text-primary flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Now in Open Beta
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-headline text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent">
              Deploy Apps to AWS
            </span>
            <br />
            <span className="text-text-primary">in One Click</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-text-secondary text-center mb-12 max-w-3xl mx-auto"
          >
            CloudOps automates Docker builds, cloud deployments, monitoring, and scaling for developers and MSMEs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            {/* Connect GitHub Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(108, 99, 255, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
              onClick={() => navigate('/login')}
            >
              <Github className="w-5 h-5" />
              Connect GitHub
            </motion.button>

            {/* Watch Demo Button */}
            <motion.button
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 212, 255, 1)' }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-surface-glass/50 backdrop-blur-md border-2 border-border hover:border-accent text-text-primary rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Animated Deployment Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            {/* Pipeline Container */}
            <div className="relative backdrop-blur-md bg-surface-glass/30 rounded-2xl border border-border/50 p-8 md:p-12 overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 pointer-events-none animate-gradient-rotate" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                  {stages.map((stage, index) => (
                    <div key={stage.label} className="flex items-center gap-4 w-full md:w-auto">
                      <PipelineStage
                        icon={stage.icon}
                        label={stage.label}
                        delay={0.5 + index * 0.2}
                        isActive={index < 2} // First two stages active for demo
                      />
                      {index < stages.length - 1 && <ConnectorArrow delay={0.7 + index * 0.2} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Deployments', value: '1000+', icon: '🚀' },
                { label: 'Uptime', value: '99.9%', icon: '⭐' },
                { label: 'Users', value: '500+', icon: '👥' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mt-12"
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-text-secondary font-medium">Scroll to explore</p>
              <div className="w-6 h-10 border-2 border-text-secondary rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-2 bg-accent rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
