import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ className, ...props }) => {
  return (
    <input 
      className={cn(
        "neo-input",
        className
      )}
      {...props}
    />
  );
};

export default Input;
