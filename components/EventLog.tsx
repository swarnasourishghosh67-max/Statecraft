
import React from 'react';
import { LogEntry } from '../types';

const EventLog: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  return (
    <div className="flex flex-col gap-20">
      {logs.map((log, i) => (
        <div key={i} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-4 mb-8">
             <span className="text-[8px] font-black font-mono text-neutral-800 uppercase tracking-[0.5em]">T-{log.turn}</span>
             <div className="h-px flex-1 bg-white/5" />
             {log.rippleEffect && (
               <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 border border-purple-500/20 rounded-full animate-pulse">Ripple Effect</span>
             )}
          </div>

          <p className="text-xl text-neutral-200 font-serif leading-relaxed italic first-letter:text-7xl first-letter:font-black first-letter:text-white first-letter:mr-4 first-letter:float-left first-letter:leading-none">
            {log.message}
          </p>

          {log.rippleEffect && (
            <div className="mt-8 p-6 bg-purple-500/[0.03] border-l-2 border-purple-500/20 rounded-r-3xl flex flex-col gap-2">
               <span className="text-[7px] font-black text-purple-600 uppercase tracking-widest">Historical Consequence</span>
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
      ))}
    </div>
  );
};

export default EventLog;
