import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Skull, KeyRound } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
export const SharedLastChanceScreen = () => {
    const { sharedPlayers, sharedLastChanceImpostorId, sharedCategory, submitSharedLastChanceGuess, } = useGameStore();
    const [guessInput, setGuessInput] = useState('');
    const impostorIndex = sharedLastChanceImpostorId
        ? parseInt(sharedLastChanceImpostorId.replace('local_p_', ''), 10)
        : 0;
    const impostorName = sharedPlayers[impostorIndex] || 'Impostor';
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!guessInput.trim())
            return;
        submitSharedLastChanceGuess(guessInput);
    };
    return (_jsx("div", { className: "max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn", children: _jsxs(Card, { className: "w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl border-red-500/50 bg-red-950/20", children: [_jsx("div", { className: "w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-glow-red", children: _jsx(Skull, { className: "w-10 h-10" }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-red-400", children: "\u00A1Impostor Descubierto!" }), _jsx("h2", { className: "text-2xl md:text-3xl font-black text-white", children: impostorName })] }), _jsxs("div", { className: "p-3 bg-dark-950 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed text-left flex items-start gap-2.5", children: [_jsx(KeyRound, { className: "w-4 h-4 text-amber-400 shrink-0 mt-0.5" }), _jsxs("span", { children: [_jsx("strong", { children: "\u00DAltima oportunidad:" }), " P\u00E1sale el dispositivo a", ' ', _jsx("strong", { className: "text-white", children: impostorName }), ". Si adivina la palabra secreta exacta, \u00A1robar\u00E1 la victoria para el equipo impostor!"] })] }), sharedCategory && (_jsxs("div", { className: "text-xs text-slate-400", children: ["Categor\u00EDa: ", _jsx("span", { className: "text-white font-bold", children: sharedCategory.name })] })), _jsxs("form", { onSubmit: handleSubmit, className: "w-full flex flex-col gap-3", children: [_jsx("input", { type: "text", placeholder: "Escribe la palabra secreta...", value: guessInput, onChange: (e) => setGuessInput(e.target.value), autoFocus: true, className: "w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-lime-500 text-center font-bold" }), _jsx(Button, { size: "xl", type: "submit", className: "w-full py-4 text-base shadow-glow", disabled: !guessInput.trim(), children: "Confirmar Adivinanza" })] })] }) }));
};
