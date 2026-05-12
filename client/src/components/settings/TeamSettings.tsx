import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Crown } from 'lucide-react';

const TeamSettings: React.FC = () => {
  const [teamName, setTeamName] = useState('CloudOps Platform');

  return (
    <motion.section whileHover={{ y: -4 }} className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Team settings</h2>
          <p className="text-sm text-white/60">Manage workspace members and roles.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-fuchsia-300">
          <Users className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white outline-none focus:border-fuchsia-400/50" />

        <div className="space-y-2 text-sm text-white/80">
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3">
            <span>Olivia - Admin</span>
            <Crown className="h-4 w-4 text-amber-300" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3">
            <span>Marcus - Developer</span>
            <UserPlus className="h-4 w-4 text-cyan-300" />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TeamSettings;
