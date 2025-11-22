import React from 'react';
import Input from './Input';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder, value, onChange, className = '' }) => {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />

      {/* Input Field */}
      <Input
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={onChange}
        className="!pl-14 pr-4 py-2 w-full"
      />
    </div>
  );
};

export default SearchBar;
