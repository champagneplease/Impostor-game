import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Users, Plus, Trash2, ArrowLeft, Sparkles, Check, } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { StorageService } from '../../services/storageService';
import { INITIAL_CATEGORIES } from '@impostor/shared';
export const SharedSetupScreen = () => {
    const { setView, sharedPlayers, setSharedPlayers, sharedSettings, updateSharedSettings, startSharedGame, } = useGameStore();
    const [newPlayerName, setNewPlayerName] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const storage = StorageService.load();
    const allCategories = [...INITIAL_CATEGORIES, ...storage.customCategories];
    const handleAddPlayer = () => {
        const trimmed = newPlayerName.trim();
        if (!trimmed)
            return;
        if (sharedPlayers.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
            setErrorMessage('Ya existe un participante con ese nombre.');
            return;
        }
        if (sharedPlayers.length >= 16) {
            setErrorMessage('El límite máximo es de 16 participantes.');
            return;
        }
        setSharedPlayers([...sharedPlayers, trimmed]);
        setNewPlayerName('');
        setErrorMessage(null);
    };
    const handleRemovePlayer = (index) => {
        if (sharedPlayers.length <= 3) {
            setErrorMessage('Se requieren al menos 3 jugadores.');
            return;
        }
        const updated = sharedPlayers.filter((_, idx) => idx !== index);
        setSharedPlayers(updated);
        // Ajustar impostores si supera el límite
        if (sharedSettings.impostorCount >= updated.length) {
            updateSharedSettings({ impostorCount: Math.max(1, updated.length - 1) });
        }
        setErrorMessage(null);
    };
    const toggleCategory = (catId) => {
        const current = sharedSettings.selectedCategoryIds;
        if (current.includes(catId)) {
            if (current.length === 1) {
                setErrorMessage('Debes dejar al menos una categoría seleccionada.');
                return;
            }
            updateSharedSettings({ selectedCategoryIds: current.filter((id) => id !== catId) });
        }
        else {
            updateSharedSettings({ selectedCategoryIds: [...current, catId] });
        }
        setErrorMessage(null);
    };
    const toggleSelectAllCategories = () => {
        if (sharedSettings.selectedCategoryIds.length === allCategories.length) {
            // Dejar la primera por defecto
            updateSharedSettings({ selectedCategoryIds: [allCategories[0].id] });
        }
        else {
            updateSharedSettings({ selectedCategoryIds: allCategories.map((c) => c.id) });
        }
    };
    const handleStart = () => {
        if (sharedPlayers.length < 3) {
            setErrorMessage('Se necesitan al menos 3 jugadores para comenzar.');
            return;
        }
        if (sharedSettings.impostorCount >= sharedPlayers.length) {
            setErrorMessage('La cantidad de impostores debe ser menor al número total de jugadores.');
            return;
        }
        if (sharedSettings.selectedCategoryIds.length === 0) {
            setErrorMessage('Selecciona al menos una categoría.');
            return;
        }
        setErrorMessage(null);
        startSharedGame();
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fadeIn", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: () => setView('home'), className: "inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Volver al inicio" })] }), _jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-lime-400", children: "Dispositivo compartido" })] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl md:text-3xl font-black text-white", children: "Configurar Partida" }), _jsx("p", { className: "text-slate-400 text-xs md:text-sm mt-1", children: "A\u00F1ade a tus amigos y personaliza las reglas antes de repartir los roles." })] }), errorMessage && (_jsx("div", { className: "p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs font-bold text-red-200", children: errorMessage })), _jsxs(Card, { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-lime-400" }), _jsxs("h2", { className: "text-base font-bold text-white", children: ["Participantes (", sharedPlayers.length, ")"] })] }), _jsx("span", { className: "text-[11px] font-semibold text-slate-400", children: "M\u00EDnimo: 3 (Recomendado: 4+)" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Nombre del jugador...", value: newPlayerName, maxLength: 25, onChange: (e) => setNewPlayerName(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleAddPlayer(), className: "flex-1 bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500" }), _jsx(Button, { onClick: handleAddPlayer, size: "md", icon: _jsx(Plus, { className: "w-4 h-4" }), children: "A\u00F1adir" })] }), _jsx("div", { className: "flex flex-wrap gap-2 pt-1", children: sharedPlayers.map((player, idx) => (_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800 border border-slate-700/80 text-xs font-semibold text-slate-200", children: [_jsx("span", { className: "w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 text-[10px] flex items-center justify-center font-bold", children: idx + 1 }), _jsx("span", { children: player }), _jsx("button", { onClick: () => handleRemovePlayer(idx), className: "text-slate-400 hover:text-red-400 transition-colors ml-1", title: `Eliminar a ${player}`, "aria-label": `Eliminar a ${player}`, children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] }, idx))) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Impostores" }), _jsx("span", { className: "text-lg font-black text-lime-400", children: sharedSettings.impostorCount })] }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: [1, 2, 3].map((num) => {
                                    const disabled = num >= sharedPlayers.length;
                                    const isSelected = sharedSettings.impostorCount === num;
                                    return (_jsxs("button", { disabled: disabled, onClick: () => updateSharedSettings({ impostorCount: num }), className: `py-2 rounded-xl text-xs font-bold transition-all border ${isSelected
                                            ? 'bg-lime-500 text-dark-950 border-lime-400 shadow-glow font-black'
                                            : disabled
                                                ? 'opacity-30 border-slate-800 bg-dark-950 text-slate-600 pointer-events-none'
                                                : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'}`, children: [num, " ", num === 1 ? 'Impostor' : 'Impostores'] }, num));
                                }) })] }), _jsxs(Card, { className: "flex flex-col gap-3", children: [_jsx("span", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Dificultad del banco de palabras" }), _jsx("div", { className: "grid grid-cols-4 gap-1.5", children: [
                                    { id: 'all', label: 'Todas' },
                                    { id: 'easy', label: 'Fácil' },
                                    { id: 'medium', label: 'Normal' },
                                    { id: 'hard', label: 'Difícil' },
                                ].map((d) => (_jsx("button", { onClick: () => updateSharedSettings({ difficulty: d.id }), className: `py-2 rounded-xl text-xs font-bold transition-all border ${sharedSettings.difficulty === d.id
                                        ? 'bg-lime-500 text-dark-950 border-lime-400 shadow-glow'
                                        : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'}`, children: d.label }, d.id))) })] })] }), _jsxs(Card, { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-lime-400" }), _jsxs("h2", { className: "text-sm font-bold text-white", children: ["Categor\u00EDas Habilitadas (", sharedSettings.selectedCategoryIds.length, "/", allCategories.length, ")"] })] }), _jsx("button", { onClick: toggleSelectAllCategories, className: "text-xs font-semibold text-lime-400 hover:text-lime-300 underline", children: sharedSettings.selectedCategoryIds.length === allCategories.length
                                    ? 'Deseleccionar todas'
                                    : 'Seleccionar todas' })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1", children: allCategories.map((cat) => {
                            const isSelected = sharedSettings.selectedCategoryIds.includes(cat.id);
                            return (_jsxs("button", { onClick: () => toggleCategory(cat.id), className: `p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${isSelected
                                    ? 'bg-lime-500/10 border-lime-500/40 text-lime-300 font-bold'
                                    : 'bg-dark-950 border-slate-800 text-slate-400 hover:bg-dark-800/80 hover:text-slate-200'}`, children: [_jsx("span", { className: "truncate", children: cat.name }), isSelected && _jsx(Check, { className: "w-3.5 h-3.5 text-lime-400 shrink-0 ml-1" })] }, cat.id));
                        }) })] }), _jsxs(Card, { className: "flex flex-col gap-4", children: [_jsx("h2", { className: "text-xs uppercase font-extrabold tracking-wider text-slate-400", children: "Reglas de la partida" }), _jsxs("div", { className: "flex items-center justify-between py-1 border-b border-slate-800/80", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-bold text-white block", children: "Pista para el Impostor" }), _jsx("span", { className: "text-xs text-slate-400", children: sharedSettings.enableHints
                                            ? 'El impostor recibe una pista general para orientarse'
                                            : 'Sin pista: El impostor solo ve que es impostor' })] }), _jsx("button", { onClick: () => updateSharedSettings({ enableHints: !sharedSettings.enableHints }), className: `w-12 h-7 rounded-full transition-colors relative p-1 ${sharedSettings.enableHints ? 'bg-lime-500' : 'bg-slate-700'}`, "aria-label": "Alternar pistas del impostor", children: _jsx("div", { className: `w-5 h-5 rounded-full bg-dark-950 shadow-md transition-transform ${sharedSettings.enableHints ? 'translate-x-5' : 'translate-x-0'}` }) })] }), _jsxs("div", { className: "flex items-center justify-between py-1 border-b border-slate-800/80", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-bold text-white block", children: "\u00DAltima oportunidad al descubrir" }), _jsx("span", { className: "text-xs text-slate-400", children: "Si descubren al impostor, puede intentar adivinar la palabra exacta para ganar" })] }), _jsx("button", { onClick: () => updateSharedSettings({ allowLastChanceGuess: !sharedSettings.allowLastChanceGuess }), className: `w-12 h-7 rounded-full transition-colors relative p-1 ${sharedSettings.allowLastChanceGuess ? 'bg-lime-500' : 'bg-slate-700'}`, "aria-label": "Alternar \u00FAltima oportunidad", children: _jsx("div", { className: `w-5 h-5 rounded-full bg-dark-950 shadow-md transition-transform ${sharedSettings.allowLastChanceGuess ? 'translate-x-5' : 'translate-x-0'}` }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-bold text-white block", children: "Duraci\u00F3n del debate" }), _jsx("span", { className: "text-xs text-slate-400", children: "Tiempo l\u00EDmite de conversaci\u00F3n antes de votar" })] }), _jsx("div", { className: "flex gap-1.5", children: [
                                    { sec: 0, label: 'Libre' },
                                    { sec: 120, label: '2 min' },
                                    { sec: 180, label: '3 min' },
                                    { sec: 300, label: '5 min' },
                                ].map((t) => (_jsx("button", { onClick: () => updateSharedSettings({ debateDurationSeconds: t.sec }), className: `px-3 py-1.5 rounded-xl text-xs font-bold border ${sharedSettings.debateDurationSeconds === t.sec
                                        ? 'bg-lime-500 text-dark-950 border-lime-400 shadow-glow'
                                        : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'}`, children: t.label }, t.sec))) })] })] }), _jsx("div", { className: "pt-2", children: _jsx(Button, { size: "xl", className: "w-full text-lg shadow-glow py-5", onClick: handleStart, children: "\u00A1Comenzar Reparto de Roles!" }) })] }));
};
