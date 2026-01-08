
import React, { useState, useEffect, useRef } from 'react';
import { GameState, LogEntry, TimeScale, WorldEvent } from './types';
import { getRandomInitialState } from './constants';
import { processLifeAction } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ActionPanel from './components/ActionPanel';
import EventLog from './components/EventLog';
import IntroScreen from './components/IntroScreen';
import GameOverModal from './components/GameOverModal';
import MapView from './components/MapView';
import IntelHub from './components/IntelHub';
import Chatbot from './components/Chatbot';

const SAVE_KEY = 'statecraft_v4_save';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showIntel, setShowIntel] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<{ isOver: boolean; reason?: string }>({ isOver: false });
  const [hasSave, setHasSave] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) setHasSave(true);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState?.logs, isLoading]);

  // Persist game state on every change
  useEffect(() => {
    if (gameState && !gameOver.isOver) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      setHasSave(true);
    }
  }, [gameState, gameOver.isOver]);

  const startNewGame = () => {
    const newState = getRandomInitialState();
    setGameState(newState);
    setGameOver({ isOver: false });
    localStorage.removeItem(SAVE_KEY);
  };

  const loadSavedGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
        setGameOver({ isOver: false });
      } catch (e) {
        console.error("Failed to load save:", e);
        startNewGame();
      }
    }
  };

  const handleAction = async (directive: string, timeScale: TimeScale, travelPath?: string[]) => {
    if (!gameState || (!directive.trim() && !travelPath) || gameOver.isOver || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("ORACLE_TIMEOUT")), 15000)
    );

    try {
      const result: any = await Promise.race([
        processLifeAction(gameState, directive, timeScale),
        timeoutPromise
      ]);
      
      if (result.stateUpdates?.healthChange < -15 || result.stateUpdates?.safetyChange < -15) {
        setIsDamaged(true);
        setTimeout(() => setIsDamaged(false), 500);
      }

      setGameState(prev => {
        if (!prev) return null;
        
        try {
          const updates = result.stateUpdates;
          
          let monthsPassed = 1;
          if (timeScale === 'DAY') monthsPassed = 0;
          if (timeScale === 'WEEK') monthsPassed = 0.25;
          if (timeScale === 'MONTH') monthsPassed = 1;
          if (timeScale === 'YEAR') monthsPassed = 12;
          if (timeScale === '5_YEARS') monthsPassed = 60;

          const yearsToAdd = Math.floor(monthsPassed / 12);
          const remainingMonths = monthsPassed % 12;
          let newMonth = prev.month + remainingMonths;
          let newYear = prev.year + yearsToAdd;
          let newAge = prev.age;

          if (newMonth > 12) {
            newYear += 1;
            newMonth -= 12;
          }
          if (newYear > prev.year) {
            newAge += (newYear - prev.year);
          }

          const netIncomePerMonth = prev.monthlyIncome - prev.monthlyExpenses;
          const totalEconomicShift = Math.floor(netIncomePerMonth * monthsPassed);
          
          // Treasury updates: Explicitly deduct treasuryChange (which should be negative for spending)
          const finalTreasury = Math.max(-2000, prev.treasury + (updates.treasuryChange || 0) + totalEconomicShift);

          const nextHealth = Math.max(0, Math.min(100, prev.health + (updates.healthChange || 0)));
          const nextSafety = Math.max(0, Math.min(100, prev.safety + (updates.safetyChange || 0)));

          if (nextHealth <= 0 || nextSafety <= 0 || finalTreasury < -1000 || result.gameOver || newAge > 90) {
            let reason = result.gameOverReason;
            if (finalTreasury < -1000) reason = "Your astronomical debts led to your public execution by creditors.";
            if (newAge > 90) reason = "Age finally claimed what no enemy could. You pass into legend.";
            setGameOver({ isOver: true, reason: reason || "Your thread of life has been cut." });
            localStorage.removeItem(SAVE_KEY);
          }

          const newLog: LogEntry = { 
            turn: prev.turn, 
            message: result.narrative, 
            whisper: result.whisper, 
            rippleEffect: result.rippleContext,
            type: (updates.healthChange < 0 || updates.safetyChange < 0) ? 'VIOLENT' : 'NEUTRAL' 
          };

          const newFactions = prev.factions.map(f => {
            const update = updates.factionUpdates?.find((u: any) => u.id === f.id);
            return update ? { ...f, ...update } : f;
          });

          let updatedWorldEvents = [...prev.worldEvents];
          if (updates.newWorldEvent) {
            const freshEvent: WorldEvent = { ...updates.newWorldEvent, turn: prev.turn, id: `e-${Date.now()}` };
            updatedWorldEvents.push(freshEvent);
          }

          return {
            ...prev,
            turn: prev.turn + 1,
            month: newMonth,
            year: newYear,
            age: newAge,
            treasury: finalTreasury,
            monthlyIncome: Math.max(0, prev.monthlyIncome + (updates.incomeChange || 0)),
            monthlyExpenses: Math.max(1, prev.monthlyExpenses + (updates.expenseChange || 0)),
            publicImage: Math.max(0, Math.min(100, prev.publicImage + (updates.publicChange || 0))),
            nobleStanding: Math.max(0, Math.min(100, prev.nobleStanding + (updates.nobleChange || 0))),
            clergyTrust: Math.max(0, Math.min(100, prev.clergyTrust + (updates.clergyChange || 0))),
            cunning: Math.max(0, Math.min(100, prev.cunning + (updates.cunningChange || 0))),
            safety: nextSafety,
            health: nextHealth,
            traits: updates.newTraits || prev.traits,
            rankTitle: updates.newRankTitle || prev.rankTitle,
            locationPath: travelPath || updates.newLocationPath || prev.locationPath,
            factions: newFactions,
            worldEvents: updatedWorldEvents,
            logs: [...prev.logs, newLog],
            suggestions: result.suggestions && result.suggestions.length > 0 ? result.suggestions : prev.suggestions,
            activeScenarios: updates.updatedScenarios || prev.activeScenarios
          };
        } catch (stateErr) {
          console.error("Critical State Update Error:", stateErr);
          return prev;
        }
      });

    } catch (err: any) {
      console.error("Simulation error:", err);
      if (err.message === "ORACLE_TIMEOUT") {
        setError("The Oracle is taking too long to transcribe the heavens. Try again.");
      } else {
        setError("A disturbance in the chronicles has occurred.");
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!gameState) return <IntroScreen onStart={startNewGame} onContinue={loadSavedGame} hasSave={hasSave} />;

  return (
    <div className={`h-screen bg-[#050505] text-neutral-300 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden relative transition-all duration-300 ${isDamaged ? 'animate-shake bg-red-950/20' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-4px, 0); }
          20%, 40%, 60%, 80% { transform: translate(4px, 0); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.6); }
      `}</style>

      <header className="z-40 w-full bg-[#050505]/95 backdrop-blur-3xl border-b border-white/5 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{gameState.characterName}</h1>
             <button onClick={() => window.location.reload()} className="text-[7px] text-neutral-600 hover:text-neutral-400 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded">Quit to Title</button>
          </div>
          <div className="flex gap-3 mt-1 items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500">{gameState.rankTitle}</span>
            <div className="h-1 w-1 rounded-full bg-neutral-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">Turn {gameState.turn}</span>
              <div className="h-1 w-1 rounded-full bg-purple-900" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500">Age {gameState.age}</span>
            </div>
          </div>
        </div>
        <Dashboard state={gameState} />
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar py-12 relative">
        <div className="max-w-2xl mx-auto px-8">
          <EventLog logs={gameState.logs} />
          {isLoading && (
            <div className="mt-8 flex items-center gap-4 text-purple-500 animate-pulse bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20">
              <div className="w-2 h-2 rounded-full bg-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">Consulting the Oracle...</span>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-950/20 border border-red-900/40 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-[8px] font-black uppercase tracking-widest text-neutral-500 hover:text-white underline">Dismiss</button>
            </div>
          )}
          <div ref={logEndRef} className="h-64" />
        </div>
      </main>

      {!gameOver.isOver && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-8 flex justify-center">
          <div className="w-full max-w-2xl pointer-events-auto">
            <ActionPanel onAction={handleAction} disabled={isLoading} suggestions={gameState.suggestions} />
          </div>
        </div>
      )}

      <div className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40">
        <button onClick={() => setShowMap(true)} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2 2"/></svg>
        </button>
        <button onClick={() => setShowIntel(true)} className="w-14 h-14 bg-neutral-900 border border-white/10 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-purple-600 transition-all group relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          {(gameState.worldEvents.length > 0 || gameState.activeScenarios.length > 0) && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-black animate-bounce" />}
        </button>
      </div>

      {showMap && <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl p-8 animate-in fade-in duration-500"><MapView currentLocationPath={gameState.locationPath} onTravel={(path) => { handleAction(`I travel to ${path[path.length-1]}`, 'WEEK', path); setShowMap(false); }} /><button onClick={() => setShowMap(false)} className="absolute top-8 right-8 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>}
      {showIntel && <IntelHub state={gameState} onClose={() => setShowIntel(false)} />}
      <Chatbot />
      {gameOver.isOver && <GameOverModal reason={gameOver.reason} onRestart={() => window.location.reload()} />}
    </div>
  );
};

export default App;
