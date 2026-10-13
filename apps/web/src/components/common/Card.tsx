import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'highlight' | 'danger';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-5 md:p-6 transition-all duration-150 border';

  const variantStyles = {
    default: 'bg-dark-900/70 border-white/[0.06] backdrop-blur-sm',
    elevated: 'bg-dark-850 border-white/[0.08]',
    interactive:
      'bg-dark-900/70 border-white/[0.06] hover:border-lime-500/40 hover:bg-dark-850/80 cursor-pointer active:scale-[0.99]',
    highlight: 'bg-dark-900/90 border-lime-500/30',
    danger: 'bg-red-950/20 border-red-500/30',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
