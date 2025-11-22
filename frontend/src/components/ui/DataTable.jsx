import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  emptyMessage = "No data found.",
  loading = false,
  renderRow,
  className = ''
}) => {
  if (loading) {
    return (
      <div className="neo-box p-8 text-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`neo-box overflow-hidden ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-900">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className={`p-4 font-black text-slate-900 uppercase tracking-wider text-sm border-r-2 border-slate-900 last:border-r-0`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-slate-500 font-medium italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            renderRow ? data.map(renderRow) : null
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

