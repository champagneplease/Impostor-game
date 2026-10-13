import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FolderOpen, Plus, Trash2, Download, Upload, RotateCcw, Search, Check, ChevronDown, ChevronUp, ArrowLeft, HelpCircle, } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useGameStore } from '../../stores/useGameStore';
import { StorageService } from '../../services/storageService';
import { INITIAL_CATEGORIES, INITIAL_WORDS } from '@impostor/shared';
export const CategoriesManagerScreen = () => {
    const { setView } = useGameStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCatId, setExpandedCatId] = useState(null);
    // Modales
    const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
    const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
    const [targetCatIdForWord, setTargetCatIdForWord] = useState('');
    const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
    // Estado de inputs para nueva categoría
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    // Estado de inputs para nueva palabra
    const [newWordText, setNewWordText] = useState('');
    const [newWordDiff, setNewWordDiff] = useState('medium');
    const [newWordHint, setNewWordHint] = useState('');
    const [notification, setNotification] = useState(null);
    const storage = StorageService.load();
    const allCategories = [...INITIAL_CATEGORIES, ...storage.customCategories];
    const allWords = [...INITIAL_WORDS, ...storage.customWords];
    const filteredCategories = allCategories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };
    // Crear Categoría
    const handleCreateCategory = (e) => {
        e.preventDefault();
        if (!newCatName.trim())
            return;
        const newId = `custom_cat_${Date.now()}`;
        const newCategory = {
            id: newId,
            name: newCatName.trim(),
            description: newCatDesc.trim(),
            icon: 'Folder',
            isCustom: true,
            enabled: true,
        };
        const current = StorageService.load();
        current.customCategories.push(newCategory);
        StorageService.save(current);
        setNewCatName('');
        setNewCatDesc('');
        setIsAddCatModalOpen(false);
        showNotification('success', `Categoría «${newCategory.name}» creada correctamente.`);
    };
    // Crear Palabra
    const handleCreateWord = (e) => {
        e.preventDefault();
        if (!newWordText.trim() || !targetCatIdForWord)
            return;
        const newWord = {
            id: `custom_w_${Date.now()}`,
            categoryId: targetCatIdForWord,
            text: newWordText.trim(),
            difficulty: newWordDiff,
            impostorHint: newWordHint.trim() || undefined,
            tags: ['personalizada'],
            enabled: true,
        };
        const current = StorageService.load();
        current.customWords.push(newWord);
        StorageService.save(current);
        setNewWordText('');
        setNewWordHint('');
        setIsAddWordModalOpen(false);
        showNotification('success', `Palabra «${newWord.text}» agregada a la categoría.`);
    };
    // Eliminar Categoría Personalizada
    const handleDeleteCategory = (catId, catName) => {
        if (!confirm(`¿Eliminar la categoría «${catName}» y todas sus palabras personalizadas?`))
            return;
        const current = StorageService.load();
        current.customCategories = current.customCategories.filter((c) => c.id !== catId);
        current.customWords = current.customWords.filter((w) => w.categoryId !== catId);
        StorageService.save(current);
        showNotification('success', `Categoría «${catName}» eliminada.`);
    };
    // Eliminar Palabra Personalizada
    const handleDeleteWord = (wordId, wordText) => {
        const current = StorageService.load();
        current.customWords = current.customWords.filter((w) => w.id !== wordId);
        StorageService.save(current);
        showNotification('success', `Palabra «${wordText}» eliminada.`);
    };
    // Exportar JSON
    const handleExportJson = () => {
        const jsonStr = StorageService.exportCategories();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `impostor-categorias-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('success', 'Archivo JSON exportado correctamente.');
    };
    // Importar JSON
    const handleImportJson = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            const res = StorageService.importCategories(content);
            if (res.success) {
                showNotification('success', `Se importaron las categorías personalizadas con éxito.`);
            }
            else {
                showNotification('error', res.error || 'Error al importar.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    // Restaurar por defecto
    const handleResetDefaults = () => {
        StorageService.resetToDefaultCategories();
        setIsResetConfirmModalOpen(false);
        showNotification('success', 'Se restablecieron las categorías predeterminadas.');
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: () => setView('home'), className: "inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Volver al inicio" })] }), _jsx("span", { className: "text-xs uppercase font-extrabold tracking-widest text-lime-400", children: "Administrador de Contenido" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl md:text-3xl font-black text-white", children: "Categor\u00EDas y Palabras" }), _jsx("p", { className: "text-xs md:text-sm text-slate-400 mt-1", children: "Explora las 24 categor\u00EDas oficiales o crea tus propios paquetes para jugar." })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Button, { size: "sm", onClick: () => setIsAddCatModalOpen(true), icon: _jsx(Plus, { className: "w-4 h-4" }), children: "Nueva Categor\u00EDa" }), _jsx(Button, { size: "sm", variant: "secondary", onClick: handleExportJson, title: "Exportar JSON", icon: _jsx(Download, { className: "w-4 h-4" }), children: "Exportar" }), _jsxs("label", { className: "cursor-pointer", children: [_jsx("input", { type: "file", accept: ".json", onChange: handleImportJson, className: "hidden" }), _jsxs("div", { className: "inline-flex items-center justify-center font-bold text-xs px-3.5 py-2 gap-1.5 min-h-[36px] rounded-2xl bg-dark-800 hover:bg-dark-700 text-slate-100 border border-slate-700/60 shadow-sm transition-all active:scale-95", children: [_jsx(Upload, { className: "w-4 h-4" }), _jsx("span", { children: "Importar" })] })] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setIsResetConfirmModalOpen(true), title: "Restaurar por defecto", icon: _jsx(RotateCcw, { className: "w-4 h-4 text-red-400" }), children: "Restaurar" })] })] }), notification && (_jsxs("div", { className: `p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${notification.type === 'success'
                    ? 'bg-lime-500/10 border-lime-500/40 text-lime-300'
                    : 'bg-red-950/60 border-red-500/50 text-red-200'}`, children: [notification.type === 'success' ? (_jsx(Check, { className: "w-4 h-4 text-lime-400" })) : (_jsx(HelpCircle, { className: "w-4 h-4 text-red-400" })), _jsx("span", { children: notification.message })] })), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Buscar categor\u00EDas por nombre...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-dark-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500" })] }), _jsx("div", { className: "flex flex-col gap-3", children: filteredCategories.map((category) => {
                    const catWords = allWords.filter((w) => w.categoryId === category.id);
                    const isExpanded = expandedCatId === category.id;
                    return (_jsxs(Card, { className: "p-4 flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: () => setExpandedCatId(isExpanded ? null : category.id), className: "flex-1 text-left flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-center text-lime-400", children: _jsx(FolderOpen, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-bold text-white", children: category.name }), category.isCustom && (_jsx("span", { className: "text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20", children: "Personalizada" }))] }), _jsxs("span", { className: "text-xs text-slate-400", children: [catWords.length, " palabras registradas"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                                                    setTargetCatIdForWord(category.id);
                                                    setIsAddWordModalOpen(true);
                                                }, title: "A\u00F1adir palabra a esta categor\u00EDa", icon: _jsx(Plus, { className: "w-4 h-4 text-lime-400" }), children: "Palabra" }), category.isCustom && (_jsx("button", { onClick: () => handleDeleteCategory(category.id, category.name), className: "p-2 text-slate-500 hover:text-red-400 transition-colors", title: "Eliminar categor\u00EDa", children: _jsx(Trash2, { className: "w-4 h-4" }) })), _jsx("button", { onClick: () => setExpandedCatId(isExpanded ? null : category.id), className: "p-2 text-slate-400 hover:text-white", children: isExpanded ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })] })] }), isExpanded && (_jsx("div", { className: "pt-3 border-t border-slate-800 flex flex-col gap-2", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1", children: catWords.map((word) => (_jsxs("div", { className: "p-2.5 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex flex-col overflow-hidden pr-1", children: [_jsx("span", { className: "font-bold text-slate-200 truncate", children: word.text }), word.impostorHint && (_jsxs("span", { className: "text-[10px] text-slate-400 truncate", children: ["Pista: ", word.impostorHint] }))] }), word.id.startsWith('custom_w_') && (_jsx("button", { onClick: () => handleDeleteWord(word.id, word.text), className: "text-slate-500 hover:text-red-400 transition-colors shrink-0 p-1", title: "Eliminar palabra", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) }))] }, word.id))) }) }))] }, category.id));
                }) }), _jsx(Modal, { isOpen: isAddCatModalOpen, onClose: () => setIsAddCatModalOpen(false), title: "Crear Nueva Categor\u00EDa", children: _jsxs("form", { onSubmit: handleCreateCategory, className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Nombre de la Categor\u00EDa" }), _jsx("input", { type: "text", placeholder: "Ej: Series Argentinas", value: newCatName, maxLength: 50, onChange: (e) => setNewCatName(e.target.value), required: true, className: "w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Descripci\u00F3n (Opcional)" }), _jsx("input", { type: "text", placeholder: "Ej: Producciones ic\u00F3nicas de la televisi\u00F3n nacional", value: newCatDesc, maxLength: 150, onChange: (e) => setNewCatDesc(e.target.value), className: "w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-500" })] }), _jsx(Button, { size: "lg", type: "submit", className: "w-full mt-2", children: "Guardar Categor\u00EDa" })] }) }), _jsx(Modal, { isOpen: isAddWordModalOpen, onClose: () => setIsAddWordModalOpen(false), title: "Agregar Palabra a Categor\u00EDa", children: _jsxs("form", { onSubmit: handleCreateWord, className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Palabra o Frase" }), _jsx("input", { type: "text", placeholder: "Ej: Los Simuladores", value: newWordText, maxLength: 100, onChange: (e) => setNewWordText(e.target.value), required: true, className: "w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Pista para el Impostor (Opcional)" }), _jsx("input", { type: "text", placeholder: "Ej: Cuatro hombres que resuelven problemas inveros\u00EDmiles", value: newWordHint, maxLength: 200, onChange: (e) => setNewWordHint(e.target.value), className: "w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Dificultad" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['easy', 'medium', 'hard'].map((diff) => (_jsx("button", { type: "button", onClick: () => setNewWordDiff(diff), className: `py-2 rounded-xl text-xs font-bold border transition-all ${newWordDiff === diff
                                            ? 'bg-lime-500 text-dark-950 border-lime-400 font-black'
                                            : 'bg-dark-950 border-slate-800 text-slate-400'}`, children: diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Normal' : 'Difícil' }, diff))) })] }), _jsx(Button, { size: "lg", type: "submit", className: "w-full mt-2", children: "Guardar Palabra" })] }) }), _jsx(Modal, { isOpen: isResetConfirmModalOpen, onClose: () => setIsResetConfirmModalOpen(false), title: "Confirmar Restablecimiento", maxWidth: "sm", children: _jsxs("div", { className: "flex flex-col gap-4 text-center", children: [_jsx("p", { className: "text-xs text-slate-300 leading-relaxed", children: "\u00BFEst\u00E1s seguro de que deseas eliminar todas las categor\u00EDas y palabras personalizadas y restaurar el banco de f\u00E1brica?" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "md", variant: "danger", className: "flex-1", onClick: handleResetDefaults, children: "S\u00ED, Restablecer" }), _jsx(Button, { size: "md", variant: "secondary", className: "flex-1", onClick: () => setIsResetConfirmModalOpen(false), children: "Cancelar" })] })] }) })] }));
};
