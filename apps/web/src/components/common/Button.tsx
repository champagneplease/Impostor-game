import React from 'react';
import { audioService } from '../../services/audioService';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      audioService.playClick();
      onClick?.(e);
    }
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-bold tracking-wide rounded-2xl transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-sm';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-3 gap-2 min-h-[46px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[54px]',
    xl: 'text-lg px-8 py-4 gap-3 min-h-[62px]',
  };

  const variantStyles = {
    primary:
      'bg-lime-500 hover:bg-lime-400 text-dark-950 shadow-glow font-extrabold focus-visible:ring-2 focus-visible:ring-lime-400',
    secondary:
      'bg-dark-800 hover:bg-dark-700 text-slate-100 border border-slate-700/60 focus-visible:ring-2 focus-visible:ring-slate-400',
    danger:
      'bg-red-600 hover:bg-red-500 text-white shadow-glow-red focus-visible:ring-2 focus-visible:ring-red-400',
    outline:
      'bg-transparent hover:bg-dark-800/80 text-lime-400 border-2 border-lime-500/70 focus-visible:ring-2 focus-visible:ring-lime-400',
    ghost:
      'bg-transparent hover:bg-dark-800 text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
