import React, { useEffect, useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Vote,
  Sparkles,
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
  const isGroupMode = sharedSettings.votingMode === 'group';

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="text-[11px] uppercase font-bold tracking-wider text-lime-400">
          Ronda de pistas
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">¡Momento de Hablar!</h1>
        <p className="text-xs text-slate-400 max-w-sm">
          Cada jugador da una pista en su turno sin ser demasiado obvio.
        </p>
      </div>

      {/* Categoría pública */}
      {sharedCategory && sharedSettings.showCategoryToAll && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900 border border-white/[0.08] text-xs">
            <span className="text-slate-400">Categoría:</span>
            <span className="font-bold text-white">{sharedCategory.name}</span>
          </div>
        </div>
      )}

      {/* Orador actual */}
      <Card className="flex flex-col items-center text-center p-6 gap-3 border-lime-500/30 bg-dark-900/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
          Le toca dar una pista a
        </span>

        <h2 className="text-3xl font-black text-white">{currentSpeaker}</h2>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleNextSpeaker}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Siguiente orador
        </Button>
      </Card>

      {/* Temporizador opcional si está activado */}
      {sharedSettings.debateDurationSeconds > 0 && (
        <Card className="flex flex-col items-center text-center p-4 gap-2 border-white/[0.06] bg-dark-900/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-lime-400" />
            <span>Tiempo restante</span>
          </div>

          <div
            className={`text-4xl font-mono font-bold ${
              secondsLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {formatTime(secondsLeft)}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-dark-850 hover:bg-dark-800"
            >
              {isTimerRunning ? 'Pausar' : 'Continuar'}
            </button>
            <button
              onClick={() => setSecondsLeft((s) => s + 30)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-dark-850 hover:bg-dark-800"
            >
              +30s
            </button>
          </div>
        </Card>
      )}

      {/* Orden de turnos compacto */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
        {turnOrderPlayers.map((name, idx) => {
          const isActive = idx === activeSpeakerIndex;
          return (
            <div
              key={idx}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-lime-500 text-dark-950 font-bold'
                  : 'bg-dark-900/70 border border-white/[0.06] text-slate-400'
              }`}
            >
              {idx + 1}. {name}
            </div>
          );
        })}
      </div>

      {/* Botón Ir a Votación */}
      <div className="pt-2">
        <Button
          size="xl"
          className="w-full py-4 text-base font-black"
          onClick={startSharedVoting}
          icon={<Vote className="w-5 h-5" />}
        >
          {isGroupMode ? 'Ir a la Votación en Grupo' : 'Comenzar Votación Secreta'}
        </Button>
      </div>
    </div>
  );
};
