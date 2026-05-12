import React from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

const LoginCard: React.FC = () => {
  return (
    <motion.div
      className="w-full max-w-md mx-auto p-8 rounded-2xl relative bg-[rgba(19,26,42,0.6)] backdrop-blur-md border border-white/10 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 -z-10" />

      <div className="flex flex-col gap-4 z-10">
        <h3 className="text-2xl font-bold text-white">Welcome back</h3>
        <p className="text-sm text-white/70">Sign in to manage your deployments and monitoring.</p>

        <button
          className="mt-4 flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-gradient-to-r from-[#0f1724]/60 to-[#0b1220]/40 border border-white/10 hover:from-[#0b1220]/80 transition-all duration-200"
          onClick={() => window.location.assign('/api/auth/github')}
          aria-label="Sign in with GitHub"
        >
          <Github className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold text-white">Continue with GitHub</span>
        </button>

        <div className="pt-2">
          <div className="text-xs text-white/60">
            <strong className="text-white">Security:</strong> We use GitHub OAuth and store tokens securely. <br />
            Your data is encrypted in transit and at rest.
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2 text-xs text-white/50">
          <input id="remember" type="checkbox" className="w-4 h-4 rounded bg-white/5" />
          <label htmlFor="remember">Remember me on this device</label>
        </div>

        <div className="mt-2 text-center text-xs text-white/40">By continuing you agree to our <a href="#" className="text-accent underline">Privacy Policy</a>.</div>
      </div>
    </motion.div>
  );
};

export default LoginCard;
