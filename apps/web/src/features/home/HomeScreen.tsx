import React from 'react';
import {
  Smartphone,
  Wifi,
  Sparkles,
  BarChart3,
  FolderOpen,
  Settings,
  HelpCircle,
  ArrowRight,
  Shield,
  Eye,
  Vote,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';

export const HomeScreen: React.FC = () => {
  const { setView } = useGameStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8 animate-fadeIn">
      {/* Hero Minimalista */}
      <section className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Juego de deducción social</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
          El Impostor
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
          Todos conocen la palabra secreta excepto uno. Da pistas sutiles, descubre las mentiras y vota para ganar.
        </p>
      </section>

      {/* Selector Principal de Modalidades */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Modo 1: Dispositivo Compartido */}
        <div
          onClick={() => setView('shared_setup')}
          className="group cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setView('shared_setup')}
        >
          <Card
            variant="interactive"
            className="h-full flex flex-col justify-between p-6 rounded-3xl border-slate-800 bg-dark-900/90 group-hover:border-lime-500/60 transition-all duration-300"
          >
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center text-lime-400 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-lime-300 flex items-center justify-between">
                  Dispositivo compartido
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Un solo teléfono o computadora. Cada jugador mira su rol en secreto y pasa el turno.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-lime-400 font-medium">100% Offline</span>
              <span className="text-slate-500">3 a 16 jugadores</span>
            </div>
          </Card>
        </div>

        {/* Modo 2: Multijugador Online */}
        <div
          onClick={() => setView('online_entry')}
          className="group cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setView('online_entry')}
        >
          <Card
            variant="interactive"
            className="h-full flex flex-col justify-between p-6 rounded-3xl border-slate-800 bg-dark-900/90 group-hover:border-emerald-500/60 transition-all duration-300"
          >
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Wifi className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
                  Multijugador online
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Cada uno desde su celular. Crea una sala privada con código y juega sincronizado en tiempo real.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">Tiempo real</span>
              <span className="text-slate-500">Código de 5 letras</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Navegación Secundaria Minimalista */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          onClick={() => setView('categories')}
          className="p-3.5 rounded-2xl bg-dark-900/70 hover:bg-dark-850 border border-slate-800/80 hover:border-slate-700 text-left transition-all active:scale-95 group"
        >
          <FolderOpen className="w-4 h-4 text-lime-400 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-200 block">Categorías</span>
          <span className="text-[10px] text-slate-500">24 temas y palabras</span>
        </button>

        <button
          onClick={() => setView('stats')}
          className="p-3.5 rounded-2xl bg-dark-900/70 hover:bg-dark-850 border border-slate-800/80 hover:border-slate-700 text-left transition-all active:scale-95 group"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-200 block">Estadísticas</span>
          <span className="text-[10px] text-slate-500">Historial y victorias</span>
        </button>

        <button
          onClick={() => setView('rules')}
          className="p-3.5 rounded-2xl bg-dark-900/70 hover:bg-dark-850 border border-slate-800/80 hover:border-slate-700 text-left transition-all active:scale-95 group"
        >
          <HelpCircle className="w-4 h-4 text-sky-400 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-200 block">Reglas</span>
          <span className="text-[10px] text-slate-500">Cómo jugar</span>
        </button>

        <button
          onClick={() => setView('settings')}
          className="p-3.5 rounded-2xl bg-dark-900/70 hover:bg-dark-850 border border-slate-800/80 hover:border-slate-700 text-left transition-all active:scale-95 group"
        >
          <Settings className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-200 block">Ajustes</span>
          <span className="text-[10px] text-slate-500">Sonido y datos</span>
        </button>
      </section>

      {/* Reglas Rápidas en 3 Pasos */}
      <section className="bg-dark-900/40 border border-slate-800/60 rounded-3xl p-5 flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          ¿Cómo funciona en 3 pasos?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-dark-800 border border-slate-700/80 flex items-center justify-center text-lime-400 font-bold shrink-0 text-[11px]">
              1
            </div>
            <div>
              <strong className="text-white block font-semibold">Reparto secreto</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Los inocentes reciben la palabra. El impostor recibe solo su rol o una pista de 1 palabra.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-dark-800 border border-slate-700/80 flex items-center justify-center text-lime-400 font-bold shrink-0 text-[11px]">
              2
            </div>
            <div>
              <strong className="text-white block font-semibold">Debate por turnos</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Cada uno dice una pista sin ser obvio. El impostor debe fingir que sabe la palabra.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-dark-800 border border-slate-700/80 flex items-center justify-center text-lime-400 font-bold shrink-0 text-[11px]">
              3
            </div>
            <div>
              <strong className="text-white block font-semibold">Votación final</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Voten para descubrir al mentiroso. ¡Si lo atrapan, puede intentar adivinar la palabra!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
