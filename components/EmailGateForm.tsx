import React, { useState } from 'react';

interface EmailGateFormProps {
  onEmailSubmit: (email: string) => void;
  onClose: () => void;
  guideTitle: string;
  isSubmitting: boolean;
}

export const EmailGateForm: React.FC<EmailGateFormProps> = ({ onEmailSubmit, onClose, guideTitle, isSubmitting }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Por favor, introduce una dirección de correo válida.');
      return;
    }
    setError('');
    onEmailSubmit(email);
  };

  const validateEmail = (email: string) => {
    // Using a simpler, more permissive regex to avoid issues with complex patterns.
    const re = /\S+@\S+\.\S+/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="p-6 text-center">
      <h4 className="text-xl font-bold text-gray-800 mb-2">Recibe tu Guía Gratuita</h4>
      <p className="text-gray-700 mb-4">
        Estás solicitando la guía: <span className="font-semibold">{guideTitle}</span>.
      </p>
      <p className="text-gray-600 mb-6">
        Ingresa tu correo electrónico y te enviaremos el enlace de descarga a tu bandeja de entrada.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu.correo@ejemplo.com"
            className={`w-full px-4 py-2 border rounded-lg text-center ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-ecuador-yellow`}
            aria-label="Correo electrónico"
            required
            disabled={isSubmitting}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex justify-center gap-4">
            <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-2xl transition-colors"
                disabled={isSubmitting}
            >
                Cancelar
            </button>
            <button
                type="submit"
                className="bg-ecuador-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl transition-colors disabled:bg-gray-400 flex items-center"
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar a mi Correo'
              )}
            </button>
        </div>
      </form>
    </div>
  );
};
