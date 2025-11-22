import React from 'react';
import Input from './Input';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder, value, onChange, className = '' }) => {
  return (
    <div className={`neo-box p-4 flex items-center gap-4 bg-white ${className}`}>
      <Search size={24} className="flex-shrink-0" />
      <Input 
        placeholder={placeholder || "Search..."} 
        value={value}
        onChange={onChange}
        className="flex-1" 
      />
    </div>
  );
};

export default SearchBar;

