import React from 'react';
import { Eye, EyeOff, Shield, Skull, Lock, Sparkles, HelpCircle } from 'lucide-react';
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
      {/* Indicador de Turno Superior */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-medium mb-6">
        <span>Reparto de roles</span>
        <span className="text-lime-400 font-bold bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/20">
          {sharedRevealIndex + 1} de {sharedRoleAssignments.length}
        </span>
      </div>

      {/* Pantalla 1: Cortina de Privacidad */}
      {!sharedIsCardFlipped ? (
        <Card className="w-full flex flex-col items-center text-center p-8 gap-6 rounded-3xl border-slate-800 bg-dark-900/95 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-dark-850 border border-slate-700/80 flex items-center justify-center text-slate-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
              Pásale el dispositivo a
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">{playerName}</h2>
          </div>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Asegúrate de que nadie más mire la pantalla antes de revelar tu identidad.
          </p>

          <Button
            size="xl"
            className="w-full py-4 text-base shadow-glow mt-1"
            onClick={revealSharedRole}
            icon={<Eye className="w-5 h-5" />}
          >
            Ver mi rol
          </Button>
        </Card>
      ) : (
        /* Pantalla 2: Rol Revelado en Privado */
        <Card
          className={`w-full flex flex-col items-center text-center p-8 gap-5 rounded-3xl shadow-2xl transition-all border ${
            isImpostor
              ? 'border-red-500/40 bg-gradient-to-b from-dark-900 via-red-950/20 to-dark-950'
              : 'border-lime-500/40 bg-gradient-to-b from-dark-900 via-lime-950/20 to-dark-950'
          }`}
        >
          {/* Badge del Jugador */}
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
            {playerName}
          </span>

          {/* Icono y Título del Rol */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isImpostor
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
              }`}
            >
              {isImpostor ? <Skull className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
            </div>

            <h2
              className={`text-2xl font-black tracking-tight uppercase ${
                isImpostor ? 'text-red-400' : 'text-lime-400'
              }`}
            >
              {isImpostor ? 'Eres el Impostor' : 'Eres Inocente'}
            </h2>
          </div>

          {/* Caja Central de Contenido Secreto */}
          <div className="w-full bg-dark-950/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col gap-3">
            {isImpostor ? (
              <div className="flex flex-col items-center gap-2">
                {sharedSettings.showCategoryToAll && (
                  <div className="text-[11px] text-slate-400">
                    Categoría: <strong className="text-white">{currentAssignment.categoryName}</strong>
                  </div>
                )}

                {currentAssignment.hint ? (
                  <div className="py-2 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Pista del impostor (1 palabra)
                    </span>
                    <span className="text-3xl md:text-4xl font-black text-amber-300 tracking-wider mt-1 uppercase">
                      «{currentAssignment.hint}»
                    </span>
                    <p className="text-[11px] text-slate-400 mt-2 text-center">
                      Usa esta palabra para participar sin que sospechen de ti.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3">
                    Modo sin pistas. ¡Escucha con atención lo que dicen los demás para adivinar la palabra!
                  </p>
                )}

                <p className="text-[11px] text-red-300/80 font-medium">
                  Objetivo: Finge que conoces la palabra y evita que te voten.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Categoría: <strong className="text-white">{currentAssignment.categoryName}</strong>
                </span>

                <div className="py-2 flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400/90">
                    Palabra Secreta
                  </span>
                  <span className="text-3xl md:text-4xl font-black text-white tracking-wider mt-1">
                    {currentAssignment.word}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Objetivo: Da una pista inteligente sin ser demasiado obvio.
                </p>
              </div>
            )}
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="w-full py-3.5 text-sm font-bold border-slate-700/80 hover:border-slate-600 mt-1"
            onClick={hideAndNextSharedRole}
            icon={<EyeOff className="w-4 h-4" />}
          >
            {isLastPlayer ? 'Listo, comenzar debate' : 'Listo, pasar al siguiente'}
          </Button>
        </Card>
      )}
    </div>
  );
};
