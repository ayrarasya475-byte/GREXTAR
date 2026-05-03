import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, RotateCcw, Hash, Type, Calculator, Shield, Link, FileJson, Binary, AlignLeft, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

type ToolCategory = 'Text' | 'Crypto' | 'Dev' | 'Math';

interface Tool {
  id: string;
  name: string;
  icon: any;
  category: ToolCategory;
  description: string;
  run: (input: string) => string;
}

export default function Tools({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const tools: Tool[] = [
    { id: 'upper', name: 'UPPERCASE', icon: Type, category: 'Text', description: 'Convert text to all uppercase letters', run: (s) => s.toUpperCase() },
    { id: 'lower', name: 'lowercase', icon: Type, category: 'Text', description: 'Convert text to all lowercase letters', run: (s) => s.toLowerCase() },
    { id: 'rev', name: 'Reverse', icon: RotateCcw, category: 'Text', description: 'Reverse the character order', run: (s) => s.split('').reverse().join('') },
    { id: 'b64e', name: 'Base64 Enc', icon: Shield, category: 'Crypto', description: 'Encode string to Base64 format', run: (s) => btoa(s) },
    { id: 'b64d', name: 'Base64 Dec', icon: Shield, category: 'Crypto', description: 'Decode Base64 string', run: (s) => { try { return atob(s); } catch { return 'Invalid Base64'; } } },
    { id: 'json', name: 'JSON Format', icon: FileJson, category: 'Dev', description: 'Prettify and validate JSON data', run: (s) => { try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return 'Invalid JSON'; } } },
    { id: 'bin', name: 'Binary', icon: Binary, category: 'Dev', description: 'Convert text to binary sequence', run: (s) => s.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') },
    { id: 'hex', name: 'Hexadecimal', icon: Hash, category: 'Dev', description: 'Convert text to hexadecimal values', run: (s) => s.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ') },
    { id: 'rgbhex', name: 'RGB to Hex', icon: Calculator, category: 'Math', description: 'Input format: 255, 255, 255', run: (s) => {
      const match = s.match(/\d+/g);
      if (match && match.length >= 3) {
        return '#' + match.slice(0,3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
      }
      return 'Format: 255, 255, 255';
    }},
    { id: 'hexrgb', name: 'Hex to RGB', icon: Calculator, category: 'Math', description: 'Input format: #FFFFFF or FFFFFF', run: (s) => {
      let hex = s.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
      if (hex.length !== 6) return 'Invalid Hex (needs 6 digits)';
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgb(${r}, ${g}, ${b})`;
    }},
    { id: 'slug', name: 'URL Slug', icon: Link, category: 'Text', description: 'Convert titles to URL-friendly slugs', run: (s) => s.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') },
    { id: 'unix', name: 'Unix Timestamp', icon: Calculator, category: 'Math', description: 'Convert seconds to human date', run: (s) => {
      try { return new Date(parseInt(s) * 1000).toLocaleString(); } catch { return 'Invalid Timestamp'; }
    }},
  ];

  const activeTool = tools.find(t => t.id === activeToolId);

  const handleRun = () => {
    if (activeTool) setOutput(activeTool.run(input));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-[#0b0b0d] flex flex-col font-sans"
    >
      <header className="p-2.5 border-b border-white/5 flex justify-between items-center bg-zinc-900/30 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 rounded-lg">
            <Calculator size={12} className="text-black" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] leading-none text-white">Utility Core</h2>
            <span className="text-[7px] font-bold text-amber-500/50 uppercase tracking-tighter">System Operations</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 hover:text-white">
          <X size={16} />
        </button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-3 gap-3">
        {/* Sidebar Tools List */}
        <div className="w-full md:w-52 overflow-y-auto space-y-2 pr-1 scrollbar-hide shrink-0">
          {(['Text', 'Crypto', 'Dev', 'Math'] as ToolCategory[]).map(cat => (
            <div key={cat} className="space-y-1">
              <h3 className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-1 ml-1">{cat}</h3>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                {tools.filter(t => t.category === cat).map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => { setActiveToolId(tool.id); setOutput(''); }}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all text-left group",
                      activeToolId === tool.id ? "bg-zinc-100 text-black shadow-lg" : "bg-zinc-900/40 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <tool.icon size={11} className={cn(activeToolId === tool.id ? "text-amber-600" : "text-zinc-600 group-hover:text-amber-500")} />
                    <span className="text-[8px] font-black uppercase truncate tracking-tight">{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Workspace */}
        <div className="flex-1 glass rounded-[1.5rem] flex flex-col overflow-hidden border-white/5 relative">
          <AnimatePresence mode="wait">
            {!activeTool ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 text-zinc-700">
                  <Binary size={24} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Select a Module</h3>
                <p className="text-[8px] text-zinc-700 uppercase font-bold tracking-widest">Choose a system utility from the sidebar to begin</p>
              </motion.div>
            ) : (
              <motion.div 
                key={activeToolId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500">
                      <activeTool.icon size={16} />
                    </div>
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{activeTool.name}</h2>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{activeTool.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveToolId(null)}
                    className="md:hidden p-2 bg-zinc-900 rounded-lg text-zinc-500"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                  <div className="flex flex-col gap-2">
                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Input Data</label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste input here..."
                      className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl p-4 text-[10px] font-mono focus:outline-none focus:border-amber-500/20 resize-none transition-all text-zinc-300 placeholder:text-zinc-800"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Processed Output</label>
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-amber-500 whitespace-pre-wrap break-all overflow-auto relative group">
                      {output || <span className="text-zinc-800">No output generated yet.</span>}
                      {output && (
                        <button 
                          onClick={handleCopy}
                          className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white shadow-xl transition-all active:scale-90"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleRun}
                    disabled={!input.trim()}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10 active:scale-95"
                  >
                    Execute Module
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}

const Dev = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);
