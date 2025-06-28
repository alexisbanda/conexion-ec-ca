import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'; // <-- 1. IMPORTA ReactDOM
import { XMarkIcon } from './icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, fullWidth }) => {
    // 2. Estado para asegurarnos de que el código solo se ejecute en el cliente
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // 3. Si no estamos en el cliente o el modal no está abierto, no renderizamos nada.
    if (!isClient || !isOpen) {
        return null;
    }

    const maxWidthClass = fullWidth ? 'max-w-4xl' : 'max-w-2xl';

    // 4. Usamos ReactDOM.createPortal para renderizar el modal en #modal-root
    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100] transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto p-0 sm:p-6 relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-appear`}
                onClick={(e) => e.stopPropagation()}
                style={{ animationName: 'modalAppear', animationDuration: '0.3s', animationFillMode: 'forwards' }}
            >
                <div className={fullWidth ? '' : 'p-6'}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-ecuador-red transition-colors z-10"
                        aria-label="Cerrar modal"
                    >
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                    {title && !fullWidth && (
                        <h2 className="text-2xl font-bold mb-4 text-ecuador-blue font-montserrat">{title}</h2>
                    )}
                    <div className={`text-gray-700 ${fullWidth ? '' : ''}`}>{children}</div>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')! // <-- El destino del portal
    );
};