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
    'relative inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-5 py-3 gap-2 min-h-[48px]',
    xl: 'text-base md:text-lg px-6 py-3.5 gap-2.5 min-h-[54px]',
  };

  const variantStyles = {
    primary:
      'bg-lime-500 hover:bg-lime-400 text-dark-950 font-bold focus-visible:ring-2 focus-visible:ring-lime-400',
    secondary:
      'bg-dark-850 hover:bg-dark-800 text-slate-200 border border-white/[0.08] focus-visible:ring-2 focus-visible:ring-slate-400',
    danger:
      'bg-red-600 hover:bg-red-500 text-white font-bold focus-visible:ring-2 focus-visible:ring-red-400',
    outline:
      'bg-transparent hover:bg-dark-800/80 text-lime-400 border border-lime-500/50 focus-visible:ring-2 focus-visible:ring-lime-400',
    ghost:
      'bg-transparent hover:bg-dark-800 text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-400',
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
