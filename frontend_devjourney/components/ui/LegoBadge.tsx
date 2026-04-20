import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LegoBadgeProps {
  children: React.ReactNode;
  variant?: 'easy' | 'medium' | 'hard' | 'status' | 'default';
  className?: string;
}

const LegoBadge = ({ children, variant = 'default', className }: LegoBadgeProps) => {
  const variants = {
    easy: 'bg-lego-green border-green-900 text-white',
    medium: 'bg-lego-yellow border-yellow-700 text-black',
    hard: 'bg-lego-red border-red-900 text-white',
    status: 'bg-lego-blue border-blue-900 text-white',
    default: 'bg-lego-dark border-black text-white',
  };

  return (
    <span className={cn(
      "inline-block font-pixel text-[8px] uppercase px-2 py-1 border-2 border-b-4 border-r-4 rounded-brick",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default LegoBadge;
