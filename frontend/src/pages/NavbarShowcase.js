import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout';
import { ArrowRight, Zap, Shield, Gauge } from 'lucide-react';
const NavbarShowcase = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };
    const features = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Optimized for performance with smooth animations',
        },
        {
            icon: Shield,
            title: 'Secure',
            description: 'Built with security best practices in mind',
        },
        {
            icon: Gauge,
            title: 'Responsive',
            description: 'Perfect on desktop, tablet, and mobile devices',
        },
    ];
    return (_jsxs("div", { className: "w-full", children: [_jsx(Navbar, {}), _jsx("section", { className: "min-h-screen bg-gradient-to-b from-background via-surface to-background pt-32 pb-20", children: _jsxs(motion.div, { className: "container", variants: containerVariants, initial: "hidden", animate: "visible", children: [_jsxs(motion.div, { variants: itemVariants, className: "text-center mb-8", children: [_jsx("h1", { className: "text-5xl md:text-7xl font-bold mb-6 text-gradient", children: "CloudOps Navbar" }), _jsx("p", { className: "text-xl text-text-secondary max-w-2xl mx-auto", children: "Modern, responsive SaaS navbar built with React, Tailwind CSS, and Framer Motion. Scroll down to see the blur effect in action." })] }), _jsxs(motion.div, { variants: itemVariants, className: "flex justify-center gap-md", children: [_jsx("button", { className: "btn btn-primary", children: "Get Started" }), _jsx("button", { className: "btn btn-secondary", children: "Learn More" })] })] }) }), _jsx("section", { className: "py-20 border-t border-border", children: _jsxs(motion.div, { className: "container", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: [_jsx(motion.h2, { variants: itemVariants, className: "text-4xl font-bold mb-12 text-center", children: "Navbar Features" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-lg", children: features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (_jsxs(motion.div, { variants: itemVariants, className: "card p-lg", whileHover: { y: -5, transition: { duration: 0.2 } }, children: [_jsx(motion.div, { className: "mb-4 inline-flex p-md rounded-lg", style: {
                                                background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(0, 212, 255, 0.05))',
                                                border: '1px solid var(--color-border)',
                                            }, whileHover: { scale: 1.1, rotate: 5 }, children: _jsx(Icon, { size: 28, color: "#6C63FF" }) }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: feature.title }), _jsx("p", { className: "text-text-secondary", children: feature.description })] }, index));
                            }) })] }) }), _jsx("section", { className: "py-20 border-t border-border", children: _jsxs(motion.div, { className: "container max-w-3xl", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: [_jsx(motion.h2, { variants: itemVariants, className: "text-4xl font-bold mb-8", children: "Quick Implementation" }), _jsxs(motion.div, { variants: itemVariants, className: "card p-lg", children: [_jsx("p", { className: "text-text-secondary mb-4", children: "Import and use the Navbar component in your app:" }), _jsx("div", { className: "bg-surface-elevated rounded-lg p-lg overflow-x-auto", children: _jsx("pre", { className: "font-mono text-sm text-text-primary", children: `import { Navbar } from '@/components/layout';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        {/* Your page content */}
      </main>
    </>
  );
}` }) })] }), _jsxs(motion.div, { variants: itemVariants, className: "mt-8", children: [_jsx("p", { className: "text-text-secondary mb-4", children: "Or use the Layout wrapper component for convenience:" }), _jsx("div", { className: "card p-lg", children: _jsx("div", { className: "bg-surface-elevated rounded-lg p-lg overflow-x-auto", children: _jsx("pre", { className: "font-mono text-sm text-text-primary", children: `import { Layout } from '@/components/layout';

export default function HomePage() {
  return (
    <Layout>
      {/* Navbar is included automatically */}
    </Layout>
  );
}` }) }) })] })] }) }), _jsx("section", { className: "py-20 border-t border-border", children: _jsxs(motion.div, { className: "container max-w-3xl", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: [_jsx(motion.h2, { variants: itemVariants, className: "text-4xl font-bold mb-8", children: "Interactive Elements" }), _jsxs("div", { className: "space-y-md", children: [_jsxs(motion.div, { variants: itemVariants, className: "card p-lg", children: [_jsxs("h3", { className: "text-lg font-semibold mb-2 flex items-center gap-md", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-primary" }), "Hover Effects"] }), _jsx("p", { className: "text-text-secondary", children: "Hover over the navigation links to see the smooth underline animation. The logo also has a subtle scale effect on hover." })] }), _jsxs(motion.div, { variants: itemVariants, className: "card p-lg", children: [_jsxs("h3", { className: "text-lg font-semibold mb-2 flex items-center gap-md", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-accent" }), "Scroll Effect"] }), _jsx("p", { className: "text-text-secondary", children: "Scroll up and down to see the navbar's glassmorphism effect enhance with blur and shadow as you scroll." })] }), _jsxs(motion.div, { variants: itemVariants, className: "card p-lg", children: [_jsxs("h3", { className: "text-lg font-semibold mb-2 flex items-center gap-md", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-success" }), "Mobile Menu"] }), _jsx("p", { className: "text-text-secondary", children: "Resize your window to see the responsive mobile menu. On mobile, tap the hamburger icon to reveal the navigation links." })] }), _jsxs(motion.div, { variants: itemVariants, className: "card p-lg", children: [_jsxs("h3", { className: "text-lg font-semibold mb-2 flex items-center gap-md", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-warning" }), "GitHub Integration"] }), _jsx("p", { className: "text-text-secondary", children: "The login button is ready to be connected to your GitHub OAuth flow. Click it to initiate authentication." })] })] })] }) }), _jsx("section", { className: "py-20 border-t border-border", children: _jsxs(motion.div, { className: "container max-w-2xl text-center", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: [_jsx(motion.h2, { variants: itemVariants, className: "text-4xl font-bold mb-4", children: "Ready to build with CloudOps?" }), _jsx(motion.p, { variants: itemVariants, className: "text-xl text-text-secondary mb-8", children: "Start deploying smarter today with our intuitive platform." }), _jsxs(motion.button, { variants: itemVariants, className: "btn btn-primary gap-md", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: ["Get Started Now", _jsx(ArrowRight, { size: 20 })] })] }) }), _jsx("div", { className: "py-10 border-t border-border text-center text-text-secondary", children: _jsx("p", { children: "\u00A9 2026 CloudOps. All rights reserved." }) })] }));
};
export default NavbarShowcase;
