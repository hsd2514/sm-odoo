import React from 'react';
import { cn } from '../../utils/cn';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none rounded-lg px-4 py-2 font-bold transition-all',
    danger: 'bg-red-500 border-2 border-slate-900 text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none rounded-lg px-4 py-2 font-bold transition-all',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg px-4 py-2 font-medium transition-colors'
  };

  return (
    <button 
      className={cn(
        'flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] || variants.primary,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
