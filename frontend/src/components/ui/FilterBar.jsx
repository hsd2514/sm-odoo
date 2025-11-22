import React from 'react';
import { Filter } from 'lucide-react';
import Select from './Select';

const FilterBar = ({ filters, className = '' }) => {
  return (
    <div className={`neo-box p-4 bg-white ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} />
        <h3 className="text-lg font-black uppercase">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block font-bold mb-1 text-sm">{filter.label}</label>
            <Select
              value={filter.value}
              onChange={filter.onChange}
              className="w-full"
            >
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;

