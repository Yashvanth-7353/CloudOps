import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CloudIllustration from '@/components/auth/CloudIllustration';
import LoginCard from '@/components/auth/LoginCard';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/auth-provider';
const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            login({ token }).then((success) => {
                if (success) {
                    navigate('/dashboard');
                }
                else {
                    localStorage.removeItem('cloudops_auth_token');
                }
            });
        }
    }, [searchParams, login, navigate]);
    return (_jsx("div", { className: "min-h-screen w-full bg-gradient-to-br from-[#06070f] to-[#0b1020] text-white", children: _jsx("div", { className: "max-w-full mx-auto min-h-screen", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 min-h-screen", children: [_jsxs("div", { className: "lg:col-span-7 relative flex items-center justify-center p-8 order-2 lg:order-1", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-[#061025] via-[#0b1a2b] to-transparent opacity-60" }), _jsxs("div", { className: "relative z-10 max-w-4xl w-full", children: [_jsxs("div", { className: "mb-6", children: [_jsxs(motion.h1, { className: "text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight", initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6 }, children: ["Deploy to AWS without", _jsx("br", {}), " DevOps complexity."] }), _jsx(motion.p, { className: "mt-4 text-white/70 max-w-xl", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 }, children: "CloudOps automates builds, deployments, and monitoring so your team can focus on product." })] }), _jsx("div", { className: "mt-8", children: _jsx(CloudIllustration, {}) }), _jsx(motion.div, { animate: { y: [0, -8, 0] }, transition: { duration: 6, repeat: Infinity }, className: "absolute right-8 top-12 hidden md:block", children: _jsx("div", { className: "p-3 rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg", children: " " }) })] })] }), _jsx("div", { className: "lg:col-span-5 flex items-center justify-center p-8 order-1 lg:order-2", children: _jsx("div", { className: "w-full max-w-lg", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6 }, children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "text-sm text-white/60", children: "Welcome to" }), _jsx("div", { className: "text-2xl font-bold", children: "CloudOps" }), _jsx("div", { className: "text-sm text-white/60", children: "Secure DevOps automation for teams" })] }), _jsx(LoginCard, {}), _jsx("div", { className: "mt-6 text-center text-xs text-white/50", children: "By signing in you agree to our Terms and that you have read our Privacy Policy." })] }) }) })] }) }) }));
};
export default LoginPage;
