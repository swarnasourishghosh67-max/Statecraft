
import React from 'react';

const GameOverModal: React.FC<{ reason?: string; onRestart: () => void }> = ({ reason, onRestart }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="max-w-xl w-full border border-red-900/50 bg-neutral-950 p-12 shadow-[0_0_100px_rgba(239,68,68,0.2)] text-center space-y-10 rounded-[40px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
        
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-red-600 uppercase tracking-tighter italic">The Ascent Ends</h2>
          <div className="h-px w-24 bg-red-900/50 mx-auto" />
        </div>

        <div className="bg-red-950/20 p-8 border border-red-900/30 text-lg text-red-100 font-serif italic rounded-3xl">
          "{reason || "Your life and legacy have been extinguished."}"
        </div>
        
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-mono">
          The wheel of power continues without you. Your name is already fading from the chronicles.
        </p>

        <button 
          onClick={onRestart}
          className="w-full py-5 bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase tracking-[0.3em] text-xs transition-all rounded-2xl shadow-2xl active:scale-95"
        >
          Begin A New Ascent
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
