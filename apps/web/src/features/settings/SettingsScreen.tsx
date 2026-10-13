import React from 'react';
import { ArrowLeft, Volume2, Eye, ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useGameStore } from '../../stores/useGameStore';
import { audioService } from '../../services/audioService';

export const SettingsScreen: React.FC = () => {
  const {
    setView,
    soundEnabled,
    setSoundEnabled,
    reducedMotion,
    setReducedMotion,
  } = useGameStore();

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) audioService.playClick();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
          Ajustes
        </span>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Preferencias del Sistema</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Configura la accesibilidad, sonido y consulta la versión de la aplicación.
        </p>
      </div>

      {/* Tarjeta de Preferencias */}
      <Card className="flex flex-col gap-5">
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
          Experiencia y Accesibilidad
        </h2>

        {/* Sonidos */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-center text-lime-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Efectos de sonido</span>
              <span className="text-xs text-slate-400">
                Sonidos sutiles sintetizados con Web Audio API (100% sin conexión)
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleSound}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              soundEnabled ? 'bg-lime-500' : 'bg-slate-700'
            }`}
            aria-label="Alternar sonidos"
          >
            <div
              className={`w-5 h-5 rounded-full bg-dark-950 shadow-md transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Movimiento Reducido */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-center text-sky-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Movimiento reducido</span>
              <span className="text-xs text-slate-400">
                Desactiva animaciones y transiciones dinámicas para mayor confort visual
              </span>
            </div>
          </div>

          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              reducedMotion ? 'bg-sky-500' : 'bg-slate-700'
            }`}
            aria-label="Alternar movimiento reducido"
          >
            <div
              className={`w-5 h-5 rounded-full bg-dark-950 shadow-md transition-transform ${
                reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Información del Sistema */}
      <Card className="flex flex-col gap-3">
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
          Información del Software
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400">Versión de la App</span>
            <span className="font-mono font-bold text-white">v1.0.0 (Release)</span>
          </div>

          <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400">Frontend Hosting</span>
            <span className="font-bold text-lime-400">Vercel (Estático)</span>
          </div>

          <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400">Backend Hosting</span>
            <span className="font-bold text-emerald-400">Render (Node.js)</span>
          </div>

          <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400">Almacenamiento</span>
            <span className="font-bold text-white">localStorage (v1)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
