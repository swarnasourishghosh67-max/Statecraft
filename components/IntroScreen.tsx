
import React from 'react';

interface IntroScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onContinue, hasSave }) => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Aesthetic Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-red-600/10 rounded-full blur-[120px]" />
      
      <div className="max-w-3xl w-full space-y-12 relative z-10">
        <header className="space-y-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.8em] text-neutral-600">The Ultimate Simulation of Power</span>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none">
              STATECRAFT
            </h1>
            <h2 className="text-2xl md:text-3xl font-black tracking-[0.3em] text-purple-600 uppercase">THE LONG ASCENT</h2>
          </div>
        </header>

        <div className="space-y-8">
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm shadow-2xl max-w-xl mx-auto">
            <p className="text-lg text-neutral-400 font-serif leading-relaxed italic">
              "You are mortal. A single fever, a drop of poison, or a poorly timed travel over the mountains can end your story. Power is the only medicine, and cunning the only shield."
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            {hasSave && (
              <button
                onClick={onContinue}
                className="group relative w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-sm rounded-2xl transition-all hover:bg-emerald-500 hover:text-white hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
              >
                Continue Current Game
                <div className="absolute inset-0 border border-white/10 rounded-2xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <button
              onClick={onStart}
              className={`group relative w-full py-5 ${hasSave ? 'bg-neutral-900 text-neutral-400' : 'bg-white text-black'} font-black uppercase tracking-[0.3em] text-sm rounded-2xl transition-all hover:bg-purple-500 hover:text-white hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)]`}
            >
              {hasSave ? 'Start New Game' : 'Enter The Realms'}
              <div className="absolute inset-0 border border-white/10 rounded-2xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          
          <div className="text-[9px] text-neutral-600 uppercase tracking-widest font-mono max-w-xs mx-auto">
            Saves include your stats, relationships, treasury, armies, titles, choices, and active crises.
          </div>
        </div>

        <footer className="pt-8 flex flex-col items-center gap-2">
          <p className="text-[9px] text-neutral-700 font-mono uppercase tracking-widest">Fragile Life Engine v4.1 (Persistence Core)</p>
          <div className="flex gap-4">
             <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75" />
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default IntroScreen;
