
import React from 'react';
import { GameState } from '../types';
import { formatCurrency } from '../constants';

const ReputationBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex-1">
    <div className="flex justify-between items-end mb-1">
      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      <span className="text-[9px] font-mono font-bold text-neutral-300">{value}%</span>
    </div>
    <div className="h-1 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const Dashboard: React.FC<{ state: GameState }> = ({ state }) => {
  const isNetNegative = state.monthlyIncome < state.monthlyExpenses;

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-center bg-black/40 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
      {/* Economy */}
      <div className="flex gap-8 items-center border-r border-white/5 pr-8">
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase text-neutral-600 tracking-widest">Treasury</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(state.treasury)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase text-neutral-600 tracking-widest">Net Cashflow</span>
          <span className={`text-[10px] font-bold font-mono ${isNetNegative ? 'text-red-500' : 'text-emerald-500'}`}>
            {state.monthlyIncome - state.monthlyExpenses >= 0 ? '+' : ''}{state.monthlyIncome - state.monthlyExpenses}/mo
          </span>
        </div>
      </div>

      {/* Reputations */}
      <div className="flex-1 flex gap-6 min-w-[300px]">
        <ReputationBar label="Public Image" value={state.publicImage} color="bg-blue-500" />
        <ReputationBar label="Noble Standing" value={state.nobleStanding} color="bg-purple-600" />
        <ReputationBar label="Clergy Trust" value={state.clergyTrust} color="bg-amber-500" />
      </div>

      {/* Vitality */}
      <div className="flex gap-4 pl-8 border-l border-white/5">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${state.health < 30 ? 'border-red-600 animate-pulse' : 'border-emerald-500/20'}`}>
             <span className="text-[10px] font-black">{state.health}</span>
          </div>
          <span className="text-[6px] uppercase font-black text-neutral-600 mt-1">Health</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${state.safety < 30 ? 'border-red-600 animate-pulse' : 'border-red-500/20'}`}>
             <span className="text-[10px] font-black">{state.safety}</span>
          </div>
          <span className="text-[6px] uppercase font-black text-neutral-600 mt-1">Safety</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
