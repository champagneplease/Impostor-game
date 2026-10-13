import React, { useEffect, useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ArrowRight,
  Vote,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { audioService } from '../../services/audioService';

export const SharedDebateScreen: React.FC = () => {
  const {
    sharedPlayers,
    sharedCategory,
    sharedTurnOrder,
    sharedSettings,
    startSharedVoting,
  } = useGameStore();

  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(sharedSettings.debateDurationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(sharedSettings.debateDurationSeconds > 0);

  // Mapear IDs de turno a nombres
  const turnOrderPlayers = sharedTurnOrder.map((id) => {
    const idx = parseInt(id.replace('local_p_', ''), 10);
    return sharedPlayers[idx] || `Jugador ${idx + 1}`;
  });

  useEffect(() => {
    if (!isTimerRunning || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          audioService.playError();
          return 0;
        }
        if (prev <= 10) {
          audioService.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextSpeaker = () => {
    audioService.playClick();
    setActiveSpeakerIndex((prev) => (prev + 1) % turnOrderPlayers.length);
  };

  const currentSpeaker = turnOrderPlayers[activeSpeakerIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fadeIn">
      {/* Header de Fase */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="text-xs uppercase font-extrabold tracking-widest text-lime-400">
          Fase 2: Debate en ronda
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white">¡Momento de Hablar!</h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-md">
          Cada jugador da una pista en su turno. Cuidado con ser muy obvio o el impostor lo sabrá.
        </p>
      </div>

      {/* Categoría pública */}
      {sharedCategory && sharedSettings.showCategoryToAll && (
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-dark-850 border border-slate-700/80 text-slate-200">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span className="text-xs font-semibold text-slate-400">Categoría pública:</span>
            <span className="text-sm font-black text-white">{sharedCategory.name}</span>
          </div>
        </div>
      )}

      {/* Temporizador opcional */}
      {sharedSettings.debateDurationSeconds > 0 && (
        <Card className="flex flex-col items-center text-center p-6 gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-lime-400" />
            <span>Tiempo restante de debate</span>
          </div>

          <div
            className={`text-5xl md:text-6xl font-mono font-black tracking-tight ${
              secondsLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {formatTime(secondsLeft)}
          </div>

          {/* Controles de temporizador */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              icon={isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {isTimerRunning ? 'Pausar' : 'Reanudar'}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSecondsLeft((s) => s + 30);
                setIsTimerRunning(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              +30s
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSecondsLeft(sharedSettings.debateDurationSeconds);
                setIsTimerRunning(false);
              }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reiniciar
            </Button>
          </div>
        </Card>
      )}

      {/* Turno Actual del Orador */}
      <Card variant="highlight" className="flex flex-col items-center text-center p-6 gap-4">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-lime-400">
          Turno actual para dar una pista
        </span>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lime-500 text-dark-950 flex items-center justify-center font-black text-xl shadow-glow">
            {activeSpeakerIndex + 1}
          </div>
          <span className="text-2xl md:text-3xl font-black text-white">{currentSpeaker}</span>
        </div>

        <Button
          size="md"
          variant="secondary"
          onClick={handleNextSpeaker}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Siguiente orador
        </Button>
      </Card>

      {/* Orden de Turnos Completo */}
      <Card className="flex flex-col gap-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
          Orden completo de turnos
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {turnOrderPlayers.map((name, idx) => {
            const isActive = idx === activeSpeakerIndex;
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-lime-500/20 border-lime-500 text-lime-300 shadow-glow font-black'
                    : 'bg-dark-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="truncate">{name}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Botón Ir a Votación */}
      <div className="pt-2">
        <Button
          size="xl"
          className="w-full text-lg shadow-glow py-5"
          onClick={startSharedVoting}
          icon={<Vote className="w-6 h-6 stroke-[2.5]" />}
        >
          ¡Comenzar Votación Secreta!
        </Button>
      </div>
    </div>
  );
};
