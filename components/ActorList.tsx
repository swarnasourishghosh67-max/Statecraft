
import React from 'react';
import { Faction } from '../types';

interface ActorListProps {
  factions: Faction[];
}

const ActorList: React.FC<ActorListProps> = ({ factions }) => {
  return (
    <section>
      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">Institutional Actors</h3>
      <div className="flex flex-col gap-3">
        {factions.map(faction => (
          // Fixed: Removed non-existent 'status' check and simplified classNames
          <div 
            key={faction.id} 
            className="p-3 border rounded transition-colors bg-neutral-900/40 border-neutral-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-neutral-300">{faction.name}</h4>
                <p className="text-[10px] text-neutral-500 font-mono uppercase">{faction.leader}</p>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                {/* Fixed: Replaced 'loyalty' with 'opinion' to match Faction interface */}
                <div className="flex justify-between text-neutral-500 mb-0.5 uppercase font-bold">Opinion <span className="text-neutral-300">{faction.opinion}%</span></div>
                <div className="w-full h-1 bg-neutral-800">
                  <div className="h-full bg-blue-500" style={{ width: `${faction.opinion}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-neutral-500 mb-0.5 uppercase font-bold">Influence <span className="text-neutral-300">{faction.influence}%</span></div>
                <div className="w-full h-1 bg-neutral-800">
                  <div className="h-full bg-orange-500" style={{ width: `${faction.influence}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActorList;