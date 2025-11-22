import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ className, ...props }) => {
  return (
    <input 
      className={cn("neo-input w-full", className)} 
      {...props} 
    />
  );
};

export default Input;
