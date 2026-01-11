
import React from 'react';
import { GameState } from '../types';
import { formatCurrency } from '../constants';

const StatBar: React.FC<{ label: string; value: number; color: string; icon: string }> = ({ label, value, color, icon }) => (
  <div className="flex-1 min-w-[120px]">
    <div className="flex justify-between items-end mb-1 px-1">
      <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1">
        <span>{icon}</span> {label}
      </span>
      <span className={`text-[10px] font-mono font-bold ${value < 30 ? 'text-red-500' : 'text-neutral-200'}`}>{value}%</span>
    </div>
    <div className="h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.05)]`} 
        style={{ width: `${value}%` }} 
      />
    </div>
  </div>
);

const Dashboard: React.FC<{ state: GameState }> = ({ state }) => {
  const isNetNegative = state.monthlyIncome < state.monthlyExpenses;

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center bg-black/60 p-4 md:p-6 rounded-[32px] border border-white/10 backdrop-blur-3xl w-full xl:w-auto shadow-2xl">
      
      {/* Vital Stats Section */}
      <div className="flex flex-wrap md:flex-nowrap gap-6 xl:pr-8 xl:border-r border-white/5">
        <StatBar label="Health" value={state.health} color="bg-gradient-to-r from-red-600 to-emerald-500" icon="❤️" />
        <StatBar label="Safety" value={state.safety} color="bg-gradient-to-r from-red-500 to-blue-500" icon="🛡️" />
      </div>

      {/* Social Standing Section */}
      <div className="flex flex-wrap md:flex-nowrap flex-1 gap-6 xl:px-8">
        <StatBar label="Peasants" value={state.publicImage} color="bg-blue-600" icon="👥" />
        <StatBar label="Nobility" value={state.nobleStanding} color="bg-purple-600" icon="🗡️" />
        <StatBar label="Church" value={state.clergyTrust} color="bg-amber-500" icon="⛪" />
      </div>

      {/* Economic Summary Section */}
      <div className="flex gap-8 items-center xl:pl-8 xl:border-l border-white/5 justify-center md:justify-end shrink-0">
        <div className="flex flex-col items-center xl:items-end">
          <span className="text-[8px] font-black uppercase text-neutral-500 tracking-widest mb-1">Total Treasury</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white font-mono tracking-tighter leading-none">{formatCurrency(state.treasury)}</span>
          </div>
          <span className={`text-[9px] font-bold font-mono mt-1 ${isNetNegative ? 'text-red-500' : 'text-emerald-500'}`}>
            {state.monthlyIncome - state.monthlyExpenses >= 0 ? 'Surplus: +' : 'Deficit: '}{state.monthlyIncome - state.monthlyExpenses} / turn
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
