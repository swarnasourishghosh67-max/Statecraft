
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await getChatbotResponse(newHistory);
      setHistory([...newHistory, { role: 'model', text: response }]);
    } catch (err) {
      setHistory([...newHistory, { role: 'model', text: "The sage is meditating. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="w-80 h-96 bg-neutral-900/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col backdrop-blur-2xl animate-in zoom-in-95 duration-300">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Chronicle Sage</span>
            <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {history.length === 0 && (
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest text-center mt-20 italic">Ask of the world's secrets...</p>
            )}
            {history.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-serif ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/5 text-neutral-300'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-neutral-600 animate-pulse font-mono">Scribe is writing...</div>}
          </div>
          <div className="p-3 border-t border-white/5 bg-black/40">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Inquire..."
                className="flex-1 bg-transparent border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button onClick={handleSend} className="p-2 bg-white rounded-xl hover:bg-purple-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-purple-500 hover:text-white hover:scale-110 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
