import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Clock, Play, Pause, RotateCcw, Plus, ArrowRight, Vote, Sparkles, } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { audioService } from '../../services/audioService';
export const SharedDebateScreen = () => {
    const { sharedPlayers, sharedCategory, sharedTurnOrder, sharedSettings, startSharedVoting, } = useGameStore();
    const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(sharedSettings.debateDurationSeconds);
    const [isTimerRunning, setIsTimerRunning] = useState(sharedSettings.debateDurationSeconds > 0);
    // Mapear IDs de turno a nombres
    const turnOrderPlayers = sharedTurnOrder.map((id) => {
        const idx = parseInt(id.replace('local_p_', ''), 10);
        return sharedPlayers[idx] || `Jugador ${idx + 1}`;
    });
    useEffect(() => {
        if (!isTimerRunning || secondsLeft <= 0)
            return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    audioService.playError();
                    return 0;
                }
                if (prev <= 10) {
                    audioService.playTimerTick();
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isTimerRunning, secondsLeft]);
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    const handleNextSpeaker = () => {
        audioService.playClick();
        setActiveSpeakerIndex((prev) => (prev + 1) % turnOrderPlayers.length);
    };
    const currentSpeaker = turnOrderPlayers[activeSpeakerIndex];
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fadeIn", children: [_jsxs("div", { className: "text-center flex flex-col items-center gap-1", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-lime-400", children: "Fase 2: Debate en ronda" }), _jsx("h1", { className: "text-3xl md:text-4xl font-black text-white", children: "\u00A1Momento de Hablar!" }), _jsx("p", { className: "text-xs md:text-sm text-slate-400 max-w-md", children: "Cada jugador da una pista en su turno. Cuidado con ser muy obvio o el impostor lo sabr\u00E1." })] }), sharedCategory && sharedSettings.showCategoryToAll && (_jsx("div", { className: "flex items-center justify-center", children: _jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-dark-850 border border-slate-700/80 text-slate-200", children: [_jsx(Sparkles, { className: "w-4 h-4 text-lime-400" }), _jsx("span", { className: "text-xs font-semibold text-slate-400", children: "Categor\u00EDa p\u00FAblica:" }), _jsx("span", { className: "text-sm font-black text-white", children: sharedCategory.name })] }) })), sharedSettings.debateDurationSeconds > 0 && (_jsxs(Card, { className: "flex flex-col items-center text-center p-6 gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider", children: [_jsx(Clock, { className: "w-4 h-4 text-lime-400" }), _jsx("span", { children: "Tiempo restante de debate" })] }), _jsx("div", { className: `text-5xl md:text-6xl font-mono font-black tracking-tight ${secondsLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'}`, children: formatTime(secondsLeft) }), _jsxs("div", { className: "flex items-center gap-2 pt-1", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: () => setIsTimerRunning(!isTimerRunning), icon: isTimerRunning ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }), children: isTimerRunning ? 'Pausar' : 'Reanudar' }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                                    setSecondsLeft((s) => s + 30);
                                    setIsTimerRunning(true);
                                }, icon: _jsx(Plus, { className: "w-4 h-4" }), children: "+30s" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                                    setSecondsLeft(sharedSettings.debateDurationSeconds);
                                    setIsTimerRunning(false);
                                }, icon: _jsx(RotateCcw, { className: "w-4 h-4" }), children: "Reiniciar" })] })] })), _jsxs(Card, { variant: "highlight", className: "flex flex-col items-center text-center p-6 gap-4", children: [_jsx("span", { className: "text-[11px] font-extrabold uppercase tracking-widest text-lime-400", children: "Turno actual para dar una pista" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-lime-500 text-dark-950 flex items-center justify-center font-black text-xl shadow-glow", children: activeSpeakerIndex + 1 }), _jsx("span", { className: "text-2xl md:text-3xl font-black text-white", children: currentSpeaker })] }), _jsx(Button, { size: "md", variant: "secondary", onClick: handleNextSpeaker, icon: _jsx(ArrowRight, { className: "w-4 h-4" }), children: "Siguiente orador" })] }), _jsxs(Card, { className: "flex flex-col gap-3", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Orden completo de turnos" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: turnOrderPlayers.map((name, idx) => {
                            const isActive = idx === activeSpeakerIndex;
                            return (_jsxs("div", { className: `p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${isActive
                                    ? 'bg-lime-500/20 border-lime-500 text-lime-300 shadow-glow font-black'
                                    : 'bg-dark-950 border-slate-800 text-slate-400'}`, children: [_jsx("span", { className: "w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold", children: idx + 1 }), _jsx("span", { className: "truncate", children: name })] }, idx));
                        }) })] }), _jsx("div", { className: "pt-2", children: _jsx(Button, { size: "xl", className: "w-full text-lg shadow-glow py-5", onClick: startSharedVoting, icon: _jsx(Vote, { className: "w-6 h-6 stroke-[2.5]" }), children: "\u00A1Comenzar Votaci\u00F3n Secreta!" }) })] }));
};
