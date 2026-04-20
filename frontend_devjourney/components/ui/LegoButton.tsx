import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LegoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const LegoButton = React.forwardRef<HTMLButtonElement, LegoButtonProps>(
  ({ className, variant = 'blue', size = 'md', ...props }, ref) => {
    // #E3000B (red) -> danger/hard/logout
    // #006DB7 (blue) -> primary actions
    // #FFD700 (yellow) -> rank highlights
    // #00A650 (green) -> submit/easy/completed
    // #FF6E00 (orange) -> CTA primary button
    // #1C2B39 (dark navy) -> background/base

    const variants = {
      red: 'bg-lego-red border-red-900 text-white shadow-[#800000]',
      blue: 'bg-lego-blue border-[#004a80] text-white',
      yellow: 'bg-lego-yellow border-[#ccac00] text-black',
      green: 'bg-lego-green border-[#007337] text-white',
      orange: 'bg-lego-orange border-[#cc5800] text-white',
      dark: 'bg-lego-dark border-black text-white',
    };

    const sizes = {
      sm: 'px-3 py-1 text-[8px] md:text-[10px]',
      md: 'px-6 py-3 text-[10px] md:text-sm',
      lg: 'px-8 py-5 text-sm md:text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative font-pixel border-b-[6px] border-r-[6px] rounded-brick transition-all active:translate-y-[4px] active:border-b-[2px] active:border-r-[2px] active:shadow-none hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

LegoButton.displayName = 'LegoButton';

export default LegoButton;
