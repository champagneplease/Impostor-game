import React, { useEffect, useState } from 'react';
import {
  Wifi,
  PlusCircle,
  LogIn,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { socketService, ConnectionStatus } from '../../services/socketService';
import { RoomCodeSchema, PlayerNameSchema } from '@impostor/shared';

export const OnlineEntryScreen: React.FC = () => {
  const {
    setView,
    setOnlinePlayerName,
    setOnlineRoomCode,
    setOnlineRoomState,
    setOnlineMyPlayerId,
  } = useGameStore();

  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [playerName, setLocalPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comprobar parámetro en URL (?room=XXXXXX)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setRoomCodeInput(roomParam.trim().toUpperCase());
        setActiveTab('join');
      }
    }
  }, []);

  // Iniciar conexión Socket.IO diferida
  useEffect(() => {
    const unsub = socketService.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    socketService.connect().catch((err) => {
      console.warn('[OnlineEntry] Error de conexión:', err);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleRetryConnection = () => {
    setErrorMessage(null);
    socketService.connect().catch(() => {});
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameParsed = PlayerNameSchema.safeParse(playerName);
    if (!nameParsed.success) {
      setErrorMessage(nameParsed.error.issues[0]?.message || 'Nombre inválido');
      return;
    }

    const socket = socketService.getSocket();
    if (!socket || !socket.connected) {
      setErrorMessage('Aún no estás conectado al servidor. Espera un momento.');
      return;
    }

    setIsSubmitting(true);
    socket.emit('room:create', { playerName: nameParsed.data }, (response) => {
      setIsSubmitting(false);
      if (response.success && response.code) {
        setOnlinePlayerName(nameParsed.data);
        setOnlineRoomCode(response.code);
        if (response.token) {
          socketService.saveReconnectToken(response.code, response.token);
        }
        setView('online_lobby');
      } else {
        setErrorMessage(response.error || 'Error al crear la sala.');
      }
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameParsed = PlayerNameSchema.safeParse(playerName);
    if (!nameParsed.success) {
      setErrorMessage(nameParsed.error.issues[0]?.message || 'Nombre inválido');
      return;
    }

    const codeParsed = RoomCodeSchema.safeParse(roomCodeInput);
    if (!codeParsed.success) {
      setErrorMessage('Ingresa un código de sala válido de 6 caracteres.');
      return;
    }

    const socket = socketService.getSocket();
    if (!socket || !socket.connected) {
      setErrorMessage('Aún no estás conectado al servidor. Espera un momento.');
      return;
    }

    const existingToken = socketService.getReconnectToken(codeParsed.data);

    setIsSubmitting(true);
    socket.emit(
      'room:join',
      {
        code: codeParsed.data,
        playerName: nameParsed.data,
        token: existingToken,
      },
      (response) => {
        setIsSubmitting(false);
        if (response.success && response.state) {
          setOnlinePlayerName(nameParsed.data);
          setOnlineRoomCode(codeParsed.data);
          setOnlineRoomState(response.state);
          if (response.token) {
            socketService.saveReconnectToken(codeParsed.data, response.token);
          }
          setView('online_lobby');
        } else {
          setErrorMessage(response.error || 'No se pudo unir a la sala.');
        }
      }
    );
  };

  const handleBackToHome = () => {
    socketService.disconnect();
    setView('home');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
          Multijugador online
        </span>
      </div>

      {/* Indicador de Estado del Servidor */}
      <div className="w-full">
        {status === 'connecting' && (
          <div className="p-3 bg-dark-900 border border-slate-800 rounded-2xl flex items-center gap-3 text-xs text-slate-300">
            <Loader2 className="w-4 h-4 text-lime-400 animate-spin" />
            <span>Conectando al servidor online...</span>
          </div>
        )}

        {status === 'waking_up' && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>El servidor se está reactivando en Render...</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Si el servicio estaba suspendido por inactividad, puede tomar entre 15 y 30 segundos
              en arrancar por completo. Por favor, aguarda un instante.
            </p>
          </div>
        )}

        {status === 'connected' && (
          <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Servidor conectado en tiempo real</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono">ONLINE</span>
          </div>
        )}

        {(status === 'error' || status === 'disconnected') && (
          <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Sin conexión con el servidor.</span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleRetryConnection} icon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reintentar
            </Button>
          </div>
        )}
      </div>

      {/* Tabs: Crear o Unirse */}
      <div className="grid grid-cols-2 p-1 bg-dark-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => {
            setActiveTab('create');
            setErrorMessage(null);
          }}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'create'
              ? 'bg-lime-500 text-dark-950 shadow-glow font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Crear Sala
        </button>

        <button
          onClick={() => {
            setActiveTab('join');
            setErrorMessage(null);
          }}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'join'
              ? 'bg-lime-500 text-dark-950 shadow-glow font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Unirse con Código
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs font-bold text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Formulario Crear Sala */}
      {activeTab === 'create' ? (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-lime-400" />
            <h2 className="text-base font-bold text-white">Crear Nueva Sala</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Serás el anfitrión de la partida. Podrás configurar las reglas e invitar hasta 12 amigos
            compartiendo un código corto o un enlace directo.
          </p>

          <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Tu Nombre de Jugador
              </label>
              <input
                type="text"
                placeholder="Ej: Nacho"
                value={playerName}
                maxLength={25}
                onChange={(e) => setLocalPlayerName(e.target.value)}
                required
                className="w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500"
              />
            </div>

            <Button
              size="xl"
              type="submit"
              className="w-full py-4 text-base shadow-glow mt-1"
              disabled={isSubmitting || status !== 'connected'}
            >
              {isSubmitting ? 'Creando sala...' : 'Crear Sala y Obtener Código'}
            </Button>
          </form>
        </Card>
      ) : (
        /* Formulario Unirse a Sala */
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Unirse a una Sala</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ingresa el código de 6 caracteres que te compartió el anfitrión para entrar a la sala de
            espera.
          </p>

          <form onSubmit={handleJoinRoom} className="flex flex-col gap-4 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Código de Sala
              </label>
              <input
                type="text"
                placeholder="Ej: ABC789"
                value={roomCodeInput}
                maxLength={8}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                required
                className="w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-lg text-lime-400 font-mono font-black tracking-widest text-center uppercase placeholder-slate-600 focus:outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Tu Nombre de Jugador
              </label>
              <input
                type="text"
                placeholder="Ej: Sofía"
                value={playerName}
                maxLength={25}
                onChange={(e) => setLocalPlayerName(e.target.value)}
                required
                className="w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500"
              />
            </div>

            <Button
              size="xl"
              type="submit"
              className="w-full py-4 text-base shadow-glow mt-1"
              disabled={isSubmitting || status !== 'connected'}
            >
              {isSubmitting ? 'Uniéndose...' : 'Unirse a la Sala'}
            </Button>
          </form>
        </Card>
      )}

      {/* Nota aclaratoria de conectividad */}
      <div className="p-3.5 bg-dark-900/60 border border-slate-800 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
        <strong>Nota de conectividad:</strong> Este modo requiere acceso a internet para
        comunicarse con el servidor en Render. Si están todos en el mismo Wi-Fi pero sin conexión a
        internet, utilicen el modo de <em>Dispositivo compartido</em>.
      </div>
    </div>
  );
};
