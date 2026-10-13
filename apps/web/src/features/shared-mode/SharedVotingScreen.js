import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Vote, Check, EyeOff, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
export const SharedVotingScreen = () => {
    const { sharedPlayers, sharedVotingPlayerIdx, sharedVotingCurtainActive, sharedPhase, sharedTieCandidates, sharedSettings, submitSharedVote, advanceSharedVotingCurtain, } = useGameStore();
    const [selectedTargetId, setSelectedTargetId] = useState(null);
    const voters = sharedPlayers.map((name, idx) => ({
        id: `local_p_${idx}`,
        name,
    }));
    const currentVoter = voters[sharedVotingPlayerIdx];
    const isLastVoter = sharedVotingPlayerIdx === sharedPlayers.length - 1;
    if (!currentVoter)
        return null;
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
        if (!selectedTargetId)
            return;
        submitSharedVote(selectedTargetId);
        setSelectedTargetId(null);
    };
    return (_jsxs("div", { className: "max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn", children: [_jsxs("div", { className: "w-full flex items-center justify-between text-xs text-slate-400 font-semibold mb-6", children: [_jsx("span", { children: sharedPhase === 'tie_breaker' ? 'Votación de desempate' : 'Votación de acusación' }), _jsxs("span", { className: "text-lime-400 font-bold", children: [sharedVotingPlayerIdx + 1, " de ", sharedPlayers.length, " votos"] })] }), sharedPhase === 'tie_breaker' && (_jsxs("div", { className: "w-full mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs text-amber-300 font-semibold", children: [_jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: "Hubo un empate. Voten \u00FAnicamente entre los participantes empatados." })] })), sharedVotingCurtainActive ? (_jsxs(Card, { className: "w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl", children: [_jsx("div", { className: "w-20 h-20 rounded-3xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400 shadow-glow", children: _jsx(Check, { className: "w-10 h-10" }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("h2", { className: "text-2xl font-black text-white", children: "\u00A1Voto Registrado en Secreto!" }), _jsx("p", { className: "text-xs text-slate-400", children: "Nadie puede ver tu elecci\u00F3n." })] }), _jsxs("div", { className: "p-3 bg-dark-950 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center gap-2", children: [_jsx(EyeOff, { className: "w-4 h-4 text-amber-400 shrink-0" }), _jsx("span", { children: isLastVoter
                                    ? 'Todos han votado. Pulsa para revelar los resultados.'
                                    : 'Pasa el dispositivo al siguiente participante sin mostrar la pantalla.' })] }), _jsx(Button, { size: "xl", className: "w-full py-4 text-lg shadow-glow mt-2", onClick: advanceSharedVotingCurtain, children: isLastVoter ? 'Revelar Resultados' : 'Siguiente Votante' })] })) : (
            /* Pantalla 2: Boleta de votación privada */
            _jsxs(Card, { className: "w-full flex flex-col p-6 gap-6 shadow-2xl", children: [_jsxs("div", { className: "text-center flex flex-col gap-1", children: [_jsx("span", { className: "text-[11px] font-extrabold uppercase tracking-widest text-slate-400", children: "Turno secreto de votaci\u00F3n" }), _jsx("h2", { className: "text-2xl font-black text-white", children: currentVoter.name }), _jsx("p", { className: "text-xs text-slate-400", children: "\u00BFQui\u00E9n crees que es el impostor? Selecciona a tu sospechoso:" })] }), _jsx("div", { className: "flex flex-col gap-2", children: eligibleCandidates.map((cand) => {
                            const isSelected = selectedTargetId === cand.id;
                            return (_jsxs("button", { onClick: () => setSelectedTargetId(cand.id), className: `w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${isSelected
                                    ? 'bg-lime-500/20 border-lime-500 text-white shadow-glow font-black'
                                    : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-lime-400 bg-lime-400' : 'border-slate-600'}`, children: isSelected && _jsx("div", { className: "w-2 h-2 rounded-full bg-dark-950" }) }), _jsx("span", { className: "text-sm font-bold", children: cand.name })] }), isSelected && (_jsx("span", { className: "text-xs font-bold text-lime-400", children: "Sospechoso" }))] }, cand.id));
                        }) }), _jsx(Button, { size: "xl", className: "w-full py-4 text-base shadow-glow mt-2", onClick: handleConfirmVote, disabled: !selectedTargetId, icon: _jsx(Vote, { className: "w-5 h-5" }), children: "Confirmar y Ocultar Voto" })] }))] }));
};
