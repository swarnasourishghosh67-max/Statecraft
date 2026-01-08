
import React, { useState } from 'react';
import { GameState, WorldEvent } from '../types';
import { formatCurrency } from '../constants';

const EventCategoryIcon: React.FC<{ cat: WorldEvent['category'] }> = ({ cat }) => {
  switch (cat) {
    case 'WAR': return <span className="text-red-600">⚔️</span>;
    case 'PLAGUE': return <span className="text-emerald-600">💀</span>;
    case 'HERESY': return <span className="text-purple-600">🔥</span>;
    case 'TRADE': return <span className="text-amber-600">💰</span>;
    default: return <span className="text-blue-600">📜</span>;
  }
};

const NewsCard: React.FC<{ event: WorldEvent }> = ({ event }) => (
  <div className="bg-[#f4f1ea] border-b-2 border-dashed border-neutral-300 p-8 text-neutral-900 font-serif relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <EventCategoryIcon cat={event.category} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">{event.category}</span>
      </div>
      <span className="text-[9px] font-mono text-neutral-400">Turn {event.turn}</span>
    </div>
    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-3 group-hover:underline underline-offset-4 decoration-1">
      {event.headline}
    </h3>
    <p className="text-sm leading-relaxed mb-6 opacity-80 italic">
      "{event.body}"
    </p>
    <div className="flex items-center gap-2">
      <div className="px-2 py-0.5 bg-neutral-900 text-white text-[7px] font-black uppercase tracking-widest rounded">Impact</div>
      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">{event.impactLabel}</span>
    </div>
  </div>
);

const IntelHub: React.FC<{ state: GameState; onClose: () => void }> = ({ state, onClose }) => {
  const [tab, setTab] = useState<'FACTIONS' | 'CHRONICLE' | 'ECONOMY'>('CHRONICLE');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-8 bg-black/80 backdrop-blur-2xl">
      <div className="w-full max-w-5xl h-[85vh] bg-[#080808] border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
        <div className="p-10 flex justify-between items-center border-b border-white/5 bg-black/20">
          <div className="flex gap-10">
            <button onClick={() => setTab('CHRONICLE')} className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${tab === 'CHRONICLE' ? 'text-white scale-110 underline decoration-purple-500 underline-offset-8' : 'text-neutral-600 hover:text-neutral-400'}`}>Herald’s Chronicle</button>
            <button onClick={() => setTab('FACTIONS')} className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${tab === 'FACTIONS' ? 'text-white scale-110 underline decoration-purple-500 underline-offset-8' : 'text-neutral-600 hover:text-neutral-400'}`}>The Great Factions</button>
            <button onClick={() => setTab('ECONOMY')} className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${tab === 'ECONOMY' ? 'text-white scale-110 underline decoration-purple-500 underline-offset-8' : 'text-neutral-600 hover:text-neutral-400'}`}>Ledger</button>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 no-scrollbar">
          {tab === 'CHRONICLE' ? (
            <div className="flex flex-col">
               {state.activeScenarios.length > 0 && (
                 <div className="p-6 bg-purple-950/20 border-b border-purple-500/20">
                    <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest block mb-4">Ongoing Scenarios</span>
                    <div className="flex flex-wrap gap-2">
                       {state.activeScenarios.map((s, idx) => (
                         <span key={idx} className="px-3 py-1 bg-purple-900/40 border border-purple-500/30 text-[9px] font-mono text-white rounded-full">⚡ {s}</span>
                       ))}
                    </div>
                 </div>
               )}
               {state.worldEvents.slice().reverse().map(e => <NewsCard key={e.id} event={e} />)}
               {state.worldEvents.length === 0 && (
                 <div className="p-20 text-center opacity-20 uppercase font-black tracking-widest">The world is silent... for now.</div>
               )}
            </div>
          ) : tab === 'FACTIONS' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
              {state.factions.map(f => (
                <div key={f.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{f.name}</h3>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">Leader: {f.leader}</p>
                    </div>
                    <span className="text-2xl font-black text-neutral-400">{f.influence}%</span>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] uppercase font-black text-neutral-600"><span>Loyalty</span><span>{f.opinion}%</span></div>
                      <div className="h-1 bg-neutral-900 w-full rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width: `${f.opinion}%`}} /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] uppercase font-black text-neutral-600"><span>Ambition</span><span>{f.leaderAmbition}%</span></div>
                      <div className="h-1 bg-neutral-900 w-full rounded-full overflow-hidden"><div className="h-full bg-purple-600" style={{width: `${f.leaderAmbition}%`}} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 max-w-3xl mx-auto space-y-12">
               <div className="grid grid-cols-3 gap-8">
                  <div className="p-8 bg-neutral-900/40 rounded-3xl border border-white/5 text-center">
                    <span className="text-[8px] font-black uppercase text-neutral-600 tracking-[0.3em] block mb-2">Treasury</span>
                    <span className="text-4xl font-black text-emerald-400 font-mono">{formatCurrency(state.treasury)}</span>
                  </div>
                  <div className="p-8 bg-neutral-900/40 rounded-3xl border border-white/5 text-center">
                    <span className="text-[8px] font-black uppercase text-neutral-600 tracking-[0.3em] block mb-2">Revenue</span>
                    <span className="text-4xl font-black text-white font-mono">+{state.monthlyIncome}</span>
                  </div>
                  <div className="p-8 bg-neutral-900/40 rounded-3xl border border-white/5 text-center">
                    <span className="text-[8px] font-black uppercase text-neutral-600 tracking-[0.3em] block mb-2">Expenses</span>
                    <span className="text-4xl font-black text-red-500 font-mono">-{state.monthlyExpenses}</span>
                  </div>
               </div>
               <div className="text-[10px] text-neutral-500 font-mono italic text-center">
                  "Ensure every allocation is accounted for in the Ledger of the Realm."
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelHub;
