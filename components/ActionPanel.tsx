
import React, { useState } from 'react';
import { TimeScale } from '../types';

interface ActionPanelProps {
  onAction: (directive: string, timeScale: TimeScale) => void;
  disabled: boolean;
  suggestions: string[];
}

const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, disabled, suggestions }) => {
  const [input, setInput] = useState('');
  const [timeScale, setTimeScale] = useState<TimeScale>('WEEK');

  const scales: { value: TimeScale, label: string }[] = [
    { value: 'DAY', label: '1 Day' },
    { value: 'WEEK', label: '1 Week' },
    { value: 'MONTH', label: '1 Month' },
    { value: 'YEAR', label: '1 Year' },
    { value: '5_YEARS', label: '5 Years' }
  ];

  const handleExecute = (overrideInput?: string) => {
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || disabled) return;
    onAction(finalInput, timeScale);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-700">
      {/* Suggestions Row - Refined Horizontal Scroll */}
      {suggestions.length > 0 && !disabled && (
        <div className="w-full relative px-2">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 px-1 scroll-smooth">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleExecute(s)}
                className="px-5 py-2.5 bg-neutral-900/60 border border-white/5 hover:border-purple-500/50 hover:bg-purple-900/20 text-[10px] font-mono font-bold text-neutral-400 hover:text-white rounded-2xl transition-all whitespace-nowrap shadow-2xl flex items-center gap-3 group shrink-0 active:scale-95"
              >
                <span className="text-purple-500 font-black group-hover:scale-125 transition-transform flex items-center justify-center w-3">✦</span>
                {s}
              </button>
            ))}
          </div>
          {/* Subtle Fade indicators if overflow */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none" />
        </div>
      )}

      <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 flex flex-col gap-2 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        <div className="flex bg-white/5 rounded-[24px] p-1 gap-1 overflow-x-auto no-scrollbar">
          {scales.map((s) => (
            <button
              key={s.value}
              onClick={() => setTimeScale(s.value)}
              className={`flex-1 py-2 px-3 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all whitespace-nowrap ${timeScale === s.value ? 'bg-white text-black' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 p-2">
          <input
            disabled={disabled}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="Dictate your rule..."
            className="flex-1 bg-transparent px-4 text-sm text-white focus:outline-none placeholder:text-neutral-700 font-serif italic"
          />
          <button
            onClick={() => handleExecute()}
            disabled={disabled || !input.trim()}
            className="w-12 h-12 bg-purple-600 rounded-[18px] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;
