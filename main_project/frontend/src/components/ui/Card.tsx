import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'magenta' | 'none';
  interactive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  onClick,
}) => {
  const glowStyles = {
    none: '',
    cyan: 'hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]',
    violet: 'hover:border-violet-500/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]',
    magenta: 'hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(244,114,208,0.2)]',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl border border-slate-800 p-6 transition-all duration-300 ${
        interactive ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${glowStyles[glow]} ${className}`}
    >
      {children}
    </div>
  );
};
