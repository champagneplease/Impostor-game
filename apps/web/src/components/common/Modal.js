import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md', }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const maxWidthStyles = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fadeIn", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", children: [_jsx("div", { className: "fixed inset-0", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { className: `relative w-full ${maxWidthStyles[maxWidth]} bg-dark-900 border border-slate-800 rounded-3xl shadow-2xl p-6 z-10 overflow-hidden max-h-[90vh] flex flex-col`, children: [_jsxs("div", { className: "flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0", children: [_jsx("h2", { id: "modal-title", className: "text-lg font-bold text-white tracking-wide", children: title }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors", "aria-label": "Cerrar modal", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "overflow-y-auto pr-1 flex-1", children: children })] })] }));
};
