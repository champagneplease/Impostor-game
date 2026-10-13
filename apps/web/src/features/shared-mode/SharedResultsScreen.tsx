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
  HelpCircle,
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
    all_impostors_found: 'Los ciudadanos descubrieron al impostor en la votación.',
    impostors_survived: 'El impostor logró confundir a todos y pasó desapercibido.',
    impostor_guessed_word: '¡El impostor descubrió la palabra secreta en su última oportunidad!',
    impostor_failed_guess: 'El impostor no logró adivinar la palabra secreta.',
    tie_second_round: 'Segundo empate en votación: Ganan los impostores por falta de consenso.',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Banner de Victoria */}
      <Card
        className={`flex flex-col items-center text-center p-8 gap-4 border shadow-2xl ${
          isNormalsWin
            ? 'bg-lime-500/10 border-lime-500/50 shadow-glow'
            : 'bg-red-500/10 border-red-500/50 shadow-glow-red'
        }`}
      >
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
            isNormalsWin
              ? 'bg-lime-500 text-dark-950 shadow-glow'
              : 'bg-red-500 text-white shadow-glow-red'
          }`}
        >
          {isNormalsWin ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
            Fin de la partida
          </span>
          <h1
            className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${
              isNormalsWin ? 'text-lime-400' : 'text-red-400'
            }`}
          >
            {isNormalsWin ? '¡Victoria Ciudadana!' : '¡Victoria del Impostor!'}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-md mt-1">
            {reasonLabels[sharedEndSummary.reason]}
          </p>
        </div>
      </Card>

      {/* Revelación de la Palabra Secreta */}
      <Card className="flex flex-col items-center text-center p-6 gap-2 bg-dark-850 border-slate-700/80">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Categoría: {sharedEndSummary.categoryName}
        </span>
        <span className="text-xs uppercase font-extrabold tracking-widest text-lime-400">
          La palabra secreta era
        </span>
        <div className="text-3xl md:text-4xl font-black text-white tracking-wide py-1">
          «{sharedEndSummary.secretWord}»
        </div>

        {sharedEndSummary.lastChanceGuess && (
          <div className="mt-2 p-3 bg-dark-950 rounded-2xl border border-slate-800 text-xs flex items-center gap-2">
            {sharedEndSummary.lastChanceGuess.wasCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>
              Adivinanza del impostor: «
              <strong>{sharedEndSummary.lastChanceGuess.guessedWord}</strong>» (
              {sharedEndSummary.lastChanceGuess.wasCorrect ? 'Acertada' : 'Fallida'})
            </span>
          </div>
        )}
      </Card>

      {/* Desglose de Jugadores y Votos */}
      <Card className="flex flex-col gap-3">
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
          Roles de los participantes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sharedEndSummary.players.map((p) => {
            const isImpostor = p.role === 'impostor';
            const votesReceived = sharedEndSummary.votingResult?.voteCounts[p.id] || 0;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isImpostor
                    ? 'bg-red-950/30 border-red-500/40 text-red-200'
                    : 'bg-dark-950 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isImpostor ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isImpostor ? <Skull className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold block leading-tight">{p.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {isImpostor ? 'Impostor' : 'Inocente'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-300">
                    {votesReceived} {votesReceived === 1 ? 'voto' : 'votos'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          size="xl"
          className="flex-1 shadow-glow"
          onClick={restartSharedGame}
          icon={<RotateCcw className="w-5 h-5" />}
        >
          ¡Revancha Rápida!
        </Button>

        <Button
          size="xl"
          variant="secondary"
          onClick={modifySharedConfig}
          icon={<SlidersHorizontal className="w-5 h-5" />}
        >
          Ajustes
        </Button>

        <Button
          size="xl"
          variant="ghost"
          onClick={() => setView('home')}
          icon={<Home className="w-5 h-5" />}
        >
          Inicio
        </Button>
      </div>
    </div>
  );
};
