
import React, { useState } from 'react';
import { GameState, WorldEvent, Faction } from '../types';
import { formatCurrency } from '../constants';

const FactionIcon: React.FC<{ name: string; status: 'pleased' | 'neutral' | 'angry' }> = ({ name, status }) => {
  const getBaseIcon = (n: string) => {
    if (n.toLowerCase().includes('peasant')) return '👥';
    if (n.toLowerCase().includes('church') || n.toLowerCase().includes('clergy')) return '✝';
    if (n.toLowerCase().includes('nobility') || n.toLowerCase().includes('peerage')) return '🗡';
    if (n.toLowerCase().includes('merchant')) return '📦';
    return '👑';
  };

  const getStatusEmoji = (s: string) => {
    if (s === 'pleased') return '🟢';
    if (s === 'angry') return '🔴';
    return '⚪';
  };

  return (
    <div className="flex flex-col items-center gap-1 group/fact">
      <span className="text-lg grayscale group-hover/fact:grayscale-0 transition-all">{getBaseIcon(name)}</span>
      <span className="text-[8px]">{getStatusEmoji(status)}</span>
    </div>
  );
};

const SeverityBar: React.FC<{ category: WorldEvent['category']; impact: string }> = ({ category, impact }) => {
  const getColor = () => {
    if (category === 'TRADE') return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'; // Opportunity
    if (category === 'COURT') return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'; // Tension
    if (category === 'HERESY') return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'; // Instability
    if (category === 'WAR') return 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]'; // Crisis
    if (category === 'PLAGUE') return 'bg-black shadow-[0_0_10px_rgba(0,0,0,0.5)]'; // Catastrophe
    return 'bg-neutral-400';
  };

  return <div className={`w-2 h-full absolute left-0 top-0 transition-all ${getColor()}`} />;
};

