import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Users, Copy, QrCode, Crown, Check, Play, LogOut, } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { QrCodeModal } from '../../components/common/QrCodeModal';
import { useGameStore } from '../../stores/useGameStore';
import { socketService } from '../../services/socketService';
import { audioService } from '../../services/audioService';
export const OnlineLobbyScreen = () => {
    const { onlineRoomCode, onlinePlayerName, onlineRoomState, setOnlineRoomState, setOnlineMyRole, setView, leaveOnlineGame, } = useGameStore();
    const [copiedLink, setCopiedLink] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const socket = socketService.getSocket();
    // Escuchar eventos en tiempo real
    useEffect(() => {
        if (!socket)
            return;
        const handleRoomState = (state) => {
            setOnlineRoomState(state);
            if (state.phase !== 'setup') {
                // La partida ha comenzado -> Ir a pantalla de juego
                setView('online_game');
            }
        };
        const handleRole = (role) => {
            setOnlineMyRole(role);
        };
        const handleError = (error) => {
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
    const shareableUrl = typeof window !== 'undefined'
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
        if (!socket)
            return;
        setErrorMessage(null);
        audioService.playClick();
        socket.emit('game:start');
    };
    const currentPlayers = onlineRoomState?.players || [];
    const myPlayer = currentPlayers.find((p) => p.name.trim().toLowerCase() === onlinePlayerName.trim().toLowerCase());
    const isHost = myPlayer?.isHost ?? false;
    const canStart = currentPlayers.length >= 3;
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fadeIn", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: leaveOnlineGame, className: "inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors", children: [_jsx(LogOut, { className: "w-4 h-4" }), _jsx("span", { children: "Abandonar sala" })] }), _jsxs("span", { className: "text-xs uppercase font-extrabold tracking-widest text-emerald-400 flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), "Sala de Espera"] })] }), _jsxs(Card, { variant: "highlight", className: "flex flex-col items-center text-center p-6 gap-4", children: [_jsx("span", { className: "text-[11px] font-extrabold uppercase tracking-widest text-slate-400", children: "C\u00F3digo para unirse" }), _jsx("div", { className: "text-4xl md:text-5xl font-mono font-black tracking-widest text-lime-400 select-all", children: onlineRoomCode }), _jsxs("div", { className: "flex items-center gap-2 pt-1", children: [_jsx(Button, { size: "sm", variant: copiedLink ? 'primary' : 'secondary', onClick: handleCopyLink, icon: copiedLink ? _jsx(Check, { className: "w-4 h-4" }) : _jsx(Copy, { className: "w-4 h-4" }), children: copiedLink ? 'Enlace copiado' : 'Copiar enlace' }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => setShowQrModal(true), icon: _jsx(QrCode, { className: "w-4 h-4" }), children: "C\u00F3digo QR" })] })] }), errorMessage && (_jsx("div", { className: "p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs font-bold text-red-200", children: errorMessage })), _jsxs(Card, { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-lime-400" }), _jsxs("h2", { className: "text-base font-bold text-white", children: ["Participantes (", currentPlayers.length, "/12)"] })] }), _jsx("span", { className: "text-xs text-slate-400", children: currentPlayers.length < 3
                                    ? `Faltan ${3 - currentPlayers.length} para poder jugar`
                                    : 'Listo para comenzar' })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5", children: currentPlayers.map((player) => (_jsxs("div", { className: `p-3.5 rounded-2xl border flex items-center justify-between transition-all ${player.name === onlinePlayerName
                                ? 'bg-dark-850 border-lime-500/50 text-white'
                                : 'bg-dark-950 border-slate-800 text-slate-300'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-8 h-8 rounded-xl bg-dark-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200", children: player.name.charAt(0).toUpperCase() }), player.isConnected ? (_jsx("div", { className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark-950", title: "En l\u00EDnea" })) : (_jsx("div", { className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-dark-950", title: "Desconectado (esperando reconexi\u00F3n)" }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm font-bold text-white", children: player.name }), player.name === onlinePlayerName && (_jsx("span", { className: "text-[10px] text-lime-400 font-semibold", children: "(T\u00FA)" }))] }), _jsx("span", { className: "text-[10px] text-slate-400", children: player.isHost ? 'Anfitrión de la sala' : 'Jugador' })] })] }), player.isHost && (_jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20", children: [_jsx(Crown, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Host" })] }))] }, player.id))) })] }), onlineRoomState && (_jsxs(Card, { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Reglas de la Partida" }), _jsxs("span", { className: "text-xs text-slate-400", children: [onlineRoomState.settings.impostorCount, ' ', onlineRoomState.settings.impostorCount === 1 ? 'impostor' : 'impostores'] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-300", children: [_jsx("span", { className: "text-[10px] text-slate-500 block uppercase font-bold", children: "Pistas" }), _jsx("span", { className: "font-semibold", children: onlineRoomState.settings.enableHints ? 'Con pista' : 'Sin pista' })] }), _jsxs("div", { className: "p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-300", children: [_jsx("span", { className: "text-[10px] text-slate-500 block uppercase font-bold", children: "\u00DAltima Oportunidad" }), _jsx("span", { className: "font-semibold", children: onlineRoomState.settings.allowLastChanceGuess ? 'Habilitada' : 'Deshabilitada' })] }), _jsxs("div", { className: "p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-300", children: [_jsx("span", { className: "text-[10px] text-slate-500 block uppercase font-bold", children: "Debate" }), _jsx("span", { className: "font-semibold", children: onlineRoomState.settings.debateDurationSeconds === 0
                                            ? 'Libre'
                                            : `${onlineRoomState.settings.debateDurationSeconds} seg` })] })] })] })), _jsx("div", { className: "pt-2", children: isHost ? (_jsx(Button, { size: "xl", className: "w-full py-5 text-lg shadow-glow", disabled: !canStart, onClick: handleStartGame, icon: _jsx(Play, { className: "w-6 h-6 fill-current" }), children: canStart ? '¡Iniciar Partida Online!' : 'Esperando más participantes (mínimo 3)...' })) : (_jsxs("div", { className: "p-4 bg-dark-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-amber-400 animate-pulse" }), _jsx("span", { children: "Esperando a que el anfitri\u00F3n inicie la partida..." })] })) }), _jsx(QrCodeModal, { isOpen: showQrModal, onClose: () => setShowQrModal(false), url: shareableUrl, roomCode: onlineRoomCode })] }));
};
