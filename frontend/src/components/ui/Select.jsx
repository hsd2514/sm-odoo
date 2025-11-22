import React from 'react';
import { cn } from '../../utils/cn';

const Select = ({ className, children, ...props }) => {
  return (
    <select 
      className={cn("neo-input font-bold", className)} 
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;

