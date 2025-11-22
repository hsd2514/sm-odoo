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
          <tr className="bg-[var(--color-neo-accent)] border-b-2 border-black">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className={`p-4 font-black border-r-2 border-black ${index === columns.length - 1 ? '' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-gray-500 italic">
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

