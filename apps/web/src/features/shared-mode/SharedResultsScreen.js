import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Trophy, Skull, Shield, RotateCcw, SlidersHorizontal, Home, CheckCircle2, XCircle, } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
export const SharedResultsScreen = () => {
    const { sharedEndSummary, restartSharedGame, modifySharedConfig, setView, } = useGameStore();
    if (!sharedEndSummary)
        return null;
    const isNormalsWin = sharedEndSummary.winner === 'normals';
    const reasonLabels = {
        all_impostors_found: 'Los ciudadanos descubrieron al impostor en la votación.',
        impostors_survived: 'El impostor logró confundir a todos y pasó desapercibido.',
        impostor_guessed_word: '¡El impostor descubrió la palabra secreta en su última oportunidad!',
        impostor_failed_guess: 'El impostor no logró adivinar la palabra secreta.',
        tie_second_round: 'Segundo empate en votación: Ganan los impostores por falta de consenso.',
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn", children: [_jsxs(Card, { className: `flex flex-col items-center text-center p-8 gap-4 border shadow-2xl ${isNormalsWin
                    ? 'bg-lime-500/10 border-lime-500/50 shadow-glow'
                    : 'bg-red-500/10 border-red-500/50 shadow-glow-red'}`, children: [_jsx("div", { className: `w-20 h-20 rounded-3xl flex items-center justify-center ${isNormalsWin
                            ? 'bg-lime-500 text-dark-950 shadow-glow'
                            : 'bg-red-500 text-white shadow-glow-red'}`, children: isNormalsWin ? _jsx(Trophy, { className: "w-10 h-10" }) : _jsx(Skull, { className: "w-10 h-10" }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-slate-400", children: "Fin de la partida" }), _jsx("h1", { className: `text-3xl md:text-4xl font-black uppercase tracking-tight ${isNormalsWin ? 'text-lime-400' : 'text-red-400'}`, children: isNormalsWin ? '¡Victoria Ciudadana!' : '¡Victoria del Impostor!' }), _jsx("p", { className: "text-xs md:text-sm text-slate-300 max-w-md mt-1", children: reasonLabels[sharedEndSummary.reason] })] })] }), _jsxs(Card, { className: "flex flex-col items-center text-center p-6 gap-2 bg-dark-850 border-slate-700/80", children: [_jsxs("span", { className: "text-xs font-bold uppercase tracking-wider text-slate-400", children: ["Categor\u00EDa: ", sharedEndSummary.categoryName] }), _jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-lime-400", children: "La palabra secreta era" }), _jsxs("div", { className: "text-3xl md:text-4xl font-black text-white tracking-wide py-1", children: ["\u00AB", sharedEndSummary.secretWord, "\u00BB"] }), sharedEndSummary.lastChanceGuess && (_jsxs("div", { className: "mt-2 p-3 bg-dark-950 rounded-2xl border border-slate-800 text-xs flex items-center gap-2", children: [sharedEndSummary.lastChanceGuess.wasCorrect ? (_jsx(CheckCircle2, { className: "w-4 h-4 text-lime-400 shrink-0" })) : (_jsx(XCircle, { className: "w-4 h-4 text-red-400 shrink-0" })), _jsxs("span", { children: ["Adivinanza del impostor: \u00AB", _jsx("strong", { children: sharedEndSummary.lastChanceGuess.guessedWord }), "\u00BB (", sharedEndSummary.lastChanceGuess.wasCorrect ? 'Acertada' : 'Fallida', ")"] })] }))] }), _jsxs(Card, { className: "flex flex-col gap-3", children: [_jsx("h2", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Roles de los participantes" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: sharedEndSummary.players.map((p) => {
                            const isImpostor = p.role === 'impostor';
                            const votesReceived = sharedEndSummary.votingResult?.voteCounts[p.id] || 0;
                            return (_jsxs("div", { className: `p-3 rounded-2xl border flex items-center justify-between ${isImpostor
                                    ? 'bg-red-950/30 border-red-500/40 text-red-200'
                                    : 'bg-dark-950 border-slate-800 text-slate-200'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: `w-7 h-7 rounded-xl flex items-center justify-center ${isImpostor ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`, children: isImpostor ? _jsx(Skull, { className: "w-4 h-4" }) : _jsx(Shield, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-bold block leading-tight", children: p.name }), _jsx("span", { className: "text-[10px] uppercase font-bold text-slate-400", children: isImpostor ? 'Impostor' : 'Inocente' })] })] }), _jsx("div", { className: "text-right", children: _jsxs("span", { className: "text-xs font-bold text-slate-300", children: [votesReceived, " ", votesReceived === 1 ? 'voto' : 'votos'] }) })] }, p.id));
                        }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-2", children: [_jsx(Button, { size: "xl", className: "flex-1 shadow-glow", onClick: restartSharedGame, icon: _jsx(RotateCcw, { className: "w-5 h-5" }), children: "\u00A1Revancha R\u00E1pida!" }), _jsx(Button, { size: "xl", variant: "secondary", onClick: modifySharedConfig, icon: _jsx(SlidersHorizontal, { className: "w-5 h-5" }), children: "Ajustes" }), _jsx(Button, { size: "xl", variant: "ghost", onClick: () => setView('home'), icon: _jsx(Home, { className: "w-5 h-5" }), children: "Inicio" })] })] }));
};
