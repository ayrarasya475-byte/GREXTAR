import React, { useState } from 'react';
import { Heart, Copy, Download, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prompt, Model } from '../types';
import { db, handleFirestoreError, OperationType, auth, signInWithGoogle } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface PromptCardProps {
  prompt: Prompt;
  model?: Model;
}

export default function PromptCard({ prompt, model }: PromptCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const checkAuth = async () => {
    if (!auth?.currentUser) {
      if (confirm('Anda harus login terlebih dahulu. Login sekarang?')) {
        await signInWithGoogle();
        return !!auth?.currentUser;
      }
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (liked) return;
    if (!(await checkAuth())) return;
    
    try {
      await updateDoc(doc(db, 'prompts', prompt.id), {
        likes: increment(1)
      });
      setLiked(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `prompts/${prompt.id}`);
    }
  };

  const handleCopy = async () => {
    if (!(await checkAuth())) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      await updateDoc(doc(db, 'prompts', prompt.id), {
        copyCount: increment(1)
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `prompts/${prompt.id}`);
    }
  };

  const handleDownload = async () => {
    if (!(await checkAuth())) return;
    
    try {
      const blob = new Blob([prompt.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await updateDoc(doc(db, 'prompts', prompt.id), {
        downloadCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `prompts/${prompt.id}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden flex flex-col group h-full transition-shadow hover:shadow-amber-500/5"
    >
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-1.5">
          <span className={cn(
            "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none",
            prompt.category === 'legal' ? "border-emerald-500/20 text-emerald-400" : "border-rose-500/20 text-rose-400"
          )}>
            {prompt.category}
          </span>
          <span className="text-zinc-700 text-[8px] font-black uppercase tracking-tighter">
            {model?.name || 'GENERIC'}
          </span>
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-tight mb-1 text-white group-hover:text-amber-500 transition-colors">
          {prompt.name}
        </h3>
        <p className="text-zinc-600 text-[9px] line-clamp-2 leading-relaxed font-medium uppercase tracking-tighter">
          {prompt.content}
        </p>
      </div>
      
      <div className="bg-black/20 p-2.5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className={cn(
              "p-1 rounded flex items-center gap-1 transition-all",
              liked ? "text-rose-500" : "text-zinc-700 hover:text-rose-500"
            )}
          >
            <Heart size={10} fill={liked ? "currentColor" : "none"} />
            <span className="text-[8px] font-black">{prompt.likes}</span>
          </button>
        </div>

        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="flex items-center gap-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-500 px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest transition-all"
          >
            {copied ? <Check size={8} className="text-emerald-400" /> : <Copy size={8} />}
            {copied ? 'DONE' : 'COPY'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            className="bg-zinc-100 hover:bg-white text-black px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest transition-all shadow-xl"
          >
            GET .TXT
          </button>
        </div>
      </div>
    </motion.div>
  );
}
