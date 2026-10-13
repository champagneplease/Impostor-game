import React, { useEffect, useState } from 'react';
import {
  Shield,
  Skull,
  Eye,
  Vote,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2,
  RotateCcw,
  LogOut,
  AlertTriangle,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { socketService } from '../../services/socketService';
import { audioService } from '../../services/audioService';
import { GameEndSummary, RoomState, SecretRoleAssignment, VotingResult } from '@impostor/shared';

export const OnlineGameScreen: React.FC = () => {
  const {
    onlinePlayerName,
    onlineRoomState,
    setOnlineRoomState,
    onlineMyRole,
    setOnlineMyRole,
    onlineVoteTargetId,
    setOnlineVoteTargetId,
    onlineVoteSubmitted,
    setOnlineVoteSubmitted,
    leaveOnlineGame,
    setView,
  } = useGameStore();

  const [voteProgress, setVoteProgress] = useState<{ received: number; total: number } | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socket = socketService.getSocket();

  useEffect(() => {
    if (!socket) return;

    // Solicitar rol privado si aún no se tiene
    if (!onlineMyRole) {
      socket.emit('game:request_role', (role: any) => {
        if (!role.error) {
          setOnlineMyRole(role);
        }
      });
    }

    const handleRoomState = (state: RoomState) => {
      setOnlineRoomState(state);
      if (state.phase === 'setup') {
        // Volver al lobby en caso de revancha
        setOnlineVoteSubmitted(false);
        setOnlineVoteTargetId(null);
        setView('online_lobby');
      }
    };

    const handleRole = (role: SecretRoleAssignment) => {
      setOnlineMyRole(role);
      audioService.playReveal();
    };

    const handleVoteProgress = (prog: { received: number; total: number }) => {
      setVoteProgress(prog);
    };

    const handleVoteResult = (result: VotingResult) => {
      audioService.playClick();
    };

    const handleRoundResult = (summary: GameEndSummary) => {
      audioService.playVictory();
    };

    socket.on('room:state', handleRoomState);
    socket.on('game:role', handleRole);
    socket.on('game:vote_progress', handleVoteProgress);
    socket.on('game:vote_result', handleVoteResult);
    socket.on('game:round_result', handleRoundResult);

    return () => {
      socket.off('room:state', handleRoomState);
      socket.off('game:role', handleRole);
      socket.off('game:vote_progress', handleVoteProgress);
      socket.off('game:vote_result', handleVoteResult);
      socket.off('game:round_result', handleRoundResult);
    };
  }, [socket, onlineMyRole, setOnlineMyRole, setOnlineRoomState, setOnlineVoteSubmitted, setOnlineVoteTargetId, setView]);

  if (!onlineRoomState) return null;

  const myPlayer = onlineRoomState.players.find(
    (p) => p.name.trim().toLowerCase() === onlinePlayerName.trim().toLowerCase()
  );
  const isHost = myPlayer?.isHost ?? false;
  const isImpostor = onlineMyRole?.role === 'impostor';
  const currentPhase = onlineRoomState.phase;

  const handleNextPhase = () => {
    if (!socket || !isHost) return;
    audioService.playClick();
    socket.emit('game:next_phase');
  };

  const handleSubmitVote = () => {
    if (!socket || !onlineVoteTargetId || onlineVoteSubmitted) return;
    audioService.playClick();
    socket.emit('game:submit_vote', { targetId: onlineVoteTargetId });
    setOnlineVoteSubmitted(true);
  };

  const handleSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !guessInput.trim()) return;
    audioService.playClick();
    socket.emit('game:submit_guess', { guess: guessInput.trim() });
  };

  const handleRematch = () => {
    if (!socket || !isHost) return;
    audioService.playClick();
    socket.emit('game:rematch');
  };

  // 1. FASE: REPARTO DE ROLES PRIVADO
  if (currentPhase === 'role_reveal') {
    return (
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn">
        <Card
          className={`w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl ${
            isImpostor ? 'border-red-500/50 bg-red-950/20' : 'border-lime-500/50 bg-dark-900'
          }`}
        >
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
              isImpostor
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-glow-red'
                : 'bg-lime-500/20 text-lime-400 border border-lime-500/40 shadow-glow'
            }`}
          >
            {isImpostor ? <Skull className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              {onlinePlayerName}
            </span>
            <h2
              className={`text-2xl md:text-3xl font-black uppercase tracking-wide ${
                isImpostor ? 'text-red-400' : 'text-lime-400'
              }`}
            >
              {isImpostor ? '¡Eres el Impostor!' : 'Eres Inocente'}
            </h2>
          </div>

          <div className="w-full bg-dark-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
            {isImpostor ? (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Categoría
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {onlineMyRole?.categoryName}
                  </span>
                </div>

                {onlineMyRole?.hint ? (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block flex items-center justify-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Pista del Impostor
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
                      «{onlineMyRole.hint}»
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Sin pistas activas. ¡Descubre la palabra escuchando a los demás!
                  </p>
                )}
              </>
            ) : (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Categoría
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {onlineMyRole?.categoryName}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 block">
                    Palabra Secreta
                  </span>
                  <span className="text-2xl md:text-3xl font-black text-white tracking-wide block mt-1">
                    {onlineMyRole?.word}
                  </span>
                </div>
              </>
            )}
          </div>

          {isHost ? (
            <Button size="xl" className="w-full py-4 shadow-glow" onClick={handleNextPhase}>
              Comenzar Debate de la Sala
            </Button>
          ) : (
            <p className="text-xs text-slate-400">
              Esperando a que el anfitrión avance a la fase de debate...
            </p>
          )}
        </Card>
      </div>
    );
  }

  // 2. FASE: DEBATE
  if (currentPhase === 'debate') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
        <div className="text-center flex flex-col items-center gap-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-lime-400">
            Fase de Debate Sincronizada
          </span>
          <h1 className="text-3xl font-black text-white">¡Ronda de Pistas!</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Hagan su ronda de pistas verbales en persona o por llamada.
          </p>
        </div>

        {/* Recordatorio de rol privado en tarjeta pequeña */}
        <div className="p-4 bg-dark-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isImpostor ? (
              <Skull className="w-5 h-5 text-red-400" />
            ) : (
              <Shield className="w-5 h-5 text-lime-400" />
            )}
            <span className="text-xs text-slate-300 font-semibold">
              Tu rol:{' '}
              <strong className={isImpostor ? 'text-red-400' : 'text-lime-400'}>
                {isImpostor ? 'Impostor' : `Palabra: «${onlineMyRole?.word}»`}
              </strong>
            </span>
          </div>
        </div>

        {/* Participantes en la sala */}
        <Card className="flex flex-col gap-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Jugadores en la partida
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {onlineRoomState.players.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-dark-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 truncate"
              >
                {p.name}
              </div>
            ))}
          </div>
        </Card>

        {isHost ? (
          <Button
            size="xl"
            className="w-full py-5 text-lg shadow-glow mt-2"
            onClick={handleNextPhase}
            icon={<Vote className="w-6 h-6 stroke-[2.5]" />}
          >
            Abrir Votación en Todos los Dispositivos
          </Button>
        ) : (
          <div className="p-4 bg-dark-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            Esperando a que el anfitrión abra la votación...
          </div>
        )}
      </div>
    );
  }

  // 3. FASE: VOTACIÓN Y DESEMPATE
  if (currentPhase === 'voting' || currentPhase === 'tie_breaker') {
    const isTieBreaker = currentPhase === 'tie_breaker';
    const eligibleCandidates = onlineRoomState.players.filter((p) => {
      // Excluirse a uno mismo salvo si está configurado
      if (!onlineRoomState.settings.allowSelfVote && p.id === myPlayer?.id) {
        return false;
      }
      if (isTieBreaker && onlineRoomState.tieCandidates) {
        return onlineRoomState.tieCandidates.includes(p.id);
      }
      return true;
    });

    return (
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
        <div className="text-center flex flex-col gap-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-lime-400">
            {isTieBreaker ? 'Desempate en Vivo' : 'Votación Sincronizada'}
          </span>
          <h2 className="text-2xl font-black text-white">¿Quién es el Impostor?</h2>
          <p className="text-xs text-slate-400">
            {isTieBreaker
              ? 'Empate previo. Vota entre los candidatos empatados:'
              : 'Selecciona al jugador que consideras impostor:'}
          </p>
        </div>

        {/* Contador en vivo de votos */}
        <div className="p-3 bg-dark-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-slate-400">Progreso de votación:</span>
          <span className="text-lime-400 font-bold font-mono">
            {onlineRoomState.votesReceivedCount} de {onlineRoomState.totalEligibleVoters} votos recibidos
          </span>
        </div>

        {onlineVoteSubmitted ? (
          <Card className="flex flex-col items-center text-center p-8 gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-lime-500/20 text-lime-400 border border-lime-500/40 flex items-center justify-center shadow-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">¡Voto Enviado!</h3>
            <p className="text-xs text-slate-400">
              Esperando a que el resto de los jugadores emita su voto...
            </p>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {eligibleCandidates.map((cand) => {
                const isSelected = onlineVoteTargetId === cand.id;
                return (
                  <button
                    key={cand.id}
                    onClick={() => setOnlineVoteTargetId(cand.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-lime-500/20 border-lime-500 text-white shadow-glow font-black'
                        : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'
                    }`}
                  >
                    <span className="text-sm font-bold">{cand.name}</span>
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
              disabled={!onlineVoteTargetId}
              onClick={handleSubmitVote}
              icon={<Vote className="w-5 h-5" />}
            >
              Confirmar Mi Voto
            </Button>
          </Card>
        )}
      </div>
    );
  }

  // 4. FASE: ÚLTIMA OPORTUNIDAD
  if (currentPhase === 'last_chance') {
    const isMeCaught = onlineRoomState.lastChancePlayerId === myPlayer?.id;
    const caughtPlayerName =
      onlineRoomState.players.find((p) => p.id === onlineRoomState.lastChancePlayerId)?.name ||
      'El Impostor';

    return (
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn">
        <Card className="w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl border-red-500/50 bg-red-950/20">
          <div className="w-20 h-20 rounded-3xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shadow-glow-red">
            <Skull className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
              ¡Impostor Descubierto!
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">{caughtPlayerName}</h2>
          </div>

          {isMeCaught ? (
            <form onSubmit={handleSubmitGuess} className="w-full flex flex-col gap-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                ¡Tienes una última oportunidad! Si escribes la palabra exacta, robas la victoria para
                el equipo impostor.
              </p>

              <input
                type="text"
                placeholder="Escribe la palabra secreta..."
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                autoFocus
                className="w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-base text-white text-center font-bold focus:outline-none focus:border-lime-500"
              />

              <Button size="xl" type="submit" className="w-full py-4 text-base shadow-glow">
                Enviar Adivinanza
              </Button>
            </form>
          ) : (
            <p className="text-xs text-slate-400">
              Esperando a que {caughtPlayerName} intente adivinar la palabra secreta...
            </p>
          )}
        </Card>
      </div>
    );
  }

  // 5. FASE: RESULTADOS FINALES Y REVANCHA
  if (currentPhase === 'game_over' && onlineRoomState.endSummary) {
    const summary = onlineRoomState.endSummary;
    const isNormalsWin = summary.winner === 'normals';

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
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

          <h1
            className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${
              isNormalsWin ? 'text-lime-400' : 'text-red-400'
            }`}
          >
            {isNormalsWin ? '¡Victoria Ciudadana!' : '¡Victoria del Impostor!'}
          </h1>
        </Card>

        {/* Revelación de palabra */}
        <Card className="flex flex-col items-center text-center p-6 gap-2 bg-dark-850">
          <span className="text-xs uppercase font-extrabold tracking-widest text-lime-400">
            La palabra secreta era
          </span>
          <div className="text-3xl md:text-4xl font-black text-white tracking-wide">
            «{summary.secretWord}»
          </div>
          <span className="text-xs text-slate-400 font-bold">
            Categoría: {summary.categoryName}
          </span>
        </Card>

        {/* Roles de los participantes */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Participantes y Roles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {summary.players.map((p) => {
              const playerIsImpostor = p.role === 'impostor';
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    playerIsImpostor
                      ? 'bg-red-950/30 border-red-500/40 text-red-200'
                      : 'bg-dark-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="text-xs font-bold uppercase">
                    {playerIsImpostor ? 'Impostor' : 'Inocente'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Acciones de Revancha */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isHost ? (
            <Button
              size="xl"
              className="flex-1 shadow-glow"
              onClick={handleRematch}
              icon={<RotateCcw className="w-5 h-5" />}
            >
              Revancha en la Misma Sala
            </Button>
          ) : (
            <div className="flex-1 p-4 bg-dark-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center">
              Esperando a que el anfitrión inicie la revancha...
            </div>
          )}

          <Button
            size="xl"
            variant="ghost"
            onClick={leaveOnlineGame}
            icon={<LogOut className="w-5 h-5" />}
          >
            Salir al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
