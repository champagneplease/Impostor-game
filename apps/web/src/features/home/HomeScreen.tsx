import React, { useState } from 'react';
import {
  Users,
  Smartphone,
  Wifi,
  Sparkles,
  BarChart3,
  FolderOpen,
  Settings,
  HelpCircle,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';

export const HomeScreen: React.FC = () => {
  const { setView } = useGameStore();
  const [showModeSelector, setShowModeSelector] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-8 animate-fadeIn">
      {/* Hero Header */}
      <section className="text-center flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡El juego social definitivo para tus juntadas!</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-none">
          ¿Quién es el <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">
            Impostor?
          </span>
        </h1>

        <p className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
          Todos conocen la palabra secreta excepto uno. Da pistas ingeniosas, descubre quién miente
          y vota para expulsarlo antes de que adivine la verdad.
        </p>

        {/* Botón Principal JUGAR */}
        {!showModeSelector ? (
          <div className="w-full max-w-md pt-2">
            <Button
              size="xl"
              className="w-full text-xl shadow-glow py-5"
              onClick={() => setShowModeSelector(true)}
              icon={<Flame className="w-6 h-6 stroke-[2.5]" />}
            >
              ¡Jugar Ahora!
            </Button>
          </div>
        ) : (
          /* Selector de Modo */
          <div className="w-full flex flex-col gap-4 pt-2 animate-fadeIn">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-lime-400 text-center">
              Selecciona cómo quieres jugar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Modo 1: Dispositivo Compartido */}
              <button
                onClick={() => setView('shared_setup')}
                className="text-left group transition-all"
              >
                <Card
                  variant="interactive"
                  className="h-full flex flex-col justify-between border-slate-700/80 group-hover:border-lime-500"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-lime-300 flex items-center justify-between">
                        Dispositivo compartido
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Un solo celular o computadora, todos jugando por turnos.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-lime-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Offline (Sin internet)</span>
                  </div>
                </Card>
              </button>

              {/* Modo 2: Multijugador Online */}
              <button
                onClick={() => setView('online_entry')}
                className="text-left group transition-all"
              >
                <Card
                  variant="interactive"
                  className="h-full flex flex-col justify-between border-slate-700/80 group-hover:border-lime-500"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-300 flex items-center justify-between">
                        Multijugador online
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Cada uno desde su propio celular. Crea una sala y comparte el código.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sincronizado en tiempo real</span>
                  </div>
                </Card>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModeSelector(false)}
              className="text-slate-400 hover:text-white self-center"
            >
              Cancelar
            </Button>
          </div>
        )}
      </section>

      {/* Accesos Rápidos Secundarios */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => setView('categories')} className="text-left group">
          <Card variant="interactive" className="p-4 flex flex-col gap-2 h-full">
            <FolderOpen className="w-5 h-5 text-lime-400 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-white block">Categorías</span>
              <span className="text-[10px] text-slate-400">24 temas y +720 palabras</span>
            </div>
          </Card>
        </button>

        <button onClick={() => setView('stats')} className="text-left group">
          <Card variant="interactive" className="p-4 flex flex-col gap-2 h-full">
            <BarChart3 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-white block">Estadísticas</span>
              <span className="text-[10px] text-slate-400">Historial y clasificaciones</span>
            </div>
          </Card>
        </button>

        <button onClick={() => setView('rules')} className="text-left group">
          <Card variant="interactive" className="p-4 flex flex-col gap-2 h-full">
            <HelpCircle className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-white block">Reglas</span>
              <span className="text-[10px] text-slate-400">Guía rápida y consejos</span>
            </div>
          </Card>
        </button>

        <button onClick={() => setView('settings')} className="text-left group">
          <Card variant="interactive" className="p-4 flex flex-col gap-2 h-full">
            <Settings className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-white block">Ajustes</span>
              <span className="text-[10px] text-slate-400">Sonido y accesibilidad</span>
            </div>
          </Card>
        </button>
      </section>

      {/* Reglas Breves en Tarjeta */}
      <section className="bg-dark-900/60 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Users className="w-4 h-4 text-lime-400" />
          <span>¿Cómo se juega en 30 segundos?</span>
        </div>
        <ol className="text-xs md:text-sm text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
          <li>
            <strong className="text-white">Reparto secreto:</strong> Cada jugador ve su rol en privado. Los normales reciben una palabra secreta; el impostor no sabe cuál es.
          </li>
          <li>
            <strong className="text-white">Debate por turnos:</strong> Cada jugador dice una palabra o frase relacionada sin ser demasiado obvio.
          </li>
          <li>
            <strong className="text-white">Votación final:</strong> Debatan y voten por quién creen que es el impostor. ¡Si lo descubren, él tiene una última chance de adivinar la palabra para ganar!
          </li>
        </ol>
      </section>
    </div>
  );
};
