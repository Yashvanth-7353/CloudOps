import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Healthy', value: 86 },
  { name: 'Degraded', value: 10 },
  { name: 'Down', value: 4 },
];

const COLORS = ['#34d399', '#f59e0b', '#fb7185'];

const ApplicationHealth: React.FC = ()=>{
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Application Health</h3>
        <div className="text-xs text-white/60">Overall</div>
      </div>
      <div style={{width:'100%',height:180}}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-col gap-1 text-sm">
        <div className="text-white/90">Healthy: 86%</div>
        <div className="text-white/70">Degraded: 10%</div>
        <div className="text-white/70">Down: 4%</div>
      </div>
    </motion.div>
  );
}

export default ApplicationHealth;
