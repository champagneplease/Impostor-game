import React from 'react';
import { ShieldAlert, Volume2, VolumeX, BookOpen, Home } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';

export const Header: React.FC = () => {
  const { currentView, setView, soundEnabled, setSoundEnabled } = useGameStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          aria-label="Ir al inicio"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-dark-950 shadow-glow">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white block leading-none">
              EL IMPOSTOR
            </span>
            <span className="text-[10px] tracking-widest text-lime-400 uppercase font-semibold">
              Edición Amigos
            </span>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentView !== 'home' && (
            <button
              onClick={() => setView('home')}
              className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
              title="Volver al inicio"
              aria-label="Volver al inicio"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setView('rules')}
            className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Reglas del juego"
            aria-label="Ver reglas del juego"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-lime-500/10 border-lime-500/30 text-lime-400 hover:bg-lime-500/20'
                : 'bg-dark-850 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
