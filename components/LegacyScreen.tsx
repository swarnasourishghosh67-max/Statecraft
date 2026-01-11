
import React, { useState } from 'react';
import { LegacyCharacter } from '../types';

interface LegacyScreenProps {
  lineage: LegacyCharacter[];
  reason?: string;
  onChoice: (choice: 'RESTART' | 'HEIR' | 'PREVIOUS', previousChar?: LegacyCharacter) => void;
}

const LegacyScreen: React.FC<LegacyScreenProps> = ({ lineage, reason, onChoice }) => {
  const [showLineage, setShowLineage] = useState(false);
  const currentChar = lineage[lineage.length - 1];

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-3xl w-full bg-neutral-950 border border-red-900/50 rounded-[40px] shadow-[0_0_100px_rgba(239,68,68,0.2)] flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
        
        <div className="p-8 md:p-12 text-center border-b border-white/5 bg-black/40">
          <h2 className="text-4xl md:text-6xl font-black text-red-600 uppercase tracking-tighter italic mb-4">
            The Descent Ends
          </h2>
          <div className="bg-red-950/20 p-6 rounded-3xl border border-red-900/30 text-lg md:text-xl text-red-100 font-serif italic mb-2">
            "{reason || "The thread of your life has been cut."}"
          </div>
          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.4em]">Chronicle Entry: Turn {currentChar?.turnDied}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {showLineage ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Chronicle of Your Lineage</h3>
                <button onClick={() => setShowLineage(false)} className="text-[10px] text-purple-400 font-bold uppercase hover:underline">Back to Options</button>
              </div>
              <div className="space-y-3">
                {lineage.slice().reverse().map((char, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-purple-500/50 transition-all">
                    <div>
                      <h4 className="text-sm font-black text-white italic">{char.name}</h4>
                      <p className="text-[10px] text-neutral-500 font-mono uppercase">{char.rank} • Age {char.ageAtDeath}</p>
                    </div>
                    <button 
                      onClick={() => onChoice('PREVIOUS', char)}
                      className="px-3 py-1.5 bg-purple-600 text-[8px] font-black uppercase text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                    >
                      Re-Inhabit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
              <button 
                onClick={() => onChoice('HEIR')}
                className="group p-8 bg-neutral-900 border border-emerald-900/30 rounded-3xl text-left transition-all hover:bg-emerald-950/20 hover:border-emerald-500"
              >
                <span className="text-emerald-500 text-2xl mb-4 block">🧬</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Continue as Heir</h3>
                <p className="text-xs text-neutral-400 font-serif leading-relaxed italic">"My father is gone, but the realm is still mine to rule." Carry on the family name with partial resources.</p>
              </button>

              <button 
                onClick={() => setShowLineage(true)}
                className="group p-8 bg-neutral-900 border border-purple-900/30 rounded-3xl text-left transition-all hover:bg-purple-950/20 hover:border-purple-500"
              >
                <span className="text-purple-500 text-2xl mb-4 block">📜</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">History of the Realm</h3>
                <p className="text-xs text-neutral-400 font-serif leading-relaxed italic">View the characters who came before and reclaim their legacy in a new cycle of power.</p>
              </button>

              <button 
                onClick={() => onChoice('RESTART')}
                className="col-span-1 md:col-span-2 group p-8 bg-neutral-900 border border-white/5 rounded-3xl text-center transition-all hover:bg-white/5 hover:border-white/20"
              >
                <h3 className="text-sm font-black text-neutral-300 uppercase tracking-[0.3em] mb-2">Start a New Life</h3>
                <p className="text-[10px] text-neutral-600 font-mono uppercase">Begin as a new soul in the brutal world. All is reset.</p>
              </button>
            </div>
          )}
        </div>
        
        <div className="p-8 border-t border-white/5 bg-black/60 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em] font-mono mb-0">The wheel of power continues without you. But your choices echo.</p>
        </div>
      </div>
    </div>
  );
};

export default LegacyScreen;
