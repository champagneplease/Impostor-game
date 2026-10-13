import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, variant = 'default', className = '', ...props }) => {
    const baseStyles = 'rounded-3xl p-5 md:p-6 transition-all duration-200 border';
    const variantStyles = {
        default: 'bg-dark-900/90 border-slate-800/80 backdrop-blur-md shadow-lg',
        elevated: 'bg-dark-850 border-slate-700/80 shadow-xl',
        interactive: 'bg-dark-900/90 border-slate-800 hover:border-lime-500/60 hover:bg-dark-850 cursor-pointer active:scale-[0.99] shadow-lg hover:shadow-glow',
        highlight: 'bg-gradient-to-b from-dark-850 to-dark-900 border-lime-500/50 shadow-glow',
        danger: 'bg-red-950/20 border-red-500/40 shadow-glow-red',
    };
    return (_jsx("div", { className: `${baseStyles} ${variantStyles[variant]} ${className}`, ...props, children: children }));
};
