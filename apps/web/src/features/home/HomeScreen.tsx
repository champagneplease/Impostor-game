import React from 'react';
import {
  Smartphone,
  Wifi,
  BarChart3,
  FolderOpen,
  Settings,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';

export const HomeScreen: React.FC = () => {
  const { setView } = useGameStore();

  return (
    <div className="max-w-lg mx-auto px-4 py-12 md:py-16 flex flex-col gap-10 animate-fadeIn">
      {/* Hero Minimalista */}
      <section className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>Juego de deducción social</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          El Yilpostor
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
          Todos conocen la palabra secreta excepto uno. Da pistas sutiles, encuentra al impostor y vota para ganar.
        </p>
      </section>

      {/* Modalidades Principales */}
      <section className="flex flex-col gap-3">
        {/* Dispositivo Compartido */}
        <div
          onClick={() => setView('shared_setup')}
          className="group cursor-pointer select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setView('shared_setup')}
        >
          <div className="p-5 sm:p-6 rounded-2xl bg-dark-900 border border-white/[0.07] hover:border-red-500/40 hover:bg-dark-850 transition-all duration-200 flex items-center justify-between gap-4 shadow-sm active:scale-[0.99]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 group-hover:bg-red-500/15 group-hover:scale-105 transition-all">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  Dispositivo compartido
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-normal">
                  Un solo teléfono. Jueguen en grupo o pasando el turno.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>

        {/* Multijugador Online */}
        <div
          onClick={() => setView('online_entry')}
          className="group cursor-pointer select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setView('online_entry')}
        >
          <div className="p-5 sm:p-6 rounded-2xl bg-dark-900 border border-white/[0.07] hover:border-red-500/40 hover:bg-dark-850 transition-all duration-200 flex items-center justify-between gap-4 shadow-sm active:scale-[0.99]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 group-hover:bg-red-500/15 group-hover:scale-105 transition-all">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  Multijugador online
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-normal">
                  Cada uno desde su teléfono. Crea o únete a una sala con código.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>
      </section>

      {/* Accesos Secundarios en Línea Limpia */}
      <section className="grid grid-cols-4 gap-2 pt-4 border-t border-white/[0.06]">
        <button
          onClick={() => setView('categories')}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-dark-850 text-zinc-400 hover:text-white transition-all text-center group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-dark-850 group-hover:bg-red-500/10 border border-white/[0.06] group-hover:border-red-500/20 flex items-center justify-center transition-colors">
            <FolderOpen className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-xs font-medium">Categorías</span>
        </button>

        <button
          onClick={() => setView('stats')}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-dark-850 text-zinc-400 hover:text-white transition-all text-center group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-dark-850 group-hover:bg-red-500/10 border border-white/[0.06] group-hover:border-red-500/20 flex items-center justify-center transition-colors">
            <BarChart3 className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-xs font-medium">Estadísticas</span>
        </button>

        <button
          onClick={() => setView('rules')}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-dark-850 text-zinc-400 hover:text-white transition-all text-center group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-dark-850 group-hover:bg-red-500/10 border border-white/[0.06] group-hover:border-red-500/20 flex items-center justify-center transition-colors">
            <HelpCircle className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-xs font-medium">Reglas</span>
        </button>

        <button
          onClick={() => setView('settings')}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-dark-850 text-zinc-400 hover:text-white transition-all text-center group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-dark-850 group-hover:bg-red-500/10 border border-white/[0.06] group-hover:border-red-500/20 flex items-center justify-center transition-colors">
            <Settings className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-xs font-medium">Ajustes</span>
        </button>
      </section>
    </div>
  );
};
