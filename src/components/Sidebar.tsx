import { useState } from 'react';
import { 
  Headset, Lightbulb, ShieldCheck, HelpCircle, 
  Menu, X, Terminal, Box, FileText, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface SidebarProps {
  onOpenCS: () => void;
  onOpenSuggestion: () => void;
  onOpenAi: () => void;
  onOpenTools: () => void;
  onOpenPolicy: (type: 'privacy' | 'terms' | 'faq') => void;
}

export default function Sidebar({ onOpenCS, onOpenSuggestion, onOpenAi, onOpenTools, onOpenPolicy }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Terminal, label: 'Graxtiar AI', action: onOpenAi, color: 'text-amber-500' },
    { icon: Box, label: 'Utility Tools', action: onOpenTools, color: 'text-emerald-500' },
    { icon: Lightbulb, label: 'Kirim Saran', action: onOpenSuggestion, color: 'text-zinc-400' },
    { icon: Headset, label: 'Customer Service', action: onOpenCS, color: 'text-zinc-400' },
  ];

  const legalItems = [
    { icon: ShieldCheck, label: 'Privacy Policy', action: () => onOpenPolicy('privacy') },
    { icon: FileText, label: 'Terms of Service', action: () => onOpenPolicy('terms') },
    { icon: HelpCircle, label: 'FAQ', action: () => onOpenPolicy('faq') },
  ];

  return (
    <div className="fixed top-6 left-6 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 glass rounded-2xl hover:bg-zinc-800 transition-all flex items-center gap-3 group active:scale-95 shadow-2xl"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} className="text-amber-500 group-hover:rotate-12 transition-transform" />}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Explore</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute top-0 left-0 w-64 glass rounded-[2.5rem] p-6 z-50 mt-16 shadow-2xl border-white/5"
            >
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-4 mb-2">Main Systems</p>
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { item.action(); setIsOpen(false); }}
                    className="flex items-center gap-4 w-full p-4 hover:bg-white/5 rounded-2xl transition-all group"
                  >
                    <item.icon size={18} className={cn("transition-colors", item.color)} />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-1.5">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-4 mb-2">Transparency</p>
                {legalItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { item.action(); setIsOpen(false); }}
                    className="flex items-center gap-4 w-full p-3.5 hover:bg-white/5 rounded-2xl transition-all group"
                  >
                    <item.icon size={16} className="text-zinc-600" />
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
