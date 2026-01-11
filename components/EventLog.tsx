
import React from 'react';
import { LogEntry } from '../types';

const EventLog: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  return (
    <div className="flex flex-col gap-20">
      {logs.map((log, i) => {
        const isPrologue = log.turn === 1 && i === 0;
        const isAdaptation = log.type === 'ADAPTATION';
        
        return (
          <div key={i} className={`animate-in fade-in slide-in-from-bottom-8 duration-1000 ${isPrologue ? 'relative pt-8' : ''} ${isAdaptation ? 'opacity-90' : ''}`}>
            {isPrologue && (
              <div className="absolute top-0 left-0 flex items-center gap-3 mb-6">
                <div className="w-12 h-0.5 bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">The Prologue</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
               <span className="text-[8px] font-black font-mono text-neutral-800 uppercase tracking-[0.5em]">T-{log.turn}</span>
               <div className="h-px flex-1 bg-white/5" />
               {isAdaptation && (
                 <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 border border-blue-400/20 rounded-full">Neural Synthesis</span>
               )}
               {log.rippleEffect && !isAdaptation && (
                 <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 border border-purple-500/20 rounded-full animate-pulse">Ripple Effect</span>
               )}
            </div>

            <p className={`text-xl text-neutral-200 font-serif leading-relaxed italic ${isPrologue ? 'text-2xl text-white' : ''} ${isAdaptation ? 'text-blue-100' : ''} first-letter:text-7xl first-letter:font-black first-letter:text-white first-letter:mr-4 first-letter:float-left first-letter:leading-none`}>
              {log.message}
            </p>

            {log.rippleEffect && (
              <div className={`mt-8 p-6 ${isAdaptation ? 'bg-blue-500/[0.03] border-blue-500/20' : 'bg-purple-500/[0.03] border-purple-500/20'} border-l-2 rounded-r-3xl flex flex-col gap-2`}>
                 <span className={`text-[7px] font-black uppercase tracking-widest ${isAdaptation ? 'text-blue-400' : 'text-purple-600'}`}>
                    {isAdaptation ? 'AI Strategy Update' : 'Historical Consequence'}
                 </span>
                 <p className="text-xs text-neutral-400 font-mono italic">"{log.rippleEffect}"</p>
              </div>
            )}

            {log.whisper && (
              <div className="mt-4 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                 <p className="text-[10px] text-amber-500/60 font-mono italic uppercase tracking-wider">{log.whisper}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EventLog;
