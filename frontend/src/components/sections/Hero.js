import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Github, Play, Cloud, ArrowRight, Zap } from 'lucide-react';
import './Hero.css';
/**
 * Hero Section Component
 * Futuristic DevOps landing hero with animated deployment pipeline
 */
// Particle animation component
const FloatingParticle = ({ delay, duration, x, y }) => (_jsx(motion.div, { className: "absolute w-1 h-1 bg-accent rounded-full opacity-60", animate: {
        y: [0, -100, 0],
        x: [0, Math.sin(delay) * 50, 0],
        opacity: [0.2, 0.8, 0.2],
    }, transition: {
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
    }, style: {
        left: `${x}%`,
        top: `${y}%`,
        filter: 'blur(0.5px)',
    } }));
// Animated pipeline stage
const PipelineStage = ({ icon: Icon, label, delay, isActive, }) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay, duration: 0.5 }, className: "flex flex-col items-center gap-2", children: [_jsx(motion.div, { className: `w-16 h-16 rounded-lg flex items-center justify-center backdrop-blur-md border-2 transition-all ${isActive
                ? 'bg-primary/20 border-primary shadow-lg shadow-primary/50'
                : 'bg-surface-glass/50 border-border hover:border-primary/50'}`, animate: isActive ? { scale: 1.1 } : { scale: 1 }, transition: { duration: 0.3 }, whileHover: { scale: 1.05 }, children: _jsx(motion.div, { animate: isActive ? { rotate: 360 } : { rotate: 0 }, transition: { duration: isActive ? 2 : 0.3, repeat: isActive ? Infinity : 0 }, children: Icon }) }), _jsx("p", { className: "text-sm font-medium text-text-secondary", children: label })] }));
// Animated connector arrow
const ConnectorArrow = ({ delay }) => (_jsx(motion.div, { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { delay }, className: "hidden md:flex items-center", children: _jsx(motion.div, { animate: { x: [0, 6, 0] }, transition: { duration: 1.5, repeat: Infinity, delay }, children: _jsx(ArrowRight, { className: "w-6 h-6 text-accent" }) }) }));
// Main Hero Component
export default function Hero() {
    // Pipeline animation states
    const stages = [
        { label: 'GitHub', icon: _jsx(Github, { className: "w-8 h-8 text-accent" }) },
        { label: 'Docker Build', icon: _jsx(Cloud, { className: "w-8 h-8 text-primary" }) },
        { label: 'Deploy to AWS', icon: _jsx(Zap, { className: "w-8 h-8 text-accent" }) },
        { label: 'Live Website', icon: _jsx(Play, { className: "w-8 h-8 text-primary" }) },
    ];
    // Particles array
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        x: Math.random() * 100,
        y: Math.random() * 60,
    }));
    return (_jsxs("section", { className: "hero-section relative min-h-screen flex items-center overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 -z-10", children: [_jsx("div", { className: "absolute inset-0 hero-grid opacity-30" }), _jsx("div", { className: "absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse" }), _jsx("div", { className: "absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-40 animate-pulse", style: { animationDelay: '1s' } }), _jsx("div", { className: "absolute bottom-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 animate-pulse", style: { animationDelay: '2s' } }), particles.map((particle) => (_jsx(FloatingParticle, { delay: particle.delay, duration: particle.duration, x: particle.x, y: particle.y }, particle.id)))] }), _jsx("div", { className: "relative z-10 w-full px-4 md:px-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "flex justify-center mb-8", children: _jsxs("div", { className: "px-4 py-2 rounded-full backdrop-blur-md bg-primary/10 border border-primary/30 text-sm font-medium text-primary flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-accent rounded-full animate-pulse" }), "Now in Open Beta"] }) }), _jsxs(motion.h1, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 }, className: "hero-headline text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6 leading-tight", children: [_jsx("span", { className: "bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent", children: "Deploy Apps to AWS" }), _jsx("br", {}), _jsx("span", { className: "text-text-primary", children: "in One Click" })] }), _jsx(motion.p, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, className: "text-xl md:text-2xl text-text-secondary text-center mb-12 max-w-3xl mx-auto", children: "CloudOps automates Docker builds, cloud deployments, monitoring, and scaling for developers and MSMEs." }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.3 }, className: "flex flex-col sm:flex-row gap-4 justify-center mb-20", children: [_jsxs(motion.button, { whileHover: { scale: 1.05, boxShadow: '0 20px 40px rgba(108, 99, 255, 0.3)' }, whileTap: { scale: 0.98 }, className: "px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300", children: [_jsx(Github, { className: "w-5 h-5" }), "Connect GitHub"] }), _jsxs(motion.button, { whileHover: { scale: 1.05, borderColor: 'rgba(0, 212, 255, 1)' }, whileTap: { scale: 0.98 }, className: "px-8 py-4 bg-surface-glass/50 backdrop-blur-md border-2 border-border hover:border-accent text-text-primary rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300", children: [_jsx(Play, { className: "w-5 h-5" }), "Watch Demo"] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.4 }, className: "mb-16", children: [_jsxs("div", { className: "relative backdrop-blur-md bg-surface-glass/30 rounded-2xl border border-border/50 p-8 md:p-12 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 pointer-events-none animate-gradient-rotate" }), _jsx("div", { className: "relative z-10", children: _jsx("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2", children: stages.map((stage, index) => (_jsxs("div", { className: "flex items-center gap-4 w-full md:w-auto", children: [_jsx(PipelineStage, { icon: stage.icon, label: stage.label, delay: 0.5 + index * 0.2, isActive: index < 2 }), index < stages.length - 1 && _jsx(ConnectorArrow, { delay: 0.7 + index * 0.2 })] }, stage.label))) }) })] }), _jsx("div", { className: "grid grid-cols-3 md:grid-cols-3 gap-4 mt-8", children: [
                                        { label: 'Deployments', value: '1000+', icon: '🚀' },
                                        { label: 'Uptime', value: '99.9%', icon: '⭐' },
                                        { label: 'Users', value: '500+', icon: '👥' },
                                    ].map((stat, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 1 + index * 0.1 }, className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-primary", children: stat.value }), _jsx("div", { className: "text-sm text-text-secondary", children: stat.label })] }, stat.label))) })] }), _jsx(motion.div, { animate: { y: [0, 10, 0] }, transition: { duration: 2, repeat: Infinity }, className: "flex justify-center mt-12", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("p", { className: "text-sm text-text-secondary font-medium", children: "Scroll to explore" }), _jsx("div", { className: "w-6 h-10 border-2 border-text-secondary rounded-full flex justify-center", children: _jsx(motion.div, { animate: { y: [0, 6, 0] }, transition: { duration: 2, repeat: Infinity }, className: "w-1 h-2 bg-accent rounded-full" }) })] }) })] }) })] }));
}
