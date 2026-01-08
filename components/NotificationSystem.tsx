
import React from 'react';
import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onAction: (id: string, action: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss, onAction }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[60] w-80 flex flex-col gap-4 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className="pointer-events-auto bg-neutral-900/90 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-10 duration-500"
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
              n.type === 'THREAT' ? 'bg-red-500 text-white' : 'bg-purple-600 text-white'
            }`}>
              {n.type}
            </span>
            <button onClick={() => onDismiss(n.id)} className="text-neutral-600 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{n.title}</h4>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed font-serif">{n.message}</p>
          
          {n.actionRequired && (
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onAction(n.id, 'ASSASSIN')}
                className="w-full py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all"
              >
                Send Assassin (●200)
              </button>
              <button 
                onClick={() => onAction(n.id, 'GUARDS')}
                className="w-full py-2 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
              >
                Double the Guards
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
