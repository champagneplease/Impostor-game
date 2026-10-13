import React, { useEffect, useState } from 'react';
import {
  Users,
  Copy,
  QrCode,
  Crown,
  Check,
  Play,
  LogOut,
  SlidersHorizontal,
  Wifi,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { QrCodeModal } from '../../components/common/QrCodeModal';
import { useGameStore } from '../../stores/useGameStore';
import { socketService } from '../../services/socketService';
import { audioService } from '../../services/audioService';
import { RoomState, SecretRoleAssignment } from '@impostor/shared';

export const OnlineLobbyScreen: React.FC = () => {
  const {
    onlineRoomCode,
    onlinePlayerName,
    onlineRoomState,
    setOnlineRoomState,
    setOnlineMyRole,
    setView,
    leaveOnlineGame,
  } = useGameStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socket = socketService.getSocket();

  // Escuchar eventos en tiempo real
  useEffect(() => {
    if (!socket) return;

    const handleRoomState = (state: RoomState) => {
      setOnlineRoomState(state);
      if (state.phase !== 'setup') {
        // La partida ha comenzado -> Ir a pantalla de juego
        setView('online_game');
      }
    };

    const handleRole = (role: SecretRoleAssignment) => {
      setOnlineMyRole(role);
    };

    const handleError = (error: { code: string; message: string }) => {
      setErrorMessage(error.message);
      audioService.playError();
    };

    socket.on('room:state', handleRoomState);
    socket.on('game:role', handleRole);
    socket.on('room:error', handleError);

    return () => {
      socket.off('room:state', handleRoomState);
      socket.off('game:role', handleRole);
      socket.off('room:error', handleError);
    };
  }, [socket, setOnlineRoomState, setOnlineMyRole, setView]);

  const shareableUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}?room=${onlineRoomCode}`
      : `?room=${onlineRoomCode}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleStartGame = () => {
    if (!socket) return;
    setErrorMessage(null);
    audioService.playClick();
    socket.emit('game:start');
  };

  const currentPlayers = onlineRoomState?.players || [];
  const myPlayer = currentPlayers.find(
    (p) => p.name.trim().toLowerCase() === onlinePlayerName.trim().toLowerCase()
  );
  const isHost = myPlayer?.isHost ?? false;
  const canStart = currentPlayers.length >= 3;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fadeIn">
      {/* Barra de Encabezado */}
      <div className="flex items-center justify-between">
        <button
          onClick={leaveOnlineGame}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Abandonar sala</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Sala de Espera
        </span>
      </div>

      {/* Tarjeta del Código de Sala */}
      <Card variant="highlight" className="flex flex-col items-center text-center p-6 gap-4">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          Código para unirse
        </span>

        <div className="text-4xl md:text-5xl font-mono font-black tracking-widest text-lime-400 select-all">
          {onlineRoomCode}
        </div>

        {/* Acciones para compartir */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant={copiedLink ? 'primary' : 'secondary'}
            onClick={handleCopyLink}
            icon={copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copiedLink ? 'Enlace copiado' : 'Copiar enlace'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowQrModal(true)}
            icon={<QrCode className="w-4 h-4" />}
          >
            Código QR
          </Button>
        </div>
      </Card>

      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs font-bold text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Lista de Participantes */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-lime-400" />
            <h2 className="text-base font-bold text-white">
              Participantes ({currentPlayers.length}/12)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {currentPlayers.length < 3
              ? `Faltan ${3 - currentPlayers.length} para poder jugar`
              : 'Listo para comenzar'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentPlayers.map((player) => (
            <div
              key={player.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                player.name === onlinePlayerName
                  ? 'bg-dark-850 border-lime-500/50 text-white'
                  : 'bg-dark-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-dark-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  {player.isConnected ? (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark-950"
                      title="En línea"
                    />
                  ) : (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-dark-950"
                      title="Desconectado (esperando reconexión)"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{player.name}</span>
                    {player.name === onlinePlayerName && (
                      <span className="text-[10px] text-lime-400 font-semibold">(Tú)</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {player.isHost ? 'Anfitrión de la sala' : 'Jugador'}
                  </span>
                </div>
              </div>

              {player.isHost && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Host</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Reglas de la Partida */}
      {onlineRoomState && (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Reglas de la Partida
            </span>
            <span className="text-xs text-slate-400">
              {onlineRoomState.settings.impostorCount}{' '}
              {onlineRoomState.settings.impostorCount === 1 ? 'impostor' : 'impostores'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-300">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Pistas</span>
              <span className="font-semibold">
                {onlineRoomState.settings.enableHints ? '1 sola palabra' : 'Sin pista'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-300">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Última Oportunidad</span>
              <span className="font-semibold">
                {onlineRoomState.settings.allowLastChanceGuess ? 'Habilitada' : 'Deshabilitada'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-300">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Debate</span>
              <span className="font-semibold">
                {onlineRoomState.settings.debateDurationSeconds === 0
                  ? 'Libre'
                  : `${onlineRoomState.settings.debateDurationSeconds} seg`}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Controles de Inicio */}
      <div className="pt-2">
        {isHost ? (
          <Button
            size="xl"
            className="w-full py-5 text-lg shadow-glow"
            disabled={!canStart}
            onClick={handleStartGame}
            icon={<Play className="w-6 h-6 fill-current" />}
          >
            {canStart ? '¡Iniciar Partida Online!' : 'Esperando más participantes (mínimo 3)...'}
          </Button>
        ) : (
          <div className="p-4 bg-dark-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Esperando a que el anfitrión inicie la partida...</span>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={shareableUrl}
        roomCode={onlineRoomCode}
      />
    </div>
  );
};
