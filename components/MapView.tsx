
import React, { useState } from 'react';
import { MapNode, FeudalMember } from '../types';
import { WORLD_MAP } from '../constants';
import { exploreLocation } from '../services/geminiService';

interface MapViewProps {
  currentLocationPath: string[];
  discoveredRegions: MapNode[];
  onTravel?: (destination: string[]) => void;
  onRegionDiscovered?: (node: MapNode) => void;
}

const MapView: React.FC<MapViewProps> = ({ currentLocationPath, discoveredRegions, onTravel, onRegionDiscovered }) => {
  const [viewedNode, setViewedNode] = useState<MapNode>(WORLD_MAP);
  const [navigationHistory, setNavigationHistory] = useState<MapNode[]>([]);
  const [exploring, setExploring] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<MapNode | null>(null);

  const handleZoomIn = async (node: MapNode) => {
    const isLeaf = !node.children || node.children.length === 0;
    const discovered = discoveredRegions.find(r => r.id === node.id);

    if (isLeaf || discovered) {
      if (discovered) {
        setSelectedNodeDetails(discovered);
      } else {
        setExploring(true);
        const result = await exploreLocation(node.name);
        const enrichedNode: MapNode = {
          ...node,
          nobilityTitle: result.hierarchy?.[0]?.rank || 'Sovereign',
          nobilityRuler: result.hierarchy?.[0]?.name || 'Unknown Lord',
          churchTitle: result.churchInfo?.title || 'Bishop',
          churchRuler: result.churchInfo?.ruler || 'Anonymous Cleric',
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

  return (
    <div className="flex flex-col h-full bg-[#050505] rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">
      {/* Navigation Header */}
      <div className="px-8 py-5 bg-black/40 border-b border-white/5 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="p-2 bg-purple-600 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2 2"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Imperial Cartography</span>
            <div className="flex items-center gap-2">
              {currentLocationPath.map((loc, i) => (
                <span key={i} className={`text-[11px] font-mono font-bold uppercase tracking-wider ${i === currentLocationPath.length - 1 ? 'text-white' : 'text-neutral-600'}`}>
                  {loc} {i < currentLocationPath.length - 1 && '›'}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleZoomOut} className="px-5 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95">
          Return to Sovereign View
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
        {/* Geographic Grid / Map Selector */}
        <div className={`flex-1 overflow-y-auto p-10 custom-scrollbar ${selectedNodeDetails ? 'hidden lg:block' : ''}`}>
          <div className="mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">{viewedNode.name}</h2>
            <p className="text-sm text-neutral-500 font-serif italic max-w-xl">"Behold the tapestry of the Old World. Every boundary a bloodied history, every title a cage of gold. Select a domain to consult the chronicles of the 15th century."</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(viewedNode.children || []).map((node) => (
              <button
                key={node.id}
                onClick={() => handleZoomIn(node)}
                disabled={exploring}
                className={`text-left group relative p-8 rounded-[32px] border transition-all duration-500 ${
                  isPlayerHere(node.name) 
                  ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]' 
                  : 'bg-neutral-900/40 border-white/5 hover:border-white/20 hover:bg-neutral-900/60'
                }`}
              >
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                </div>
                
                <div className="mb-6">
                  <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">{node.type}</span>
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">{node.name}</h3>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-black bg-neutral-800" />)}
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-400 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">Inspect</span>
                </div>
              </button>
            ))}
          </div>

          {exploring && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 text-center">
              <div className="flex flex-col items-center gap-8 max-w-sm">
                <div className="relative">
                   <div className="w-24 h-24 border-2 border-purple-500/20 rounded-full animate-ping absolute inset-0" />
                   <div className="w-24 h-24 border-t-2 border-purple-600 rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Consulting Imperial Archives</h4>
                  <p className="text-xs text-neutral-500 font-serif italic">"Retrieving 15th-century historical hierarchies and ecclesiastical structures via Grounded Intelligence..."</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deep Feudal Report (Side Panel) */}
        {selectedNodeDetails && (
          <div className="w-full lg:w-[450px] bg-neutral-950 border-l border-white/10 p-10 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-20 duration-700 shadow-[-50px_0_100px_rgba(0,0,0,0.5)]">
            <div className="mb-12">
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-4 block">Grounded Analysis: 1400 AD</span>
              <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mt-2">{selectedNodeDetails.name}</h3>
              {selectedNodeDetails.groundingUri && (
                <a href={selectedNodeDetails.groundingUri} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 font-mono mt-4 flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Verify via Imperial Records (Google)
                </a>
              )}
            </div>

            <div className="space-y-12">
              {/* Sovereign / King Section */}
              <section className="relative p-8 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-[32px] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                </div>
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">The Sovereign</h4>
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-200 uppercase tracking-widest">{selectedNodeDetails.nobilityTitle}</span>
                  <p className="text-3xl font-black text-white tracking-tighter leading-none italic">{selectedNodeDetails.nobilityRuler}</p>
                </div>
              </section>

              {/* Church Section */}
              <section className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[32px]">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Ecclesiastical Authority</h4>
                <div className="space-y-1">
                  <span className="text-xs font-black text-blue-200 uppercase tracking-widest">{selectedNodeDetails.churchTitle}</span>
                  <p className="text-2xl font-black text-white tracking-tighter leading-none italic">{selectedNodeDetails.churchRuler}</p>
                </div>
              </section>

              {/* Feudal Hierarchy Table */}
              <section>
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
                   <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">The Feudal Order</h4>
                   <span className="text-[9px] font-mono text-neutral-500 uppercase">Power Distribution</span>
                </div>
                <div className="space-y-4">
                  {(selectedNodeDetails.hierarchy || []).map((m, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-purple-500/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{m.rank}</span>
                           <span className="text-sm font-black text-white italic group-hover:text-purple-300 transition-colors">{m.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-600 group-hover:text-white transition-colors">{m.influence}%</span>
                      </div>
                      <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${m.influence}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button 
                onClick={() => onTravel?.([...navigationHistory.map(h => h.name), viewedNode.name, selectedNodeDetails.name])}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-[24px] hover:bg-purple-600 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
              >
                Embark to Domain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
