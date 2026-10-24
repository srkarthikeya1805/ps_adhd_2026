import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${sizeMap[size]}`}>
        {/* Outer glowing cyan ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        {/* Inner reverse-spinning violet ring */}
        <div
          className="absolute inset-1.5 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
        />
        {/* Central glowing core */}
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00E5FF] animate-ping" />
      </div>
      {label && (
        <span className="text-xs font-mono text-cyan-300 tracking-wider uppercase animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};
