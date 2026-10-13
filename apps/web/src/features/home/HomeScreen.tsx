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
import { Card } from '../../components/common/Card';
import { useGameStore } from '../../stores/useGameStore';

export const HomeScreen: React.FC = () => {
  const { setView } = useGameStore();

  return (
    <div className="max-w-xl mx-auto px-4 py-10 md:py-16 flex flex-col gap-10 animate-fadeIn">
      {/* Hero Minimalista Negro y Rojo */}
      <section className="text-center flex flex-col items-center gap-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
          El Yilpostor
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-sm leading-relaxed">
          Todos conocen la palabra secreta excepto uno. Da pistas, descubre al mentiroso y vota para ganar.
        </p>
      </section>

      {/* Modalidades Principales */}
      <section className="flex flex-col gap-3">
        {/* Dispositivo Compartido */}
        <div
          onClick={() => setView('shared_setup')}
          className="group cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setView('shared_setup')}
        >
          <Card
            variant="interactive"
            className="p-5 md:p-6 flex items-center justify-between gap-4 border-white/[0.08] hover:border-red-500/50 bg-dark-900/60 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                  Dispositivo compartido
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Un solo celular. Jueguen en grupo o pasando el turno.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
          </Card>
        </div>

        {/* Multijugador Online */}
        <div
          onClick={() => setView('online_entry')}
          className="group cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setView('online_entry')}
        >
          <Card
            variant="interactive"
            className="p-5 md:p-6 flex items-center justify-between gap-4 border-white/[0.08] hover:border-red-500/50 bg-dark-900/60 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                  Multijugador online
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cada uno desde su teléfono. Crea una sala privada con código en tiempo real.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
          </Card>
        </div>
      </section>

      {/* Accesos Secundarios en Línea Limpia */}
      <section className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
        <button
          onClick={() => setView('categories')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-dark-850/80 text-slate-400 hover:text-white transition-all text-center"
        >
          <FolderOpen className="w-4 h-4 text-red-400" />
          <span className="text-[11px] font-medium">Categorías</span>
        </button>

        <button
          onClick={() => setView('stats')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-dark-850/80 text-slate-400 hover:text-white transition-all text-center"
        >
          <BarChart3 className="w-4 h-4 text-red-400" />
          <span className="text-[11px] font-medium">Estadísticas</span>
        </button>

        <button
          onClick={() => setView('rules')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-dark-850/80 text-slate-400 hover:text-white transition-all text-center"
        >
          <HelpCircle className="w-4 h-4 text-red-400" />
          <span className="text-[11px] font-medium">Reglas</span>
        </button>

        <button
          onClick={() => setView('settings')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-dark-850/80 text-slate-400 hover:text-white transition-all text-center"
        >
          <Settings className="w-4 h-4 text-red-400" />
          <span className="text-[11px] font-medium">Ajustes</span>
        </button>
      </section>
    </div>
  );
};
