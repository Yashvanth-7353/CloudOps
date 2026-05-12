import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Layers, Database, Cpu } from 'lucide-react';

const suggestions = [
  { icon: <Zap className="w-4 h-4" />, title: 'Right-size ECS tasks', desc: 'Reduce CPU/RAM for low-util services.' },
  { icon: <Layers className="w-4 h-4" />, title: 'Use spot capacity', desc: 'Migrate non-critical workers to spot instances.' },
  { icon: <Database className="w-4 h-4" />, title: 'Archive older data', desc: 'Move infrequently accessed data to Glacier.' },
  { icon: <Cpu className="w-4 h-4" />, title: 'Enable CPU autoscaling', desc: 'Scale down idle nodes automatically.' },
];

const CostSuggestions: React.FC = () => (
  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4">
    <h3 className="text-sm font-semibold text-white mb-3">Cost Optimization Suggestions</h3>
    <div className="flex flex-col gap-3">
      {suggestions.map(s=> (
        <div key={s.title} className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center text-white">{s.icon}</div>
          <div>
            <div className="text-white/90 font-medium">{s.title}</div>
            <div className="text-white/70 text-sm">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default CostSuggestions;
