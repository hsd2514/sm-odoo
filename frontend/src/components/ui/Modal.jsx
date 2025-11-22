import React from 'react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="neo-box p-8 w-full max-w-lg relative bg-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 font-bold text-xl hover:text-red-500"
        >
          X
        </button>
        <h3 className="text-2xl font-black mb-6 uppercase">{title}</h3>
        {children}
        {footer && (
          <div className="pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

