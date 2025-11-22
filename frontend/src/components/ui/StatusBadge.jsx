import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-200',
      'waiting': 'bg-yellow-200',
      'ready': 'bg-blue-200',
      'done': 'bg-green-200',
      'cancelled': 'bg-red-200'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-200';
  };

  return (
    <span className={`px-2 py-1 font-bold text-xs border-2 border-black ${getStatusColor(status)} ${className}`}>
      {status?.toUpperCase() || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;