const NewsCard: React.FC<{ 
  event: WorldEvent; 
  factions: Faction[];
  onAction: (cmd: string) => void;
}> = ({ event, factions, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Logic-based tags (simulated based on turn numbers for variety)
  const isRumor = event.turn % 4 === 0; 
  const isPlayerInfluenced = event.turn % 5 === 0;

  const getFactionReaction = (opinion: number) => {
    if (opinion > 65) return 'pleased';
    if (opinion < 35) return 'angry';
    return 'neutral';
  };

  return (
    <div className="bg-[#fcfaf2] border border-neutral-300 shadow-sm relative overflow-hidden group mb-6 animate-in slide-in-from-right-8 duration-500 flex flex-col md:flex-row min-h-[180px] rounded-sm mobile:mx-2">
      <SeverityBar category={event.category} impact={event.impactLabel} />
      
      {/* Wax Seal Aesthetic for Royal/Court events */}
      {event.category === 'COURT' && (
        <div className="absolute top-4 right-4 w-12 h-12 bg-red-800 rounded-full opacity-20 flex items-center justify-center font-black text-white text-[8px] rotate-12 border-4 border-red-900 shadow-inner z-0 pointer-events-none">
          ROYAL
        </div>
      )}

      <div className="flex-1 p-6 md:p-8 flex flex-col gap-4 relative z-10">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div className="flex items-center gap-3">
             <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 py-1 border rounded ${isRumor ? 'border-amber-400 text-amber-600' : 'border-blue-600 text-blue-600'}`}>
                {isRumor ? '• RUMOR' : '• CONFIRMED'}
             </span>
             <span className="text-[8px] font-mono text-neutral-400">TURN {event.turn}</span>
          </div>
          <div className="flex gap-4 border-l border-neutral-200 pl-4">
            {factions.map(f => (
              <FactionIcon key={f.id} name={f.name} status={getFactionReaction(f.opinion)} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-neutral-900 font-serif border-b border-neutral-200 pb-2">
            {event.headline}
          </h3>
          {isPlayerInfluenced && (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest italic">Outcome influenced by the player</span>
            </div>
          )}
          <p className="text-sm md:text-base text-neutral-700 leading-relaxed font-serif italic">
            "{event.body}"
          </p>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-dashed border-neutral-300">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral-500 hover:text-neutral-900 transition-all group/arrow"
          >
            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>→</span>
            Ripple Effect Forecast
          </button>

          {isExpanded && (
            <div className="p-4 bg-white/40 border border-neutral-200 rounded text-[11px] leading-relaxed text-neutral-600 font-serif italic animate-in fade-in slide-in-from-top-1">
              <div className="font-black text-[8px] uppercase tracking-widest text-neutral-400 mb-1">Projected Outcome:</div>
              "The current {event.category.toLowerCase()} trajectory suggests {event.impactLabel.toLowerCase()} volatility. Should the local powers fail to intervene, the state's {event.impactLabel.toLowerCase()} standing will likely degrade significantly in the coming cycles."
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {['Investigate', 'Promote', 'Suppress'].map(action => (
              <button
                key={action}
                onClick={() => onAction(`${action === 'Promote' ? 'Popularise and Promote (spending coins to spread influence)' : action} regarding ${event.headline}`)}
                className="px-4 py-2 bg-white hover:bg-neutral-900 hover:text-white border border-neutral-300 text-[9px] font-black uppercase tracking-[0.2em] rounded-sm transition-all shadow-sm active:scale-95"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const IntelHub: React.FC<{ 
  state: GameState; 
  onClose: () => void;
  onAction: (directive: string) => void;
}> = ({ state, onClose, onAction }) => {
  const [tab, setTab] = useState<'CHRONICLE' | 'ECONOMY'>('CHRONICLE');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-0 md:p-8">
      <div className="w-full h-full md:max-w-5xl md:max-h-[85vh] bg-[#080808] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/10">
        
        {/* Navigation - Improved for Mobile */}
        <div className="p-4 md:p-10 flex flex-row justify-between items-center border-b border-white/5 bg-black/20 gap-4 shrink-0">
          <div className="flex flex-row justify-center gap-4 md:gap-10 flex-1">
            <button 
              onClick={() => setTab('CHRONICLE')} 
              className={`text-sm md:text-2xl font-black uppercase italic tracking-tighter transition-all ${tab === 'CHRONICLE' ? 'text-white border-b-2 border-purple-500' : 'text-neutral-600'}`}
            >
              Chronicle
            </button>
            <button 
              onClick={() => setTab('ECONOMY')} 
              className={`text-sm md:text-2xl font-black uppercase italic tracking-tighter transition-all ${tab === 'ECONOMY' ? 'text-white border-b-2 border-purple-500' : 'text-neutral-600'}`}
            >
              Ledger
            </button>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {tab === 'CHRONICLE' ? (
            <div className="bg-[#f0ece2] min-h-full p-4 md:p-10 relative">
               {/* Parchment Background Texture Simulation */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]" />
               
               <div className="max-w-3xl mx-auto flex flex-col">
                  {state.worldEvents.slice().reverse().map(e => (
                    <NewsCard 
                      key={e.id} 
                      event={e} 
                      factions={state.factions}
                      onAction={(cmd) => { onAction(cmd); onClose(); }}
                    />
                  ))}
                  {state.worldEvents.length === 0 && (
                    <div className="py-20 text-center opacity-40 uppercase font-black tracking-[0.4em] text-xs text-neutral-900 italic">"The silence of the realm is louder than war."</div>
                  )}
               </div>
            </div>
          ) : (
            <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
               {/* Simplified detailed Ledger UI preservation */}
               <section className="space-y-8">
                  <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
                    <div className="text-center md:text-left">
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Aggregated Treasury</h4>
                      <p className="text-[10px] text-neutral-500 font-serif italic mt-1">Status: Liquidity Maintained</p>
                    </div>
                    <span className="text-4xl font-black text-white font-mono">{formatCurrency(state.treasury)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
                      <h4 className="text-xs font-black text-emerald-500 uppercase border-b border-white/5 pb-2">Revenue Streams</h4>
                      <div className="space-y-3 text-[11px] font-mono text-neutral-400">
                        <div className="flex justify-between"><span>Direct Taxes</span><span className="text-white">●{Math.floor(state.monthlyIncome * 0.5)}</span></div>
                        <div className="flex justify-between"><span>Trade Duties</span><span className="text-white">●{Math.floor(state.monthlyIncome * 0.3)}</span></div>
                        <div className="flex justify-between"><span>Tithes</span><span className="text-white">●{Math.floor(state.monthlyIncome * 0.2)}</span></div>
                      </div>
                    </div>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
                      <h4 className="text-xs font-black text-red-500 uppercase border-b border-white/5 pb-2">Fiscal Drains</h4>
                      <div className="space-y-3 text-[11px] font-mono text-neutral-400">
                        <div className="flex justify-between"><span>Maintenance</span><span className="text-white">●{Math.floor(state.monthlyExpenses * 0.6)}</span></div>
                        <div className="flex justify-between"><span>Wages</span><span className="text-white">●{Math.floor(state.monthlyExpenses * 0.4)}</span></div>
                      </div>
                    </div>
                  </div>
               </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelHub;
