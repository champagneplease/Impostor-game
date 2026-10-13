import React, { useState } from 'react';
import { Vote, Check, EyeOff, AlertTriangle, Users } from 'lucide-react';
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
    submitSharedGroupAccusation,
    advanceSharedVotingCurtain,
  } = useGameStore();

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const voters = sharedPlayers.map((name, idx) => ({
    id: `local_p_${idx}`,
    name,
  }));

  const isGroupMode = sharedSettings.votingMode === 'group';

  // ==========================================
  // 1. MODO EN GRUPO (Votación rápida sin pasar el celular)
  // ==========================================
  if (isGroupMode) {
    const handleGroupAccusation = () => {
      if (!selectedTargetId) return;
      submitSharedGroupAccusation(selectedTargetId);
    };

    const accusedPlayer = voters.find((v) => v.id === selectedTargetId);

    return (
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn">
        <Card className="w-full flex flex-col p-6 md:p-8 gap-6 border-white/[0.08] bg-dark-900/80">
          <div className="text-center flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-[11px] font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Votación en grupo</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              ¿A quién acusan?
            </h2>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Hablen en voz alta, lleguen a un acuerdo y elijan directamente al sospechoso:
            </p>
          </div>

          {/* Lista de candidatos */}
          <div className="flex flex-col gap-2">
            {voters.map((cand) => {
              const isSelected = selectedTargetId === cand.id;
              return (
                <button
                  key={cand.id}
                  onClick={() => setSelectedTargetId(cand.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-lime-500/15 border-lime-500 text-white font-bold'
                      : 'bg-dark-950/60 border-white/[0.06] text-slate-300 hover:border-slate-700 hover:bg-dark-850'
                  }`}
                >
                  <span className="text-sm font-semibold">{cand.name}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-lime-400 bg-lime-400' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-dark-950" />}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full mt-2"
            onClick={handleGroupAccusation}
            disabled={!selectedTargetId}
            icon={<Vote className="w-4 h-4" />}
          >
            {accusedPlayer ? `Acusar a ${accusedPlayer.name}` : 'Selecciona un sospechoso'}
          </Button>
        </Card>
      </div>
    );
  }

  // ==========================================
  // 2. MODO INDIVIDUAL (Por turnos con cortina de privacidad)
  // ==========================================
  const currentVoter = voters[sharedVotingPlayerIdx];
  const isLastVoter = sharedVotingPlayerIdx === sharedPlayers.length - 1;

  if (!currentVoter) return null;

  const eligibleCandidates = voters.filter((c) => {
    if (!sharedSettings.allowSelfVote && c.id === currentVoter.id) {
      return false;
    }
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
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-medium mb-6">
        <span>
          {sharedPhase === 'tie_breaker' ? 'Desempate' : 'Votación secreta'}
        </span>
        <span className="text-lime-400 font-bold bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/20">
          {sharedVotingPlayerIdx + 1} de {sharedPlayers.length}
        </span>
      </div>

      {sharedPhase === 'tie_breaker' && (
        <div className="w-full mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Hubo un empate. Voten entre los empatados.</span>
        </div>
      )}

      {/* Cortina entre turnos */}
      {sharedVotingCurtainActive ? (
        <Card className="w-full flex flex-col items-center text-center p-8 gap-5 border-white/[0.08] bg-dark-900/90">
          <div className="w-14 h-14 rounded-2xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center text-lime-400">
            <Check className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Voto registrado</h2>
            <p className="text-xs text-slate-400">Tu elección quedó en secreto.</p>
          </div>

          <div className="p-3 bg-dark-950 border border-white/[0.06] rounded-xl text-xs text-slate-300 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isLastVoter
                ? 'Todos han votado. Pulsa para revelar resultados.'
                : 'Pasa el celular al siguiente sin mostrar la pantalla.'}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full mt-2"
            onClick={advanceSharedVotingCurtain}
          >
            {isLastVoter ? 'Revelar Resultados' : 'Siguiente Votante'}
          </Button>
        </Card>
      ) : (
        /* Boleta de votación */
        <Card className="w-full flex flex-col p-6 md:p-8 gap-5 border-white/[0.08] bg-dark-900/90">
          <div className="text-center flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Vota en secreto
            </span>
            <h2 className="text-2xl font-black text-white">{currentVoter.name}</h2>
            <p className="text-xs text-slate-400">
              Selecciona a quién crees que es el impostor:
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
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-lime-500/15 border-lime-500 text-white font-bold'
                      : 'bg-dark-950/60 border-white/[0.06] text-slate-300 hover:border-slate-700 hover:bg-dark-850'
                  }`}
                >
                  <span className="text-sm font-semibold">{cand.name}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-lime-400 bg-lime-400' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-dark-950" />}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full mt-2"
            onClick={handleConfirmVote}
            disabled={!selectedTargetId}
            icon={<Vote className="w-4 h-4" />}
          >
            Confirmar Voto
          </Button>
        </Card>
      )}
    </div>
  );
};
