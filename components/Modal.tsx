import React from 'react';
import { XMarkIcon } from './icons';
// import { ECUADOR_COLORS } from '../constants'; // ECUADOR_COLORS not directly used here anymore, Tailwind classes preferred

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullWidth?: boolean; // New prop
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, fullWidth }) => {
  if (!isOpen) return null;

  const maxWidthClass = fullWidth ? 'max-w-4xl' : 'max-w-2xl'; // Adjust max-width based on prop

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100] transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto p-0 sm:p-6 relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-appear`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        style={{ animationName: 'modalAppear', animationDuration: '0.3s', animationFillMode: 'forwards' }}
      >
        {/* For fullWidth modals, we might want padding control inside the content, so apply it conditionally or adjust here */}
        {/* The CommunityDirectory component itself has padding, so global p-6 on modal might be too much for it when fullWidth. Let's make padding conditional */}
        <div className={fullWidth ? '' : 'p-6'}>
            <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-ecuador-red transition-colors z-10" // Ensure button is above content
            aria-label="Cerrar modal"
            >
            <XMarkIcon className="w-7 h-7" />
            </button>
            {title && !fullWidth && ( // Title might be part of the CommunityDirectory component itself when fullWidth
            <h2 className="text-2xl font-bold mb-4 text-ecuador-blue font-montserrat">{title}</h2>
            )}
            <div className={`text-gray-700 ${fullWidth ? '' : ''}`}>{children}</div>
        </div>
      </div>
      {/* 
        The keyframes 'modalAppear' are now defined in index.html in a global <style> tag.
        @keyframes modalAppear {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      */}
    </div>
  );
};
