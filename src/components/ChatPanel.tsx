import React, { useState, useEffect, useRef } from 'react';
import { db, auth, handleFirestoreError, OperationType, signInWithGoogle } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { Message } from '../types';
import { X, Send, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db || !auth || !auth?.currentUser) return;
    
    const q = query(
      collection(db, 'messages'), 
      where('userId', '==', auth?.currentUser?.uid),
      orderBy('timestamp', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, (err) => console.debug("Chat Messages listener suppressed"));

    return () => unsub?.();
  }, [auth?.currentUser]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!auth?.currentUser) {
      if (confirm('Silakan login terlebih dahulu untuk menggunakan fitur ini. Sign in?')) {
        await signInWithGoogle();
      }
      return;
    }

    try {
      await addDoc(collection(db, 'messages'), {
        userId: auth?.currentUser?.uid,
        userEmail: auth?.currentUser?.email,
        text: text.trim(),
        sender: 'user',
        timestamp: serverTimestamp()
      });
      setText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[240px] sm:w-[280px] glass rounded-[2rem] flex flex-col h-[360px] shadow-2xl border-white/5 overflow-hidden">
      <div className="p-3 border-b border-white/5 flex justify-between items-center bg-zinc-900/40 backdrop-blur-3xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <div>
            <h3 className="font-black uppercase tracking-widest text-[8px]">GXT Support</h3>
            <p className="text-[6px] text-zinc-600 uppercase font-bold tracking-tighter">Secure Tunnel</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all">
          <X size={14} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide font-sans">
        {!auth?.currentUser ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-8 h-8 bg-zinc-800/50 rounded-xl flex items-center justify-center mb-2 text-zinc-700">
              <Lock size={14} />
            </div>
            <h4 className="text-[8px] font-black uppercase text-zinc-500 mb-1">Akses Terbatas</h4>
            <p className="text-[7px] text-zinc-700 uppercase font-black leading-relaxed mb-4 tracking-tight">Login to contact core support team</p>
            <button 
              onClick={signInWithGoogle}
              className="bg-amber-500 text-black px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center space-y-1 mt-6">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500/30">Secure Channel Active</p>
            <p className="text-[7px] text-zinc-700 uppercase font-black">Halo {auth?.currentUser?.displayName?.split(' ')[0] || 'Operator'}! Ada yang bisa kami bantu?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[85%] space-y-1",
              msg.sender === 'user' ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "px-2.5 py-1.5 rounded-[1rem] text-[9px] leading-relaxed",
                msg.sender === 'user' ? "bg-amber-500 text-black font-bold rounded-tr-none shadow-lg shadow-amber-500/5" : "bg-zinc-800/80 text-zinc-200 rounded-tl-none border border-white/5"
              )}>
                {msg.text}
              </div>
              <span className="text-[6px] text-zinc-700 font-bold uppercase px-1 tracking-tighter">
                {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-2 bg-zinc-900/50 border-t border-white/5 flex gap-1.5 shrink-0">
        <input 
          type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={auth?.currentUser ? "Tulis pesan..." : "Please login..."}
          disabled={!auth?.currentUser}
          className="flex-1 bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-[9px] focus:outline-none focus:border-amber-500/30 transition-all placeholder:text-zinc-800 font-bold uppercase tracking-widest"
        />
        <button 
          type="submit" 
          disabled={!auth?.currentUser || !text.trim()}
          className="bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-black p-2 rounded-lg transition-all active:scale-90 shadow-xl"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}
