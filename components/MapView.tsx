
import React, { useState, useEffect } from 'react';
import { MapNode, POI } from '../types';
import { WORLD_MAP } from '../constants';

interface MapViewProps {
  currentLocationPath: string[];
  onTravel?: (destination: string[]) => void;
}

const POIIcon: React.FC<{ type: POI['type'] }> = ({ type }) => {
  switch (type) {
    case 'THREAT': return <span className="text-red-500 text-[10px]">⚔️</span>;
    case 'WEALTH': return <span className="text-amber-400 text-[10px]">💰</span>;
    case 'INTEL': return <span className="text-blue-400 text-[10px]">📜</span>;
    default: return <span className="text-purple-400 text-[10px]">📍</span>;
  }
};

const MapView: React.FC<MapViewProps> = ({ currentLocationPath, onTravel }) => {
  const [viewedNode, setViewedNode] = useState<MapNode>(WORLD_MAP);
  const [navigationHistory, setNavigationHistory] = useState<MapNode[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  const handleZoomIn = (node: MapNode) => {
    if (node.children && node.children.length > 0) {
      setNavigationHistory([...navigationHistory, viewedNode]);
      setViewedNode(node);
      setSelectedPoi(null);
    }
  };

  const handleZoomOut = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(navigationHistory.slice(0, -1));
      setViewedNode(prev);
      setSelectedPoi(null);
    }
  };

  const isPlayerHere = (nodeName: string) => currentLocationPath.includes(nodeName);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Locator Bar */}
      <div className="px-5 py-3 bg-purple-900/10 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Your Location:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-md">
            {currentLocationPath.map((loc, i) => (
              <React.Fragment key={i}>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${i === currentLocationPath.length - 1 ? 'text-white' : 'text-neutral-600'}`}>
                  {loc}
                </span>
                {i < currentLocationPath.length - 1 && <span className="text-neutral-800 text-[8px] mx-1">/</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleZoomOut}
            disabled={navigationHistory.length === 0}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all border border-white/5"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Breadcrumb Map Navigator */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-col gap-1 bg-[#111] shrink-0">
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.4em]">{viewedNode.type}</span>
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
          {viewedNode.name}
        </h2>
      </div>

      {/* Map Content */}
      <div className="flex-1 p-6 overflow-y-auto no-scrollbar relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 to-black">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewedNode.children?.map((node) => (
            <div
              key={node.id}
              className={`group relative p-6 rounded-3xl border transition-all ${
                isPlayerHere(node.name) 
                ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.1)]' 
                : 'bg-neutral-900/40 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-1 h-1 rounded-full ${node.type === 'VILLAGE' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">{node.type}</span>
                </div>
                
                <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
                  {node.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-mono text-neutral-600 uppercase tracking-widest mb-1">Nobility: {node.nobilityTitle}</span>
                    <span className="text-xs font-bold text-neutral-200">{node.nobilityRuler}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-mono text-neutral-600 uppercase tracking-widest mb-1">Church: {node.churchTitle}</span>
                    <span className="text-xs font-bold text-neutral-300">{node.churchRuler}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleZoomIn(node)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-neutral-400 border border-white/5 transition-all"
                >
                  {node.children && node.children.length > 0 ? 'Enter Domain' : 'Examine'}
                </button>
                {!isPlayerHere(node.name) && (
                  <button
                    onClick={() => {
                       const path = [...navigationHistory.map(h => h.name), viewedNode.name, node.name];
                       onTravel?.(path);
                    }}
                    className="px-4 bg-purple-600 hover:bg-purple-500 rounded-xl flex items-center justify-center transition-all shadow-lg text-white"
                    title="Begin Journey"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m5 9 7-7 7 7"/></svg>
                  </button>
                )}
              </div>

              {isPlayerHere(node.name) && (
                <div className="absolute top-4 right-4">
                   <div className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-[8px] font-black uppercase tracking-widest">You Are Here</div>
                </div>
              )}
            </div>
          ))}
          
          {(!viewedNode.children || viewedNode.children.length === 0) && (
            <div className="col-span-full py-20 text-center">
              <p className="text-neutral-600 font-mono text-xs uppercase tracking-widest">This territory remains uncharted or insignificant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
