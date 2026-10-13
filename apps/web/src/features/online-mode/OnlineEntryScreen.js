import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PlusCircle, LogIn, ArrowLeft, RotateCcw, AlertCircle, Loader2, } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { socketService } from '../../services/socketService';
import { RoomCodeSchema, PlayerNameSchema } from '@impostor/shared';
export const OnlineEntryScreen = () => {
    const { setView, setOnlinePlayerName, setOnlineRoomCode, setOnlineRoomState, setOnlineMyPlayerId, } = useGameStore();
    const [status, setStatus] = useState('idle');
    const [activeTab, setActiveTab] = useState('create');
    const [playerName, setLocalPlayerName] = useState('');
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
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
        socketService.connect().catch(() => { });
    };
    const handleCreateRoom = (e) => {
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
            }
            else {
                setErrorMessage(response.error || 'Error al crear la sala.');
            }
        });
    };
    const handleJoinRoom = (e) => {
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
        socket.emit('room:join', {
            code: codeParsed.data,
            playerName: nameParsed.data,
            token: existingToken,
        }, (response) => {
            setIsSubmitting(false);
            if (response.success && response.state) {
                setOnlinePlayerName(nameParsed.data);
                setOnlineRoomCode(codeParsed.data);
                setOnlineRoomState(response.state);
                if (response.token) {
                    socketService.saveReconnectToken(codeParsed.data, response.token);
                }
                setView('online_lobby');
            }
            else {
                setErrorMessage(response.error || 'No se pudo unir a la sala.');
            }
        });
    };
    const handleBackToHome = () => {
        socketService.disconnect();
        setView('home');
    };
    return (_jsxs("div", { className: "max-w-md mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: handleBackToHome, className: "inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Volver al inicio" })] }), _jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-emerald-400", children: "Multijugador online" })] }), _jsxs("div", { className: "w-full", children: [status === 'connecting' && (_jsxs("div", { className: "p-3 bg-dark-900 border border-slate-800 rounded-2xl flex items-center gap-3 text-xs text-slate-300", children: [_jsx(Loader2, { className: "w-4 h-4 text-lime-400 animate-spin" }), _jsx("span", { children: "Conectando al servidor online..." })] })), status === 'waking_up' && (_jsxs("div", { className: "p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col gap-2 text-xs text-amber-200", children: [_jsxs("div", { className: "flex items-center gap-2 font-bold", children: [_jsx(Loader2, { className: "w-4 h-4 text-amber-400 animate-spin" }), _jsx("span", { children: "El servidor se est\u00E1 reactivando en Render..." })] }), _jsx("p", { className: "text-[11px] text-amber-300/80 leading-relaxed", children: "Si el servicio estaba suspendido por inactividad, puede tomar entre 15 y 30 segundos en arrancar por completo. Por favor, aguarda un instante." })] })), status === 'connected' && (_jsxs("div", { className: "p-2.5 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-300", children: [_jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" }), _jsx("span", { children: "Servidor conectado en tiempo real" })] }), _jsx("span", { className: "text-[10px] text-emerald-400/80 font-mono", children: "ONLINE" })] })), (status === 'error' || status === 'disconnected') && (_jsxs("div", { className: "p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center justify-between text-xs text-red-200", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-red-400" }), _jsx("span", { children: "Sin conexi\u00F3n con el servidor." })] }), _jsx(Button, { size: "sm", variant: "secondary", onClick: handleRetryConnection, icon: _jsx(RotateCcw, { className: "w-3.5 h-3.5" }), children: "Reintentar" })] }))] }), _jsxs("div", { className: "grid grid-cols-2 p-1 bg-dark-900 border border-slate-800 rounded-2xl", children: [_jsx("button", { onClick: () => {
                            setActiveTab('create');
                            setErrorMessage(null);
                        }, className: `py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'create'
                            ? 'bg-lime-500 text-dark-950 shadow-glow font-black'
                            : 'text-slate-400 hover:text-white'}`, children: "Crear Sala" }), _jsx("button", { onClick: () => {
                            setActiveTab('join');
                            setErrorMessage(null);
                        }, className: `py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'join'
                            ? 'bg-lime-500 text-dark-950 shadow-glow font-black'
                            : 'text-slate-400 hover:text-white'}`, children: "Unirse con C\u00F3digo" })] }), errorMessage && (_jsx("div", { className: "p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs font-bold text-red-200", children: errorMessage })), activeTab === 'create' ? (_jsxs(Card, { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(PlusCircle, { className: "w-5 h-5 text-lime-400" }), _jsx("h2", { className: "text-base font-bold text-white", children: "Crear Nueva Sala" })] }), _jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: "Ser\u00E1s el anfitri\u00F3n de la partida. Podr\u00E1s configurar las reglas e invitar hasta 12 amigos compartiendo un c\u00F3digo corto o un enlace directo." }), _jsxs("form", { onSubmit: handleCreateRoom, className: "flex flex-col gap-4 pt-1", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1.5", children: "Tu Nombre de Jugador" }), _jsx("input", { type: "text", placeholder: "Ej: Nacho", value: playerName, maxLength: 25, onChange: (e) => setLocalPlayerName(e.target.value), required: true, className: "w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500" })] }), _jsx(Button, { size: "xl", type: "submit", className: "w-full py-4 text-base shadow-glow mt-1", disabled: isSubmitting || status !== 'connected', children: isSubmitting ? 'Creando sala...' : 'Crear Sala y Obtener Código' })] })] })) : (
            /* Formulario Unirse a Sala */
            _jsxs(Card, { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LogIn, { className: "w-5 h-5 text-emerald-400" }), _jsx("h2", { className: "text-base font-bold text-white", children: "Unirse a una Sala" })] }), _jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: "Ingresa el c\u00F3digo de 6 caracteres que te comparti\u00F3 el anfitri\u00F3n para entrar a la sala de espera." }), _jsxs("form", { onSubmit: handleJoinRoom, className: "flex flex-col gap-4 pt-1", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1.5", children: "C\u00F3digo de Sala" }), _jsx("input", { type: "text", placeholder: "Ej: ABC789", value: roomCodeInput, maxLength: 8, onChange: (e) => setRoomCodeInput(e.target.value.toUpperCase()), required: true, className: "w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-lg text-lime-400 font-mono font-black tracking-widest text-center uppercase placeholder-slate-600 focus:outline-none focus:border-lime-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1.5", children: "Tu Nombre de Jugador" }), _jsx("input", { type: "text", placeholder: "Ej: Sof\u00EDa", value: playerName, maxLength: 25, onChange: (e) => setLocalPlayerName(e.target.value), required: true, className: "w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500" })] }), _jsx(Button, { size: "xl", type: "submit", className: "w-full py-4 text-base shadow-glow mt-1", disabled: isSubmitting || status !== 'connected', children: isSubmitting ? 'Uniéndose...' : 'Unirse a la Sala' })] })] })), _jsxs("div", { className: "p-3.5 bg-dark-900/60 border border-slate-800 rounded-2xl text-[11px] text-slate-400 leading-relaxed", children: [_jsx("strong", { children: "Nota de conectividad:" }), " Este modo requiere acceso a internet para comunicarse con el servidor en Render. Si est\u00E1n todos en el mismo Wi-Fi pero sin conexi\u00F3n a internet, utilicen el modo de ", _jsx("em", { children: "Dispositivo compartido" }), "."] })] }));
};
