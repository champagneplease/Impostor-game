import React from 'react';
import { Eye, EyeOff, Shield, Skull, HelpCircle, Lock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';

export const SharedRoleRevealScreen: React.FC = () => {
  const {
    sharedPlayers,
    sharedRoleAssignments,
    sharedRevealIndex,
    sharedIsCardFlipped,
    revealSharedRole,
    hideAndNextSharedRole,
    sharedSettings,
  } = useGameStore();

  const currentAssignment = sharedRoleAssignments[sharedRevealIndex];
  const playerName = sharedPlayers[sharedRevealIndex] || `Jugador ${sharedRevealIndex + 1}`;
  const isLastPlayer = sharedRevealIndex === sharedRoleAssignments.length - 1;

  if (!currentAssignment) return null;

  const isImpostor = currentAssignment.role === 'impostor';

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn">
      {/* Progreso */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold mb-6">
        <span>Reparto de roles</span>
        <span className="text-lime-400 font-bold">
          {sharedRevealIndex + 1} de {sharedRoleAssignments.length} jugadores
        </span>
      </div>

      {/* Pantalla 1: Cortina de Privacidad */}
      {!sharedIsCardFlipped ? (
        <Card className="w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl border-slate-700/80">
          <div className="w-20 h-20 rounded-3xl bg-dark-800 border-2 border-slate-700 flex items-center justify-center text-lime-400 shadow-glow">
            <Lock className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              Pasa el dispositivo a
            </span>
            <h2 className="text-3xl font-black text-white">{playerName}</h2>
          </div>

          <div className="p-3 bg-dark-950/80 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Asegúrate de que nadie más mire la pantalla antes de continuar.</span>
          </div>

          <Button
            size="xl"
            className="w-full py-4 text-lg shadow-glow mt-2"
            onClick={revealSharedRole}
            icon={<Eye className="w-6 h-6" />}
          >
            Ver mi rol
          </Button>
        </Card>
      ) : (
        /* Pantalla 2: Rol Revelado en Privado */
        <Card
          className={`w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl transition-all ${
            isImpostor ? 'border-red-500/50 bg-red-950/20' : 'border-lime-500/50 bg-dark-900'
          }`}
        >
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
              isImpostor
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-glow-red'
                : 'bg-lime-500/20 text-lime-400 border border-lime-500/40 shadow-glow'
            }`}
          >
            {isImpostor ? <Skull className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              {playerName}
            </span>
            <h2
              className={`text-2xl md:text-3xl font-black uppercase tracking-wide ${
                isImpostor ? 'text-red-400' : 'text-lime-400'
              }`}
            >
              {isImpostor ? '¡Eres el Impostor!' : 'Eres Inocente'}
            </h2>
          </div>

          {/* Información secreta */}
          <div className="w-full bg-dark-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
            {isImpostor ? (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Categoría
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {currentAssignment.categoryName}
                  </span>
                </div>

                {currentAssignment.hint ? (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block flex items-center justify-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Pista del Impostor
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
                      «{currentAssignment.hint}»
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Sin pistas activas. ¡Descubre la palabra escuchando a los demás!
                  </p>
                )}

                <p className="text-[11px] text-red-300 font-medium pt-1">
                  Tu objetivo: Finge que conoces la palabra y no dejes que te descubran.
                </p>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Categoría
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {currentAssignment.categoryName}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 block">
                    Palabra Secreta
                  </span>
                  <span className="text-2xl md:text-3xl font-black text-white tracking-wide block mt-1">
                    {currentAssignment.word}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  Tu objetivo: Da pistas que demuestren que sabes la palabra sin que el impostor la descubra.
                </p>
              </>
            )}
          </div>

          <Button
            size="xl"
            variant="secondary"
            className="w-full py-4 text-base"
            onClick={hideAndNextSharedRole}
            icon={<EyeOff className="w-5 h-5" />}
          >
            {isLastPlayer ? 'Ocultar y comenzar debate' : 'Ocultar y pasar al siguiente'}
          </Button>
        </Card>
      )}
    </div>
  );
};
