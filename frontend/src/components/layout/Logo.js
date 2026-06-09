import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
const Logo = () => {
    return (_jsxs(motion.a, { href: "/", className: "flex items-center gap-md", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx(motion.div, { className: "logo-icon", whileHover: { rotate: 10 }, transition: { type: 'spring', stiffness: 400, damping: 10 }, children: _jsxs("div", { className: "relative", children: [_jsx(Cloud, { size: 28, color: "#6C63FF", fill: "#6C63FF", strokeWidth: 1.5 }), _jsx(motion.div, { className: "absolute inset-0 rounded-full", style: {
                                background: 'radial-gradient(circle, rgba(108, 99, 255, 0.3), transparent)',
                            }, animate: {
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }, transition: {
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            } })] }) }), _jsxs("div", { className: "logo-text", children: [_jsx("span", { className: "logo-title", children: "CloudOps" }), _jsx("span", { className: "logo-subtitle", children: "Deploy Smart" })] })] }));
};
export default Logo;
