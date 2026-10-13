import React from 'react';
import {
  Trophy,
  Skull,
  Shield,
  RotateCcw,
  SlidersHorizontal,
  Home,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';

export const SharedResultsScreen: React.FC = () => {
  const {
    sharedEndSummary,
    restartSharedGame,
    modifySharedConfig,
    setView,
  } = useGameStore();

  if (!sharedEndSummary) return null;

  const isNormalsWin = sharedEndSummary.winner === 'normals';

  const reasonLabels = {
    all_impostors_found: 'Descubrieron al impostor.',
    impostors_survived: 'El impostor pasó desapercibido y engañó a todos.',
    impostor_guessed_word: '¡El impostor adivinó la palabra secreta en su última oportunidad!',
    impostor_failed_guess: 'El impostor no logró adivinar la palabra exacta.',
    tie_second_round: 'Segundo empate en votación: Ganan los impostores por falta de consenso.',
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Banner de Victoria */}
      <Card
        className={`flex flex-col items-center text-center p-8 gap-3 border ${
          isNormalsWin
            ? 'bg-lime-500/10 border-lime-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isNormalsWin
              ? 'bg-lime-500 text-dark-950 font-bold'
              : 'bg-red-500 text-white font-bold'
          }`}
        >
          {isNormalsWin ? <Trophy className="w-7 h-7" /> : <Skull className="w-7 h-7" />}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Fin de la partida
          </span>
          <h1
            className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${
              isNormalsWin ? 'text-lime-400' : 'text-red-400'
            }`}
          >
            {isNormalsWin ? '¡Victoria Inocente!' : '¡Victoria del Impostor!'}
          </h1>
          <p className="text-xs text-slate-300 max-w-sm mt-0.5">
            {reasonLabels[sharedEndSummary.reason]}
          </p>
        </div>
      </Card>

      {/* Revelación de la Palabra Secreta */}
      <Card className="flex flex-col items-center text-center p-6 gap-1.5 border-white/[0.08] bg-dark-900/60">
        <span className="text-[11px] text-slate-400">
          Categoría: <strong className="text-white">{sharedEndSummary.categoryName}</strong>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-lime-400 mt-1">
          La palabra secreta era
        </span>
        <div className="text-3xl font-black text-white tracking-wider py-1">
          «{sharedEndSummary.secretWord}»
        </div>

        {sharedEndSummary.lastChanceGuess && (
          <div className="mt-2 p-2.5 bg-dark-950 rounded-xl border border-white/[0.06] text-xs flex items-center gap-2">
            {sharedEndSummary.lastChanceGuess.wasCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>
              Adivinanza del impostor: «
              <strong>{sharedEndSummary.lastChanceGuess.guessedWord}</strong>» (
              {sharedEndSummary.lastChanceGuess.wasCorrect ? 'Acertó' : 'Falló'})
            </span>
          </div>
        )}
      </Card>

      {/* Desglose de Jugadores */}
      <Card className="flex flex-col gap-3 border-white/[0.08] bg-dark-900/60">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Identidades de la ronda
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sharedEndSummary.players.map((p) => {
            const isImpostor = p.role === 'impostor';

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isImpostor
                    ? 'bg-red-950/20 border-red-500/30 text-red-200'
                    : 'bg-dark-950/60 border-white/[0.06] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isImpostor ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isImpostor ? <Skull className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">{p.name}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500">
                      {isImpostor ? 'Impostor' : 'Inocente'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-2 pt-1">
        <Button
          size="lg"
          className="flex-1 py-3 text-sm font-bold"
          onClick={restartSharedGame}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Revancha
        </Button>

        <Button
          size="lg"
          variant="secondary"
          onClick={modifySharedConfig}
          icon={<SlidersHorizontal className="w-4 h-4" />}
        >
          Ajustes
        </Button>

        <Button
          size="lg"
          variant="ghost"
          onClick={() => setView('home')}
          icon={<Home className="w-4 h-4" />}
        >
          Inicio
        </Button>
      </div>
    </div>
  );
};
