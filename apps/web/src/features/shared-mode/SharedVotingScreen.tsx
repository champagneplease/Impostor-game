import React, { useState } from 'react';
import { Vote, Check, Lock, EyeOff, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';

export const SharedVotingScreen: React.FC = () => {
  const {
    sharedPlayers,
    sharedVotingPlayerIdx,
    sharedVotingCurtainActive,
    sharedPhase,
    sharedTieCandidates,
    sharedSettings,
    submitSharedVote,
    advanceSharedVotingCurtain,
  } = useGameStore();

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const voters = sharedPlayers.map((name, idx) => ({
    id: `local_p_${idx}`,
    name,
  }));

  const currentVoter = voters[sharedVotingPlayerIdx];
  const isLastVoter = sharedVotingPlayerIdx === sharedPlayers.length - 1;

  if (!currentVoter) return null;

  // Filtrar candidatos elegibles para votar
  const eligibleCandidates = voters.filter((c) => {
    // Si no se permite auto-voto, excluir al votante actual
    if (!sharedSettings.allowSelfVote && c.id === currentVoter.id) {
      return false;
    }
    // Si estamos en desempate, solo se puede votar a los candidatos empatados
    if (sharedPhase === 'tie_breaker' && sharedTieCandidates) {
      return sharedTieCandidates.includes(c.id);
    }
    return true;
  });

  const handleConfirmVote = () => {
    if (!selectedTargetId) return;
    submitSharedVote(selectedTargetId);
    setSelectedTargetId(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn">
      {/* Progreso */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold mb-6">
        <span>
          {sharedPhase === 'tie_breaker' ? 'Votación de desempate' : 'Votación de acusación'}
        </span>
        <span className="text-lime-400 font-bold">
          {sharedVotingPlayerIdx + 1} de {sharedPlayers.length} votos
        </span>
      </div>

      {sharedPhase === 'tie_breaker' && (
        <div className="w-full mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs text-amber-300 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Hubo un empate. Voten únicamente entre los participantes empatados.</span>
        </div>
      )}

      {/* Pantalla 1: Cortina entre votantes (oculta el voto anterior) */}
      {sharedVotingCurtainActive ? (
        <Card className="w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400 shadow-glow">
            <Check className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-white">¡Voto Registrado en Secreto!</h2>
            <p className="text-xs text-slate-400">Nadie puede ver tu elección.</p>
          </div>

          <div className="p-3 bg-dark-950 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isLastVoter
                ? 'Todos han votado. Pulsa para revelar los resultados.'
                : 'Pasa el dispositivo al siguiente participante sin mostrar la pantalla.'}
            </span>
          </div>

          <Button
            size="xl"
            className="w-full py-4 text-lg shadow-glow mt-2"
            onClick={advanceSharedVotingCurtain}
          >
            {isLastVoter ? 'Revelar Resultados' : 'Siguiente Votante'}
          </Button>
        </Card>
      ) : (
        /* Pantalla 2: Boleta de votación privada */
        <Card className="w-full flex flex-col p-6 gap-6 shadow-2xl">
          <div className="text-center flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              Turno secreto de votación
            </span>
            <h2 className="text-2xl font-black text-white">{currentVoter.name}</h2>
            <p className="text-xs text-slate-400">
              ¿Quién crees que es el impostor? Selecciona a tu sospechoso:
            </p>
          </div>

          {/* Candidatos */}
          <div className="flex flex-col gap-2">
            {eligibleCandidates.map((cand) => {
              const isSelected = selectedTargetId === cand.id;
              return (
                <button
                  key={cand.id}
                  onClick={() => setSelectedTargetId(cand.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-lime-500/20 border-lime-500 text-white shadow-glow font-black'
                      : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-lime-400 bg-lime-400' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-dark-950" />}
                    </div>
                    <span className="text-sm font-bold">{cand.name}</span>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-bold text-lime-400">Sospechoso</span>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            size="xl"
            className="w-full py-4 text-base shadow-glow mt-2"
            onClick={handleConfirmVote}
            disabled={!selectedTargetId}
            icon={<Vote className="w-5 h-5" />}
          >
            Confirmar y Ocultar Voto
          </Button>
        </Card>
      )}
    </div>
  );
};
