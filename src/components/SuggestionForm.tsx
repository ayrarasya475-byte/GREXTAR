import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType, signInWithGoogle } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';

export default function SuggestionForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'legal' | 'illegal'>('legal');
  const [desc, setDesc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser) {
      if (confirm('Anda harus login terlebih dahulu. Login sekarang?')) {
        await signInWithGoogle();
      }
      return;
    }
    try {
      await addDoc(collection(db, 'suggestions'), {
        promptName: name,
        category,
        description: desc,
        userEmail: auth?.currentUser?.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Saran berhasil dikirim ke system Grextar!');
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'suggestions');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div className="glass w-full max-w-md rounded-[2.5rem] p-8 border-white/5 shadow-2xll">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Send size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Kirim Saran</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] uppercase font-black text-zinc-500 mb-2 block tracking-widest px-1">Nama Prompt</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="e.g. Code Optimizer for Rust"
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-amber-500/30 transition-all font-medium text-zinc-200"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-zinc-500 mb-2 block tracking-widest px-1">Legalitas</label>
            <div className="flex gap-2">
              {(['legal', 'illegal'] as const).map(cat => (
                <button
                  key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${category === cat ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-zinc-500 mb-2 block tracking-widest px-1">Detail Deskripsi</label>
            <textarea 
              rows={4} value={desc} onChange={e => setDesc(e.target.value)} required
              placeholder="Jelaskan prompt yang Anda inginkan..."
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-amber-500/30 transition-all resize-none font-medium text-zinc-200"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-zinc-100 hover:bg-white text-black font-black py-4 rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] shadow-xl"
          >
            Submit System Suggestion
          </button>
        </form>
      </div>
    </motion.div>
  );
}
