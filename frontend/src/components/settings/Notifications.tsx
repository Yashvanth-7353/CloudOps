import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Mail, MessageSquare } from 'lucide-react';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-emerald-500/80' : 'bg-white/15'}`}
    aria-pressed={checked}
  >
    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`} />
  </button>
);

const Notifications: React.FC = () => {
  const [email, setEmail] = useState(true);
  const [slack, setSlack] = useState(true);
  const [browser, setBrowser] = useState(false);

  return (
    <motion.section whileHover={{ y: -4 }} className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Notification preferences</h2>
          <p className="text-sm text-white/60">Choose how you get deployment updates.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-violet-300">
          <BellRing className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Email notifications', icon: <Mail className="h-4 w-4" />, checked: email, onChange: setEmail },
          { label: 'Slack alerts', icon: <MessageSquare className="h-4 w-4" />, checked: slack, onChange: setSlack },
          { label: 'Browser notifications', icon: <BellRing className="h-4 w-4" />, checked: browser, onChange: setBrowser },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-white/85">
              <span className="text-cyan-300">{item.icon}</span>
              {item.label}
            </div>
            <Toggle checked={item.checked} onChange={item.onChange} />
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default Notifications;
