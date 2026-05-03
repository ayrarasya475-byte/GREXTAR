import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Database, X, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Prompt, Model } from '../types';
import { cn } from '../lib/utils';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'add' | 'model' | 'data' | 'ai' | 'suggestions'>('add');
  const [models, setModels] = useState<Model[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [aiConfig, setAiConfig] = useState({ activeType: 'default', customPrompt: '' });
  
  // Form States
  const [pName, setPName] = useState('');
  const [pContent, setPContent] = useState('');
  const [pModel, setPModel] = useState('');
  const [pCategory, setPCategory] = useState<'legal' | 'illegal'>('legal');
  
  const [mName, setMName] = useState('');

  useEffect(() => {
    if (!db) return;
    const unsubModels = onSnapshot(collection(db, 'models'), (snap) => {
      setModels(snap.docs.map(d => ({ id: d.id, ...d.data() } as Model)));
    }, (err) => console.debug("Admin Models listener suppressed"));
    const unsubPrompts = onSnapshot(collection(db, 'prompts'), (snap) => {
      setPrompts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prompt)));
    }, (err) => console.debug("Admin Prompts listener suppressed"));
    const unsubSuggestions = onSnapshot(collection(db, 'suggestions'), (snap) => {
      setSuggestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.debug("Admin Suggestions listener suppressed"));
    const unsubAi = onSnapshot(doc(db, 'config', 'ai_system'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAiConfig({
          activeType: data.activeType || 'default',
          customPrompt: data.customPrompt || ''
        });
      }
    }, (err) => console.debug("Admin Config listener suppressed"));
    return () => {
      unsubModels?.();
      unsubPrompts?.();
      unsubAi?.();
      unsubSuggestions?.();
    };
  }, []);

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pContent || !pModel) return;
    try {
      await addDoc(collection(db, 'prompts'), {
        name: pName,
        content: pContent,
        modelId: pModel,
        category: pCategory,
        likes: 0,
        copyCount: 0,
        downloadCount: 0,
        createdAt: serverTimestamp(),
      });
      setPName('');
      setPContent('');
      alert('Prompt added successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'prompts');
    }
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName) return;
    try {
      await addDoc(collection(db, 'models'), { name: mName });
      setMName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'models');
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('Hapus saran ini?')) return;
    try {
      await deleteDoc(doc(db, 'suggestions', id));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `suggestions/${id}`);
    }
  };

  const updateAiPrompt = async (updates: Partial<{ activeType: string, customPrompt: string }>) => {
    try {
      const configRef = doc(db, 'config', 'ai_system');
      await updateDoc(configRef, updates);
    } catch (error) {
      console.error("Failed to update AI Prompt:", error);
      // If document doesn't exist, try setDoc
      try {
        await setDoc(doc(db, 'config', 'ai_system'), { ...aiConfig, ...updates }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'config/ai_system');
      }
    }
  };
  const handleDeleteModel = async (id: string) => {
    if (!confirm('Delete this model?')) return;
    try {
      await deleteDoc(doc(db, 'models', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `models/${id}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="glass w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-500" />
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Command Center</h2>
              <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Authorized Access Only</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-white/5 bg-zinc-900/30 overflow-x-auto scrollbar-hide">
          {[
            { id: 'add', label: 'Systems' },
            { id: 'model', label: 'Kernels' },
            { id: 'data', label: 'Analytics' },
            { id: 'ai', label: 'Neural Link' },
            { id: 'suggestions', label: 'Inbound' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 min-w-[80px] py-3 text-[8px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                activeTab === tab.id ? 'bg-amber-500 text-black shadow-inner' : 'hover:bg-zinc-800 text-zinc-500'
              )}
            >
              {tab.label}
              {tab.id === 'suggestions' && suggestions.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => updateAiPrompt({ activeType: 'default' })}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left",
                    aiConfig.activeType === 'default' ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-zinc-800 text-zinc-600 hover:border-zinc-700"
                  )}
                >
                  <span className="text-[10px] font-black uppercase block mb-1">Prompt 1</span>
                  <span className="text-sm font-bold uppercase tracking-tight">Default System</span>
                </button>
                <button 
                  onClick={() => updateAiPrompt({ activeType: 'custom' })}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left",
                    aiConfig.activeType === 'custom' ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-zinc-800 text-zinc-600 hover:border-zinc-700"
                  )}
                >
                  <span className="text-[10px] font-black uppercase block mb-1">Prompt 2</span>
                  <span className="text-sm font-bold uppercase tracking-tight">Custom Overlay</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 mb-1 block">Custom System Prompt (Prompt 2)</label>
                <textarea 
                  rows={8}
                  value={aiConfig.customPrompt}
                  onChange={(e) => setAiConfig({...aiConfig, customPrompt: e.target.value})}
                  onBlur={() => updateAiPrompt({ customPrompt: aiConfig.customPrompt })}
                  placeholder="Enter custom instructions for Graxtiar AI..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-amber-500/50 resize-none transition-all"
                />
                <p className="text-[9px] text-zinc-700 uppercase font-bold text-center">Changes are saved automatically on blur.</p>
              </div>
            </div>
          )}
          {activeTab === 'add' && (
            <form onSubmit={handleAddPrompt} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Prompt Name</label>
                <input 
                  type="text" value={pName} onChange={e => setPName(e.target.value)} required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Model</label>
                  <select 
                    value={pModel} onChange={e => setPModel(e.target.value)} required
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Model</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Category</label>
                  <select 
                    value={pCategory} onChange={e => setPCategory(e.target.value as any)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="legal">Legal</option>
                    <option value="illegal">Illegal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Prompt Content</label>
                <textarea 
                  rows={6} value={pContent} onChange={e => setPContent(e.target.value)} required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Publish Prompt
              </button>
            </form>
          )}

          {activeTab === 'model' && (
            <div className="space-y-6">
              <form onSubmit={handleAddModel} className="flex gap-2">
                <input 
                  type="text" value={mName} onChange={e => setMName(e.target.value)} placeholder="New Model Name (e.g. ChatGPT)"
                  className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
                />
                <button type="submit" className="bg-zinc-100 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all hover:bg-white">
                  Add
                </button>
              </form>
              <div className="grid grid-cols-2 gap-3">
                {models.map(m => (
                  <div key={m.id} className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-3 flex justify-between items-center group">
                    <span className="text-sm font-mono">{m.name}</span>
                    <button onClick={() => handleDeleteModel(m.id)} className="text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Total Views</span>
                  <span className="text-2xl font-display font-bold">{prompts.reduce((acc, p) => acc + (p.likes || 0), 0)}</span>
                </div>
                <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Total Copies</span>
                  <span className="text-2xl font-display font-bold">{prompts.reduce((acc, p) => acc + (p.copyCount || 0), 0)}</span>
                </div>
                <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Total Downloads</span>
                  <span className="text-2xl font-display font-bold">{prompts.reduce((acc, p) => acc + (p.downloadCount || 0), 0)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Top Performing Prompts</h4>
                {prompts.sort((a, b) => (b.copyCount + b.downloadCount) - (a.copyCount + a.downloadCount)).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 glass rounded-lg text-xs">
                    <span className="font-medium truncate w-1/2">{p.name}</span>
                    <div className="flex gap-4 text-zinc-400 font-mono">
                      <span title="Copies">C: {p.copyCount}</span>
                      <span title="Downloads">D: {p.downloadCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="py-12 text-center opacity-20">
                  <BarChart3 className="mx-auto mb-2" size={24} />
                  <p className="text-[10px] font-black uppercase tracking-widest">No inbound protocols</p>
                </div>
              ) : (
                suggestions.map(s => (
                  <div key={s.id} className="p-4 glass rounded-xl border-white/5 group relative">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 block mb-1">
                           Sender: {s.userEmail}
                         </span>
                         <h4 className="text-sm font-bold text-white">{s.promptName}</h4>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest",
                            s.category === 'illegal' ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-500"
                          )}>
                            {s.category}
                          </span>
                          <button 
                            onClick={() => handleDeleteSuggestion(s.id)}
                            className="p-1 hover:bg-rose-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                       </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                      {s.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
