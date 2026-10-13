import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Shield, Skull, Vote, Trophy, CheckCircle2, RotateCcw, LogOut, HelpCircle, } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { socketService } from '../../services/socketService';
import { audioService } from '../../services/audioService';
export const OnlineGameScreen = () => {
    const { onlinePlayerName, onlineRoomState, setOnlineRoomState, onlineMyRole, setOnlineMyRole, onlineVoteTargetId, setOnlineVoteTargetId, onlineVoteSubmitted, setOnlineVoteSubmitted, leaveOnlineGame, setView, } = useGameStore();
    const [voteProgress, setVoteProgress] = useState(null);
    const [guessInput, setGuessInput] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const socket = socketService.getSocket();
    useEffect(() => {
        if (!socket)
            return;
        // Solicitar rol privado si aún no se tiene
        if (!onlineMyRole) {
            socket.emit('game:request_role', (role) => {
                if (!role.error) {
                    setOnlineMyRole(role);
                }
            });
        }
        const handleRoomState = (state) => {
            setOnlineRoomState(state);
            if (state.phase === 'setup') {
                // Volver al lobby en caso de revancha
                setOnlineVoteSubmitted(false);
                setOnlineVoteTargetId(null);
                setView('online_lobby');
            }
        };
        const handleRole = (role) => {
            setOnlineMyRole(role);
            audioService.playReveal();
        };
        const handleVoteProgress = (prog) => {
            setVoteProgress(prog);
        };
        const handleVoteResult = (result) => {
            audioService.playClick();
        };
        const handleRoundResult = (summary) => {
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
    if (!onlineRoomState)
        return null;
    const myPlayer = onlineRoomState.players.find((p) => p.name.trim().toLowerCase() === onlinePlayerName.trim().toLowerCase());
    const isHost = myPlayer?.isHost ?? false;
    const isImpostor = onlineMyRole?.role === 'impostor';
    const currentPhase = onlineRoomState.phase;
    const handleNextPhase = () => {
        if (!socket || !isHost)
            return;
        audioService.playClick();
        socket.emit('game:next_phase');
    };
    const handleSubmitVote = () => {
        if (!socket || !onlineVoteTargetId || onlineVoteSubmitted)
            return;
        audioService.playClick();
        socket.emit('game:submit_vote', { targetId: onlineVoteTargetId });
        setOnlineVoteSubmitted(true);
    };
    const handleSubmitGuess = (e) => {
        e.preventDefault();
        if (!socket || !guessInput.trim())
            return;
        audioService.playClick();
        socket.emit('game:submit_guess', { guess: guessInput.trim() });
    };
    const handleRematch = () => {
        if (!socket || !isHost)
            return;
        audioService.playClick();
        socket.emit('game:rematch');
    };
    // 1. FASE: REPARTO DE ROLES PRIVADO
    if (currentPhase === 'role_reveal') {
        return (_jsx("div", { className: "max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn", children: _jsxs(Card, { className: `w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl ${isImpostor ? 'border-red-500/50 bg-red-950/20' : 'border-lime-500/50 bg-dark-900'}`, children: [_jsx("div", { className: `w-20 h-20 rounded-3xl flex items-center justify-center ${isImpostor
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-glow-red'
                            : 'bg-lime-500/20 text-lime-400 border border-lime-500/40 shadow-glow'}`, children: isImpostor ? _jsx(Skull, { className: "w-10 h-10" }) : _jsx(Shield, { className: "w-10 h-10" }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-slate-400", children: onlinePlayerName }), _jsx("h2", { className: `text-2xl md:text-3xl font-black uppercase tracking-wide ${isImpostor ? 'text-red-400' : 'text-lime-400'}`, children: isImpostor ? '¡Eres el Impostor!' : 'Eres Inocente' })] }), _jsx("div", { className: "w-full bg-dark-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3", children: isImpostor ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block", children: "Categor\u00EDa" }), _jsx("span", { className: "text-base font-extrabold text-white", children: onlineMyRole?.categoryName })] }), onlineMyRole?.hint ? (_jsxs("div", { className: "pt-2 border-t border-slate-800/80", children: [_jsxs("span", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-400 block flex items-center justify-center gap-1", children: [_jsx(HelpCircle, { className: "w-3 h-3" }), " Pista del Impostor"] }), _jsxs("span", { className: "text-sm font-semibold text-slate-200 mt-0.5 block", children: ["\u00AB", onlineMyRole.hint, "\u00BB"] })] })) : (_jsx("p", { className: "text-xs text-slate-400", children: "Sin pistas activas. \u00A1Descubre la palabra escuchando a los dem\u00E1s!" }))] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block", children: "Categor\u00EDa" }), _jsx("span", { className: "text-xs font-bold text-slate-300", children: onlineMyRole?.categoryName })] }), _jsxs("div", { className: "pt-2 border-t border-slate-800/80", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-lime-400 block", children: "Palabra Secreta" }), _jsx("span", { className: "text-2xl md:text-3xl font-black text-white tracking-wide block mt-1", children: onlineMyRole?.word })] })] })) }), isHost ? (_jsx(Button, { size: "xl", className: "w-full py-4 shadow-glow", onClick: handleNextPhase, children: "Comenzar Debate de la Sala" })) : (_jsx("p", { className: "text-xs text-slate-400", children: "Esperando a que el anfitri\u00F3n avance a la fase de debate..." }))] }) }));
    }
    // 2. FASE: DEBATE
    if (currentPhase === 'debate') {
        return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn", children: [_jsxs("div", { className: "text-center flex flex-col items-center gap-1", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-lime-400", children: "Fase de Debate Sincronizada" }), _jsx("h1", { className: "text-3xl font-black text-white", children: "\u00A1Ronda de Pistas!" }), _jsx("p", { className: "text-xs md:text-sm text-slate-400", children: "Hagan su ronda de pistas verbales en persona o por llamada." })] }), _jsx("div", { className: "p-4 bg-dark-900 border border-slate-800 rounded-2xl flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-2", children: [isImpostor ? (_jsx(Skull, { className: "w-5 h-5 text-red-400" })) : (_jsx(Shield, { className: "w-5 h-5 text-lime-400" })), _jsxs("span", { className: "text-xs text-slate-300 font-semibold", children: ["Tu rol:", ' ', _jsx("strong", { className: isImpostor ? 'text-red-400' : 'text-lime-400', children: isImpostor ? 'Impostor' : `Palabra: «${onlineMyRole?.word}»` })] })] }) }), _jsxs(Card, { className: "flex flex-col gap-3", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Jugadores en la partida" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: onlineRoomState.players.map((p) => (_jsx("div", { className: "p-3 bg-dark-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 truncate", children: p.name }, p.id))) })] }), isHost ? (_jsx(Button, { size: "xl", className: "w-full py-5 text-lg shadow-glow mt-2", onClick: handleNextPhase, icon: _jsx(Vote, { className: "w-6 h-6 stroke-[2.5]" }), children: "Abrir Votaci\u00F3n en Todos los Dispositivos" })) : (_jsx("div", { className: "p-4 bg-dark-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400", children: "Esperando a que el anfitri\u00F3n abra la votaci\u00F3n..." }))] }));
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
        return (_jsxs("div", { className: "max-w-md mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn", children: [_jsxs("div", { className: "text-center flex flex-col gap-1", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-lime-400", children: isTieBreaker ? 'Desempate en Vivo' : 'Votación Sincronizada' }), _jsx("h2", { className: "text-2xl font-black text-white", children: "\u00BFQui\u00E9n es el Impostor?" }), _jsx("p", { className: "text-xs text-slate-400", children: isTieBreaker
                                ? 'Empate previo. Vota entre los candidatos empatados:'
                                : 'Selecciona al jugador que consideras impostor:' })] }), _jsxs("div", { className: "p-3 bg-dark-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-400", children: "Progreso de votaci\u00F3n:" }), _jsxs("span", { className: "text-lime-400 font-bold font-mono", children: [onlineRoomState.votesReceivedCount, " de ", onlineRoomState.totalEligibleVoters, " votos recibidos"] })] }), onlineVoteSubmitted ? (_jsxs(Card, { className: "flex flex-col items-center text-center p-8 gap-4 shadow-2xl", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-lime-500/20 text-lime-400 border border-lime-500/40 flex items-center justify-center shadow-glow", children: _jsx(CheckCircle2, { className: "w-8 h-8" }) }), _jsx("h3", { className: "text-xl font-black text-white", children: "\u00A1Voto Enviado!" }), _jsx("p", { className: "text-xs text-slate-400", children: "Esperando a que el resto de los jugadores emita su voto..." })] })) : (_jsxs(Card, { className: "flex flex-col gap-3", children: [_jsx("div", { className: "flex flex-col gap-2", children: eligibleCandidates.map((cand) => {
                                const isSelected = onlineVoteTargetId === cand.id;
                                return (_jsxs("button", { onClick: () => setOnlineVoteTargetId(cand.id), className: `w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${isSelected
                                        ? 'bg-lime-500/20 border-lime-500 text-white shadow-glow font-black'
                                        : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'}`, children: [_jsx("span", { className: "text-sm font-bold", children: cand.name }), isSelected && (_jsx("span", { className: "text-xs font-bold text-lime-400", children: "Sospechoso" }))] }, cand.id));
                            }) }), _jsx(Button, { size: "xl", className: "w-full py-4 text-base shadow-glow mt-2", disabled: !onlineVoteTargetId, onClick: handleSubmitVote, icon: _jsx(Vote, { className: "w-5 h-5" }), children: "Confirmar Mi Voto" })] }))] }));
    }
    // 4. FASE: ÚLTIMA OPORTUNIDAD
    if (currentPhase === 'last_chance') {
        const isMeCaught = onlineRoomState.lastChancePlayerId === myPlayer?.id;
        const caughtPlayerName = onlineRoomState.players.find((p) => p.id === onlineRoomState.lastChancePlayerId)?.name ||
            'El Impostor';
        return (_jsx("div", { className: "max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn", children: _jsxs(Card, { className: "w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl border-red-500/50 bg-red-950/20", children: [_jsx("div", { className: "w-20 h-20 rounded-3xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shadow-glow-red", children: _jsx(Skull, { className: "w-10 h-10" }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-red-400", children: "\u00A1Impostor Descubierto!" }), _jsx("h2", { className: "text-2xl md:text-3xl font-black text-white", children: caughtPlayerName })] }), isMeCaught ? (_jsxs("form", { onSubmit: handleSubmitGuess, className: "w-full flex flex-col gap-4", children: [_jsx("p", { className: "text-xs text-slate-300 leading-relaxed", children: "\u00A1Tienes una \u00FAltima oportunidad! Si escribes la palabra exacta, robas la victoria para el equipo impostor." }), _jsx("input", { type: "text", placeholder: "Escribe la palabra secreta...", value: guessInput, onChange: (e) => setGuessInput(e.target.value), autoFocus: true, className: "w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-base text-white text-center font-bold focus:outline-none focus:border-lime-500" }), _jsx(Button, { size: "xl", type: "submit", className: "w-full py-4 text-base shadow-glow", children: "Enviar Adivinanza" })] })) : (_jsxs("p", { className: "text-xs text-slate-400", children: ["Esperando a que ", caughtPlayerName, " intente adivinar la palabra secreta..."] }))] }) }));
    }
    // 5. FASE: RESULTADOS FINALES Y REVANCHA
    if (currentPhase === 'game_over' && onlineRoomState.endSummary) {
        const summary = onlineRoomState.endSummary;
        const isNormalsWin = summary.winner === 'normals';
        return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn", children: [_jsxs(Card, { className: `flex flex-col items-center text-center p-8 gap-4 border shadow-2xl ${isNormalsWin
                        ? 'bg-lime-500/10 border-lime-500/50 shadow-glow'
                        : 'bg-red-500/10 border-red-500/50 shadow-glow-red'}`, children: [_jsx("div", { className: `w-20 h-20 rounded-3xl flex items-center justify-center ${isNormalsWin
                                ? 'bg-lime-500 text-dark-950 shadow-glow'
                                : 'bg-red-500 text-white shadow-glow-red'}`, children: isNormalsWin ? _jsx(Trophy, { className: "w-10 h-10" }) : _jsx(Skull, { className: "w-10 h-10" }) }), _jsx("h1", { className: `text-3xl md:text-4xl font-black uppercase tracking-tight ${isNormalsWin ? 'text-lime-400' : 'text-red-400'}`, children: isNormalsWin ? '¡Victoria Ciudadana!' : '¡Victoria del Impostor!' })] }), _jsxs(Card, { className: "flex flex-col items-center text-center p-6 gap-2 bg-dark-850", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-lime-400", children: "La palabra secreta era" }), _jsxs("div", { className: "text-3xl md:text-4xl font-black text-white tracking-wide", children: ["\u00AB", summary.secretWord, "\u00BB"] }), _jsxs("span", { className: "text-xs text-slate-400 font-bold", children: ["Categor\u00EDa: ", summary.categoryName] })] }), _jsxs(Card, { className: "flex flex-col gap-3", children: [_jsx("h2", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Participantes y Roles" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: summary.players.map((p) => {
                                const playerIsImpostor = p.role === 'impostor';
                                return (_jsxs("div", { className: `p-3 rounded-2xl border flex items-center justify-between ${playerIsImpostor
                                        ? 'bg-red-950/30 border-red-500/40 text-red-200'
                                        : 'bg-dark-950 border-slate-800 text-slate-200'}`, children: [_jsx("span", { className: "text-sm font-bold", children: p.name }), _jsx("span", { className: "text-xs font-bold uppercase", children: playerIsImpostor ? 'Impostor' : 'Inocente' })] }, p.id));
                            }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-2", children: [isHost ? (_jsx(Button, { size: "xl", className: "flex-1 shadow-glow", onClick: handleRematch, icon: _jsx(RotateCcw, { className: "w-5 h-5" }), children: "Revancha en la Misma Sala" })) : (_jsx("div", { className: "flex-1 p-4 bg-dark-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center", children: "Esperando a que el anfitri\u00F3n inicie la revancha..." })), _jsx(Button, { size: "xl", variant: "ghost", onClick: leaveOnlineGame, icon: _jsx(LogOut, { className: "w-5 h-5" }), children: "Salir al Inicio" })] })] }));
    }
    return null;
};
