import React from 'react';
import { cn } from '../../utils/cn'; // We'll create this utility

const Button = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "neo-btn px-4 py-2 font-bold cursor-pointer";
  const variants = {
    primary: "bg-[var(--color-neo-main)] text-white",
    secondary: "bg-[var(--color-neo-accent)] text-black",
    outline: "bg-white text-black hover:bg-gray-100",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
