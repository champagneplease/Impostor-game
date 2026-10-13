import React from 'react';
import { Volume2, VolumeX, BookOpen, Home } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';

export const Header: React.FC = () => {
  const { currentView, setView, soundEnabled, setSoundEnabled } = useGameStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-950/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-left group transition-opacity hover:opacity-80 active:scale-95"
          aria-label="Ir al inicio"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-glow-red" />
          <span className="text-sm font-bold tracking-wider text-white uppercase">
            El Yilpostor
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {currentView !== 'home' && (
            <button
              onClick={() => setView('home')}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-850 transition-all active:scale-95"
              title="Volver al inicio"
              aria-label="Volver al inicio"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setView('rules')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-850 transition-all active:scale-95"
            title="Reglas del juego"
            aria-label="Ver reglas del juego"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-all active:scale-95 ${
              soundEnabled
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-dark-850'
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
