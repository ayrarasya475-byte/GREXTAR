import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, LogIn, User, Settings, Sparkles, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, doc, getDocs, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as AuthUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, signInWithGoogle } from './lib/firebase';
import { Prompt, Model } from './types';
import Sidebar from './components/Sidebar';
import PromptCard from './components/PromptCard';
import AdminPanel from './components/AdminPanel';
import SuggestionForm from './components/SuggestionForm';
import ChatPanel from './components/ChatPanel';
import AiChat from './components/AiChat';
import Tools from './components/Tools';
import PolicyPage from './components/PolicyPage';
import { cn } from './lib/utils';

export default function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  // Modal states
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showCS, setShowCS] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | 'faq' | null>(null);

  const handleOpenAdmin = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "911911911") {
      setShowAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert("Sandi Salah!");
    }
  };

  useEffect(() => {
    if (!db || !auth) return;

    // Initialize AI Config if not exists - only if signed in
    const initConfig = async () => {
      if (!auth?.currentUser) return;
      try {
        const configRef = doc(db, 'config', 'ai_system');
        const snap = await getDocs(collection(db, 'config'));
        const systemPromptExists = snap.docs.some(d => d.id === 'ai_system');
        
        if (!systemPromptExists) {
          await setDoc(configRef, {
            activeType: 'default',
            customPrompt: ''
          });
        }
      } catch (e) {
        console.debug("Config init suppressed (probably permissions):", e);
      }
    };
    
    // Run init config when user changes
    let unsubAuth: (() => void) | undefined;
    if (auth) {
      unsubAuth = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) initConfig();
      });
    }

    const unsubPrompts = onSnapshot(query(collection(db, 'prompts'), orderBy('createdAt', 'desc')), (snap) => {
      setPrompts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prompt)));
    }, (err) => console.debug("Prompts listener suppressed:", err));

    const unsubModels = onSnapshot(collection(db, 'models'), (snap) => {
      setModels(snap.docs.map(d => ({ id: d.id, ...d.data() } as Model)));
    }, (err) => console.debug("Models listener suppressed:", err));
    
    return () => {
      unsubPrompts?.();
      unsubModels?.();
      unsubAuth?.();
    };
  }, []);

  const filteredPrompts = prompts.filter(p => {
    const pName = p.name || '';
    const pContent = p.content || '';
    const matchesSearch = pName.toLowerCase().includes(search.toLowerCase()) || 
                          pContent.toLowerCase().includes(search.toLowerCase());
    const matchesModel = !selectedModel || p.modelId === selectedModel;
    return matchesSearch && matchesModel;
  });

  const isAdmin = !!user;

  return (
    <div className="min-h-screen relative pb-20 selection:bg-amber-500/30">
      {!db && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-black py-2 text-center text-[10px] font-black uppercase tracking-widest">
          ⚠️ Firebase configuration is missing. Run "Set up Firebase" to enable all features.
        </div>
      )}
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <Sidebar 
        onOpenCS={() => setShowCS(true)} 
        onOpenSuggestion={() => setShowSuggestion(true)} 
        onOpenAi={() => setShowAi(true)}
        onOpenTools={() => setShowTools(true)}
        onOpenPolicy={(type) => setPolicyType(type)}
      />

      {/* Top Right Actions */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button 
          onClick={handleOpenAdmin}
          className="p-2.5 glass rounded-xl hover:bg-zinc-800 transition-all text-amber-500 group active:scale-90"
          title="Admin Panel"
        >
          <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>

        {user ? (
          <div className="flex items-center gap-2 glass pl-2.5 pr-1 py-1 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 hidden sm:block">
              {user.displayName?.split(' ')[0] || 'User'}
            </span>
            <img src={user.photoURL || ''} alt="avatar" className="w-7 h-7 rounded-lg border border-zinc-700" />
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-black px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95"
          >
            <LogIn size={14} /> LOGIN
          </button>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-20 sm:pt-28">
        {/* Branding Section */}
        <section className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 glass rounded-full mb-3 border border-amber-500/10"
          >
            <Sparkles size={8} className="text-amber-500" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-amber-500">Premium Collection</span>
          </motion.div>
          
          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600">
            GREXTAR
          </h1>
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-bold max-w-[200px] sm:max-w-[240px] mx-auto leading-relaxed uppercase tracking-widest">
            Expert Prompt Systems • Secure • Real-Time
          </p>
        </section>

        {/* Search & Filter Section */}
        <section className="max-w-sm mx-auto mb-6 sm:mb-8 space-y-2.5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700 transition-colors group-focus-within:text-amber-500" size={12} />
            <input 
              type="text"
              placeholder="Search prompt systems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-[9px] transition-all focus:outline-none focus:border-amber-500/20 placeholder:text-zinc-800 font-bold uppercase tracking-widest"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            <button 
              onClick={() => setSelectedModel(null)}
              className={cn(
                "px-2 py-1 rounded-lg text-[6px] sm:text-[7px] font-black uppercase tracking-[0.1em] transition-all glass active:scale-95",
                !selectedModel ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10" : "text-zinc-600 hover:text-zinc-100"
              )}
            >
              All Systems
            </button>
            {models.map(m => (
              <button 
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[6px] sm:text-[7px] font-black uppercase tracking-[0.1em] transition-all glass active:scale-95",
                  selectedModel === m.id ? "bg-amber-500 text-black" : "text-zinc-600 hover:text-white"
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
        </section>

        {/* Prompts Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPrompts.map((p) => (
                <div key={p.id} className="h-full">
                  <PromptCard prompt={p} model={models.find(m => m.id === p.modelId)} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-2xl border-dashed border-white/5">
            <ShieldAlert size={24} className="mx-auto text-zinc-800 mb-2" />
            <h3 className="text-[10px] font-bold uppercase text-zinc-700 tracking-widest">No protocols detected</h3>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="glass w-full max-w-[260px] rounded-2xl p-5 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-[9px] font-black tracking-[0.2em] text-zinc-400 uppercase">Identity Verification</h3>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600">
                  <X size={14} />
                </button>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <input 
                  type="password"
                  placeholder="CODE..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoFocus
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] focus:outline-none focus:border-amber-500/30 transition-all text-center tracking-[0.6em] font-black placeholder:tracking-normal placeholder:text-zinc-800"
                />
                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-[9px] tracking-[0.2em] uppercase transition-all shadow-lg shadow-amber-500/10 active:scale-95"
                >
                  Confirm Identity
                </button>
              </form>
            </div>
          </motion.div>
        )}
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
        {showSuggestion && <SuggestionForm onClose={() => setShowSuggestion(false)} />}
        {showAi && <AiChat onClose={() => setShowAi(false)} />}
        {showTools && <Tools onClose={() => setShowTools(false)} />}
        {policyType && <PolicyPage type={policyType} onClose={() => setPolicyType(null)} />}
      </AnimatePresence>
      
      {showCS && <ChatPanel onClose={() => setShowCS(false)} />}

      <footer className="mt-20 border-t border-zinc-900/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tighter">GREXTAR</span>
            <span className="text-[9px] text-zinc-700 font-mono">© 2026 WORLD CLASS ENGINEER</span>
          </div>
          <div className="flex gap-6 text-[8px] font-black uppercase tracking-widest text-zinc-600">
            <button onClick={() => setPolicyType('privacy')} className="hover:text-amber-500 transition-colors">Privacy</button>
            <button onClick={() => setPolicyType('terms')} className="hover:text-amber-500 transition-colors">Terms</button>
            <button onClick={() => setPolicyType('faq')} className="hover:text-amber-500 transition-colors">FAQ</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

