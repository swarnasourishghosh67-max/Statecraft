
import React, { useState, useEffect } from 'react';
import { MapNode, FeudalMember } from '../types';
import { WORLD_MAP } from '../constants';
import { exploreLocation } from '../services/geminiService';

interface MapViewProps {
  currentLocationPath: string[];
  currentYear: number;
  discoveredRegions: MapNode[];
  onTravel?: (destination: string[]) => void;
  onRegionDiscovered?: (node: MapNode) => void;
}

const MapView: React.FC<MapViewProps> = ({ currentLocationPath, currentYear, discoveredRegions, onTravel, onRegionDiscovered }) => {
  const [viewedNode, setViewedNode] = useState<MapNode>(WORLD_MAP);
  const [navigationHistory, setNavigationHistory] = useState<MapNode[]>([]);
  const [exploring, setExploring] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<MapNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleZoomIn = async (node: MapNode) => {
    const isLeaf = !node.children || node.children.length === 0;
    const discovered = discoveredRegions.find(r => r.id === node.id);

    if (isLeaf || discovered) {
      if (discovered) {
        setSelectedNodeDetails(discovered);
      } else {
        setExploring(true);
        // Pass currentYear to ensure historical accuracy
        const result = await exploreLocation(node.name, currentYear);
        const enrichedNode: MapNode = {
          ...node,
          nobilityTitle: result.hierarchy?.[0]?.rank || 'Sovereign',
          nobilityRuler: result.hierarchy?.[0]?.name || 'Unknown',
          churchTitle: result.churchInfo?.title || 'Ideology',
          churchRuler: result.churchInfo?.ruler || 'Unknown',
          hierarchy: result.hierarchy,
          groundingUri: result.mapsUri
        };
        setSelectedNodeDetails(enrichedNode);
        onRegionDiscovered?.(enrichedNode);
        setExploring(false);
      }
    } else {
      setNavigationHistory([...navigationHistory, viewedNode]);
      setViewedNode(node);
      setSelectedNodeDetails(null);
    }
  };

  const handleZoomOut = () => {
    if (selectedNodeDetails) {
      setSelectedNodeDetails(null);
    } else if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(navigationHistory.slice(0, -1));
      setViewedNode(prev);
    }
  };

  const isPlayerHere = (nodeName: string) => currentLocationPath.includes(nodeName);
  const isDiscovered = (nodeId: string) => discoveredRegions.some(r => r.id === nodeId);

  return (
    <div className="flex flex-col h-full bg-[#030303] rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700 relative">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(.33); opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        .animate-pulse-ring { animation: pulse-ring 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
        .grid-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Navigation Header */}
      <div className="px-8 py-6 bg-black/60 border-b border-white/5 flex items-center justify-between shrink-0 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600/20 blur-xl rounded-full" />
            <div className="p-3 bg-white text-black rounded-2xl shadow-2xl relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2 2"/></svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-1">Archive Search: {currentYear} AD</span>
            <div className="flex items-center gap-3">
              {currentLocationPath.map((loc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold uppercase tracking-widest ${i === currentLocationPath.length - 1 ? 'text-white' : 'text-neutral-500'}`}>
                    {loc}
                  </span>
                  {i < currentLocationPath.length - 1 && <span className="text-neutral-800">/</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Regions Explored: {discoveredRegions.length}</span>
          </div>
          <button 
            onClick={handleZoomOut} 
            className="px-6 py-2.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 shadow-xl"
          >
            Level Up ↑
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col lg:flex-row">
        {/* Interactive Strategic Grid */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar relative p-10 grid-pattern ${selectedNodeDetails ? 'hidden lg:block' : ''}`}>
          <div className="relative z-10 mb-16">
            <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none mb-6 animate-in slide-in-from-left-10 duration-700">
              {viewedNode.name}
            </h2>
            <div className="flex items-center gap-4">
               <div className="h-px w-24 bg-neutral-800" />
               <p className="text-xs text-neutral-500 font-mono uppercase tracking-[0.2em]">Select Realm in {currentYear} AD</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
            {(viewedNode.children || []).map((node) => (
              <button
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => handleZoomIn(node)}
                disabled={exploring}
                className={`group relative p-10 rounded-[40px] border transition-all duration-700 overflow-hidden flex flex-col gap-8 ${
                  isPlayerHere(node.name) 
                  ? 'bg-purple-600 border-purple-400 shadow-[0_30px_100px_rgba(168,85,247,0.3)]' 
                  : isDiscovered(node.id)
                    ? 'bg-neutral-900 border-white/10 hover:border-white/30 hover:bg-neutral-800'
                    : 'bg-black/40 border-white/5 hover:border-purple-500/40 hover:bg-neutral-900/60'
                }`}
              >
                {/* Visual Flair: Pulsing Player Beacon */}
                {isPlayerHere(node.name) && (
                  <div className="absolute top-6 left-6 flex items-center justify-center">
                    <div className="absolute w-8 h-8 bg-white/40 rounded-full animate-pulse-ring" />
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]" />
                  </div>
                )}

                {/* Discovery Tag */}
                {isDiscovered(node.id) && !isPlayerHere(node.name) && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Mapped</span>
                  </div>
                )}

                <div className="relative z-10 mt-4">
                  <span className={`text-[10px] font-black uppercase tracking-[0.4em] block mb-2 ${isPlayerHere(node.name) ? 'text-purple-100' : 'text-neutral-600'}`}>
                    {node.type}
                  </span>
                  <h3 className={`text-3xl font-black italic tracking-tighter uppercase leading-none transition-transform group-hover:scale-105 duration-500 ${isPlayerHere(node.name) ? 'text-white' : 'text-neutral-200'}`}>
                    {node.name}
                  </h3>
                </div>

                <div className="mt-auto flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 ${isPlayerHere(node.name) ? 'border-purple-400 bg-purple-800' : 'border-black bg-neutral-900'} flex items-center justify-center text-[10px] font-bold`}>
                          {i}
                        </div>
                      ))}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isPlayerHere(node.name) ? 'text-purple-200' : 'text-neutral-500'}`}>
                      Power Blocs
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlayerHere(node.name) ? 'bg-white text-black' : 'bg-white/5 text-white group-hover:bg-purple-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>

                {/* Hover Background Animation */}
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2 group-hover:bg-purple-500/30 transition-all duration-1000" />
              </button>
            ))}
          </div>

          {exploring && (
            <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-12 max-w-md">
                <div className="relative">
                   <div className="w-32 h-32 border-4 border-purple-500/10 rounded-full animate-ping absolute inset-0" />
                   <div className="w-32 h-32 border-t-4 border-white rounded-full animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                   </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Infiltrating Archives ({currentYear} AD)</h4>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-neutral-500 font-serif italic">"Synthesizing era-appropriate power structures, land holdings, and political seats..."</p>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-64 mx-auto">
                       <div className="h-full bg-purple-600 animate-[loading_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Feudal/Modern Report Sidebar */}
        {selectedNodeDetails && (
          <div className="w-full lg:w-[500px] bg-[#080808] border-l border-white/10 p-12 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-32 duration-1000 shadow-[-50px_0_150px_rgba(0,0,0,0.8)] z-30">
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                 <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.5em]">ERA: {currentYear > 1850 ? 'Industrial' : 'Feudal'}</span>
                 <div className="h-px flex-1 bg-white/5" />
              </div>
              <h3 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none mt-2">{selectedNodeDetails.name}</h3>
              <p className="text-sm text-neutral-500 font-serif italic mt-6 leading-relaxed">
                Records from {currentYear} AD indicate this domain serves as a critical strategic node. The balance of power here is defined by ${currentYear > 1800 ? 'political machinery' : 'divine right'}.
              </p>
              {selectedNodeDetails.groundingUri && (
                <a href={selectedNodeDetails.groundingUri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-5 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest mt-8 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Historical Reference
                </a>
              )}
            </div>

            <div className="space-y-16">
              {/* Power Structure */}
              <div className="grid grid-cols-1 gap-6">
                <section className="relative p-10 bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden group hover:border-amber-500/40 transition-all duration-500">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-6">Secular Authority</h4>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">{selectedNodeDetails.nobilityTitle}</span>
                    <p className="text-4xl font-black text-white tracking-tighter leading-none italic">{selectedNodeDetails.nobilityRuler}</p>
                  </div>
                </section>

                <section className="relative p-10 bg-white/[0.03] border border-white/10 rounded-[40px] group hover:border-blue-500/40 transition-all duration-500">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-6">Ideological Seat</h4>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">{selectedNodeDetails.churchTitle}</span>
                    <p className="text-3xl font-black text-white tracking-tighter leading-none italic">{selectedNodeDetails.churchRuler}</p>
                  </div>
                </section>
              </div>

              {/* Hierarchy Table */}
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                   <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em]">The Hierarchy</h4>
                   <span className="text-[9px] font-mono text-neutral-600 uppercase">Power Concentration</span>
                </div>
                <div className="space-y-6">
                  {(selectedNodeDetails.hierarchy || []).map((m, i) => (
                    <div key={i} className="flex flex-col gap-3 group">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">{m.rank}</span>
                           <span className="text-lg font-black text-neutral-200 italic group-hover:text-white transition-colors">{m.name}</span>
                        </div>
                        <span className="text-lg font-black font-mono text-neutral-700 group-hover:text-white transition-colors">{m.influence}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-800 to-purple-500 transition-all duration-1000 shadow-[0_0_20px_rgba(168,85,247,0.5)]" 
                          style={{ width: `${m.influence}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button 
                onClick={() => onTravel?.([...navigationHistory.map(h => h.name), viewedNode.name, selectedNodeDetails.name])}
                className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.5em] text-xs rounded-[32px] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_40px_100px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-4"
              >
                Commence Travel
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
