import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const data = Array.from({length:12}).map((_,i)=>({month:`M${i+1}`, freq: Math.round(10+Math.random()*40)}));

const DeployFrequencyChart: React.FC = ()=>{
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">Deployment Frequency</h3>
        <div className="text-xs text-white/60">Monthly</div>
      </div>
      <div style={{width:'100%',height:200}}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.6)' }} />
            <Tooltip wrapperStyle={{background:'rgba(2,6,23,0.9)',borderRadius:6,border:'none'}} contentStyle={{color:'#fff'}}/>
            <Bar dataKey="freq" fill="#34d399" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default DeployFrequencyChart;
