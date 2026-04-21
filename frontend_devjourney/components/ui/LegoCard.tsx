import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LegoCardProps {
  children?: React.ReactNode;
  variant?: 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'dark' | 'white';
  className?: string;
  showStuds?: boolean;
}

const LegoCard = ({ 
  children, 
  variant = 'dark', 
  className,
  showStuds = true 
}: LegoCardProps) => {
  const variants = {
    red: 'bg-lego-red border-[#800000] text-white',
    blue: 'bg-lego-blue border-[#004a80] text-white',
    yellow: 'bg-lego-yellow border-[#ccac00] text-white',


    green: 'bg-lego-green border-[#007337] text-white',
    orange: 'bg-lego-orange border-[#cc5800] text-white',
    dark: 'bg-lego-dark border-black text-white',
    white: 'bg-white border-gray-300 text-black',
  };

  return (
    <div className="relative pt-3 group">
      {showStuds && (
        <div className="absolute top-0 left-6 right-6 flex justify-around pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-transform group-hover:-translate-y-1",
                i >= 3 && "hidden md:block", // Hide 3 studs on mobile
                variant === 'white' 
                  ? 'bg-gray-100 border-gray-200' 
                  : variant === 'yellow'
                    ? 'bg-black/10 border-black/20'
                    : 'bg-black/30 border-white/10'
              )} 
            />
          ))}
        </div>
      )}
      <div 
        className={cn(
          "relative border-4 border-b-[10px] border-r-[10px] rounded-brick p-4 md:p-6 shadow-brick overflow-hidden",
          variants[variant],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default LegoCard;
