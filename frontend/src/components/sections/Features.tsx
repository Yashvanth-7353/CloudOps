import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Container,
  Cloud,
  Activity,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import './Features.css';

/**
 * Feature Card Component
 * Displays individual feature with icon, title, and description
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
  size?: 'small' | 'medium' | 'large';
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient,
  delay = 0,
  size = 'medium',
}) => {
  return (
    <motion.div
      className={`feature-card feature-card-${size}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      style={{
        background: `linear-gradient(135deg, ${gradient})`,
      } as React.CSSProperties}
    >
      {/* Glassmorphism Background */}
      <div className="feature-card-glass" />

      {/* Gradient Border Overlay */}
      <div className={`feature-card-border ${gradient}`} />

      {/* Content */}
      <div className="feature-card-content">
        {/* Icon Container */}
        <motion.div
          className="feature-card-icon"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="feature-card-title">{title}</h3>

        {/* Description */}
        <p className="feature-card-description">{description}</p>

        {/* Hover Indicator */}
        <motion.div
          className="feature-card-arrow"
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </motion.div>
      </div>

      {/* Animated Glow Effect */}
      <div className="feature-card-glow" />
    </motion.div>
  );
};

/**
 * Features Section Component
 * Displays features in a Bento Grid layout with glassmorphism design
 */
const Features: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'One Click Deployment',
      description:
        'Deploy your applications to AWS with a single click. Automate the entire deployment pipeline from source code to production.',
      gradient: 'rgba(255, 153, 0, 0.2), rgba(255, 87, 34, 0.2)',
      size: 'large',
    },
    {
      icon: <Container className="w-8 h-8" />,
      title: 'Docker Powered Builds',
      description:
        'Containerize your applications automatically. Build optimized Docker images with zero configuration.',
      gradient: 'rgba(0, 174, 239, 0.2), rgba(0, 156, 255, 0.2)',
      size: 'medium',
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: 'AWS Cloud Deployment',
      description:
        'Deploy to AWS with advanced networking, security groups, and auto-scaling. Enterprise-grade infrastructure.',
      gradient: 'rgba(255, 153, 0, 0.2), rgba(255, 200, 0, 0.2)',
      size: 'medium',
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Real-Time Deployment Logs',
      description:
        'Monitor your deployments in real-time with live logs. Track every step of your pipeline with detailed insights.',
      gradient: 'rgba(76, 175, 80, 0.2), rgba(56, 142, 60, 0.2)',
      size: 'small',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Cloud Monitoring',
      description:
        'Real-time performance monitoring and alerts. Track CPU, memory, requests, and errors across your deployments.',
      gradient: 'rgba(156, 39, 176, 0.2), rgba(123, 31, 162, 0.2)',
      size: 'small',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Cost Analytics',
      description:
        'Track and optimize your cloud costs. Detailed breakdown of AWS spending and cost recommendations.',
      gradient: 'rgba(244, 67, 54, 0.2), rgba(229, 57, 53, 0.2)',
      size: 'large',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section className="features-section">
      {/* Background Elements */}
      <div className="features-background">
        <div className="features-glow-1" />
        <div className="features-glow-2" />
        <div className="features-grid-bg" />
      </div>

      {/* Content */}
      <div className="features-container">
        {/* Section Header */}
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="features-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            ✨ Powerful Features
          </motion.span>

          <h2 className="features-title">
            Everything You Need to
            <br />
            <span className="features-title-gradient">Deploy Faster</span>
          </h2>

          <p className="features-subtitle">
            CloudOps combines powerful tools and automation to make cloud
            deployments simple, secure, and cost-effective for teams of all
            sizes.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={index * 0.1}
              size={feature.size as 'small' | 'medium' | 'large'}
            />
          ))}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          className="features-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <p className="features-cta-text">
            Ready to revolutionize your deployment workflow?
          </p>
          <motion.button
            className="features-cta-button"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(108, 99, 255, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            Start Free Trial
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
