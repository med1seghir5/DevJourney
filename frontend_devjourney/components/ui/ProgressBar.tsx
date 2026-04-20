import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string;
  className?: string;
}

const ProgressBar = ({ value, color = 'bg-lego-green', className }: ProgressBarProps) => {
  // Quantize value to increments of 5 for blocky feel
  const quantizedValue = Math.floor(value / 5) * 5;

  return (
    <div className={cn("w-full h-6 bg-black/40 border-4 border-lego-dark rounded-brick overflow-hidden", className)}>
      <div 
        className={cn(
          "h-full transition-all duration-500 ease-in-out",
          color
        )}
        style={{ 
          width: `${quantizedValue}%`,
          backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
          backgroundSize: '30px 30px',
          animation: 'progress-shimmer 2s linear infinite'
        }}
      />
      <style jsx>{`
        @keyframes progress-shimmer {
          from { background-position: 0 0; }
          to { background-position: 30px 0; }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
