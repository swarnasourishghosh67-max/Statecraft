
import React, { useState, useEffect, useRef } from 'react';
import { GameState, LogEntry, TimeScale, WorldEvent, MapNode, LegacyCharacter, TacticalProfile } from './types';
import { getRandomInitialState, INITIAL_FACTIONS } from './constants';
import { processLifeAction } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ActionPanel from './components/ActionPanel';
import EventLog from './components/EventLog';
import IntroScreen from './components/IntroScreen';
import LegacyScreen from './components/LegacyScreen';
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
  };

  const loadSavedGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
        setGameOver({ isOver: false });
      } catch (e) {
        startNewGame();
      }
    }
  };

  const handleRegionDiscovered = (node: MapNode) => {
    setGameState(prev => {
      if (!prev) return null;
      const exists = prev.discoveredRegions.some(r => r.id === node.id);
      if (exists) return prev;
      return { ...prev, discoveredRegions: [...prev.discoveredRegions, node] };
    });
  };

  const analyzeTactics = (text: string, current: TacticalProfile): TacticalProfile => {
    const t = text.toLowerCase();
    const updated = { ...current };
    
    if (t.includes('gold') || t.includes('buy') || t.includes('sell') || t.includes('treasury') || t.includes('tax')) {
      updated.economicActions += 1;
    }
    if (t.includes('kill') || t.includes('attack') || t.includes('war') || t.includes('execute') || t.includes('force')) {
      updated.aggressiveActions += 1;
    }
    if (t.includes('negotiate') || t.includes('talk') || t.includes('marry') || t.includes('alliance')) {
      updated.diplomaticActions += 1;
    }
    if (t.includes('whisper') || t.includes('spy') || t.includes('secret') || t.includes('hide')) {
      updated.subterfugeActions += 1;
    }
    
    return updated;
  };

  // Fixed: Implemented handleLegacyChoice to manage game restarts or character transitions
  const handleLegacyChoice = (choice: 'RESTART' | 'HEIR' | 'PREVIOUS', previousChar?: LegacyCharacter) => {
    if (choice === 'RESTART') {
      localStorage.removeItem(SAVE_KEY);
      startNewGame();
    } else if (choice === 'HEIR') {
      setGameState(prev => {
        if (!prev) return null;
        const newState = getRandomInitialState(prev.lineage);
        return {
          ...newState,
          characterName: `${prev.characterName} II`,
          treasury: Math.max(50, Math.floor(prev.treasury * 0.5)),
          nobleStanding: Math.max(20, Math.floor(prev.nobleStanding * 0.7)),
          clergyTrust: Math.max(20, Math.floor(prev.clergyTrust * 0.7)),
          locationPath: prev.locationPath,
        };
      });
      setGameOver({ isOver: false });
    } else {
      // Logic for PREVIOUS or fallback
      startNewGame();
    }
  };

  const handleAction = async (directive: string, timeScale: TimeScale = 'WEEK', travelPath?: string[]) => {
    if (!gameState || (!directive.trim() && !travelPath) || gameOver.isOver || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result: any = await processLifeAction(gameState, directive, timeScale);
      
      if (result.stateUpdates?.healthChange < -15 || result.stateUpdates?.safetyChange < -15) {
        setIsDamaged(true);
        setTimeout(() => setIsDamaged(false), 500);
      }

      setGameState(prev => {
        if (!prev) return null;
        
        const updates = result.stateUpdates;
        let monthsPassed = 1;
        if (timeScale === 'DAY') monthsPassed = 1/30;
        if (timeScale === 'WEEK') monthsPassed = 0.25;
        if (timeScale === 'MONTH') monthsPassed = 1;
        if (timeScale === 'YEAR') monthsPassed = 12;
        if (timeScale === '5_YEARS') monthsPassed = 60;

        const totalMonthsPassed = (prev.month - 1) + monthsPassed;
        const yearsToAdd = Math.floor(totalMonthsPassed / 12);
        const newMonth = (Math.floor(totalMonthsPassed) % 12) + 1;
        const newYear = prev.year + yearsToAdd;
        const newAge = prev.age + yearsToAdd;

        const netIncomePerMonth = prev.monthlyIncome - prev.monthlyExpenses;
        const totalEconomicShift = Math.floor(netIncomePerMonth * monthsPassed);
        const finalTreasury = Math.max(-2000, prev.treasury + (updates.treasuryChange || 0) + totalEconomicShift);
        const nextHealth = Math.max(0, Math.min(100, prev.health + (updates.healthChange || 0)));
        const nextSafety = Math.max(0, Math.min(100, prev.safety + (updates.safetyChange || 0)));

        if (nextHealth <= 0 || nextSafety <= 0 || finalTreasury < -1000 || result.gameOver || newAge > 90) {
          const reason = result.gameOverReason || "The cycle of life reaches its conclusion.";
          const legacyChar: LegacyCharacter = {
            name: prev.characterName,
            rank: prev.rankTitle,
            ageAtDeath: newAge,
            causeOfDeath: reason,
            turnDied: prev.turn
          };
          setGameOver({ isOver: true, reason });
          return { ...prev, health: 0, lineage: [...prev.lineage, legacyChar] };
        }

        // Update ML-based Tactical Profile
        let updatedProfile = analyzeTactics(directive, prev.tacticalProfile);
        updatedProfile.adaptationLevel = Math.min(100, updatedProfile.adaptationLevel + (updates.adaptationIncrease || 0.5));
        
        // Success rate calculation (simplified: positive safety/health changes increase it)
        const isSuccess = (updates.healthChange >= 0 && updates.safetyChange >= 0 && updates.treasuryChange >= 0);
        updatedProfile.successRate = Math.floor((updatedProfile.successRate * prev.turn + (isSuccess ? 100 : 0)) / (prev.turn + 1));

        const newLog: LogEntry = { 
          turn: prev.turn, 
          message: result.narrative, 
          whisper: result.whisper, 
          rippleEffect: result.rippleContext,
          type: result.adaptationNote ? 'ADAPTATION' : 'NEUTRAL'
        };

        let updatedWorldEvents = [...prev.worldEvents];
        if (updates.newWorldEvent) {
          updatedWorldEvents.push({ ...updates.newWorldEvent, turn: prev.turn, id: `e-${Date.now()}` });
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
          worldEvents: updatedWorldEvents,
          logs: [...prev.logs, newLog],
          suggestions: result.suggestions || prev.suggestions,
          activeScenarios: updates.updatedScenarios || prev.activeScenarios,
          tacticalProfile: updatedProfile
        };
      });
    } catch (err: any) {
      setError("The archives are currently unreachable. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!gameState) return <IntroScreen onStart={startNewGame} onContinue={loadSavedGame} hasSave={hasSave} />;

  return (
    <div className={`h-screen bg-[#050505] text-neutral-300 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden relative transition-all duration-300 ${isDamaged ? 'animate-shake bg-red-950/20' : ''} ${gameOver.isOver ? 'grayscale-[0.5]' : ''}`}>
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

      <header className="z-40 w-full bg-[#050505]/95 backdrop-blur-3xl border-b border-white/5 p-4 md:p-6 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-2xl shrink-0">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-auto">
          <h1 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase leading-none truncate max-w-[200px] md:max-w-none">
            {gameState.characterName}
          </h1>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3 mt-1 items-center">
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-500">{gameState.rankTitle}</span>
            <div className="h-1 w-1 rounded-full bg-neutral-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-purple-400">Turn {gameState.turn}</span>
              <div className="h-1 w-1 rounded-full bg-purple-900" />
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-emerald-500">Age {gameState.age}</span>
            </div>
          </div>
        </div>
        <Dashboard state={gameState} />
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar py-8 md:py-12 relative px-4 md:px-0">
        <div className="max-w-2xl mx-auto md:px-8">
          <EventLog logs={gameState.logs} />
          {isLoading && (
            <div className="mt-8 flex items-center gap-4 text-purple-500 animate-pulse bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20">
              <div className="w-2 h-2 rounded-full bg-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">Consulting the Oracle...</span>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-950/20 border border-red-900/40 rounded-2xl flex items-center gap-4">
              <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest">{error}</span>
            </div>
          )}
          <div ref={logEndRef} className="h-64" />
        </div>
      </main>

      {!gameOver.isOver && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-4 md:p-8 flex justify-center">
          <div className="w-full max-w-2xl pointer-events-auto">
            <ActionPanel onAction={handleAction} disabled={isLoading} suggestions={gameState.suggestions} />
          </div>
        </div>
      )}

      <div className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 md:gap-4 z-40">
        <button onClick={() => setShowMap(true)} className="w-10 h-10 md:w-14 md:h-14 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2 2"/></svg>
        </button>
        <button onClick={() => setShowIntel(true)} className="w-10 h-10 md:w-14 md:h-14 bg-neutral-900 border border-white/10 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl hover:bg-purple-600 transition-all group relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          {(gameState.worldEvents.length > 0 || gameState.activeScenarios.length > 0) && <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full border-2 border-black animate-bounce" />}
        </button>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-500 flex flex-col">
          <button onClick={() => setShowMap(false)} className="absolute top-4 md:top-8 right-4 md:right-8 text-white z-[110] bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="flex-1 overflow-hidden rounded-3xl">
            <MapView 
              currentLocationPath={gameState.locationPath} 
              discoveredRegions={gameState.discoveredRegions}
              onRegionDiscovered={handleRegionDiscovered}
              onTravel={(path) => { handleAction(`I travel to ${path[path.length-1]}`, 'WEEK', path); setShowMap(false); }} 
            />
          </div>
        </div>
      )}
      
      {showIntel && <IntelHub state={gameState} onClose={() => setShowIntel(false)} onAction={(directive) => handleAction(directive, 'WEEK')} />}
      <Chatbot />
      {gameOver.isOver && <LegacyScreen lineage={gameState.lineage} reason={gameOver.reason} onChoice={handleLegacyChoice} />}
    </div>
  );
};

export default App;
