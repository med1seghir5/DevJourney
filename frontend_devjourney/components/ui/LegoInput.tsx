import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LegoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const LegoInput = React.forwardRef<HTMLInputElement, LegoInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="block font-pixel text-xs text-lego-yellow">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "w-full bg-black/40 border-4 border-lego-dark rounded-brick px-4 py-3 font-retro text-xl text-white focus:outline-none focus:border-lego-blue placeholder:text-gray-500 transition-colors",
            error && "border-lego-red",
            className
          )}
          {...props}
        />
        {error && <p className="font-pixel text-[10px] text-lego-red">{error}</p>}
      </div>
    );
  }
);

LegoInput.displayName = 'LegoInput';

export default LegoInput;
