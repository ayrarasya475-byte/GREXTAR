import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, FileText, HelpCircle, Lock } from 'lucide-react';

type PolicyType = 'privacy' | 'terms' | 'faq';

export default function PolicyPage({ type, onClose }: { type: PolicyType; onClose: () => void }) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: Shield,
      body: `
        ### Kami Menghargai Privasi Anda
        Data yang kami kumpulkan meliputi:
        - Informasi profil dasar (nama, email) melalui Google Login.
        - Riwayat penggunaan prompt (likes, downloads).
        
        ### Bagaimana Kami Menggunakan Data
        Kami menggunakan data untuk personalisasi pengalaman dan meningkatkan kualitas prompt.
        
        ### Keamanan
        Seluruh data disimpan di infrastruktur Firebase yang aman dengan enkripsi tingkat lanjut.
      `
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      body: `
        ### Penggunaan Layanan
        - Anda setuju untuk menggunakan prompt ini secara bertanggung jawab.
        - Dilarang keras menggunakan prompt untuk keperluan ilegal.
        
        ### Properti Intelekual
        Seluruh prompt yang ada di Grextar adalah milik komunitas dan kontributor kami.
        
        ### Batasan Tanggung Jawab
        Grextar tidak bertanggung jawab atas hasil yang dihasilkan oleh AI menggunakan prompt kami.
      `
    },
    faq: {
      title: 'Frequently Asked Questions',
      icon: HelpCircle,
      body: `
        ### Apa itu Grextar?
        Grextar adalah library prompt profesional untuk engineer elit.
        
        ### Apakah ini gratis?
        Ya, saat ini seluruh layanan Grextar dapat diakses secara gratis.
        
        ### Bagaimana cara menambahkan prompt?
        Anda bisa mengirim saran melalui menu "Kirim Saran".
        
        ### Apa itu Graxtiar AI?
        Asisten AI internal kami yang ditenagai oleh model Gemini terbaru.
      `
    }
  };

  const active = content[type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-[#0b0b0d] flex flex-col items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-3xl glass rounded-[2.5rem] flex flex-col h-full max-h-[85vh] overflow-hidden border-white/5">
        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <active.icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">{active.title}</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Grextar Legal & System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 prose prose-invert prose-amber prose-sm max-w-none">
          {/* Simple formatting since we don't have a markdown parser for this small bit yet, or I can just use line breaks */}
          {active.body.split('###').map((section, idx) => {
            if (!section.trim()) return null;
            const [title, ...lines] = section.split('\n');
            return (
              <div key={idx} className="space-y-4">
                <h3 className="text-amber-500 font-black uppercase tracking-widest text-xs mb-4">{title}</h3>
                <div className="text-zinc-400 leading-relaxed space-y-2">
                  {lines.map((line, lidx) => (
                    <p key={lidx}>{line.replace(/^- /, '• ')}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
        
        <footer className="p-6 bg-zinc-900/40 border-t border-white/5 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Verified System Document • Grextar V2.0</p>
        </footer>
      </div>
    </motion.div>
  );
}
