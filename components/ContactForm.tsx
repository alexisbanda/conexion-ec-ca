import React, { useState } from 'react';
import { FORMSPREE_ENDPOINT } from '../constants';
import { CheckCircleIcon, ExclamationCircleIcon } from './icons';

interface FormData {
  name: string;
  email: string;
  message: string;
}

// Define a more specific type for Formspree errors if known, otherwise use a general one
interface FormspreeError {
  message: string;
  // Potentially other fields like 'code' or 'field'
}

interface FormspreeErrorResponse {
  errors: FormspreeError[];
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        const data = await response.json();
        // Check if data is an object, has an 'errors' property, and 'errors' is an array
        if (data && typeof data === 'object' && 'errors' in data && Array.isArray((data as FormspreeErrorResponse).errors)) {
          setStatus({ type: 'error', message: (data as FormspreeErrorResponse).errors.map(error => error.message).join(", ") });
        } else {
          setStatus({ type: 'error', message: 'Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.' });
        }
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Hubo un error al enviar tu mensaje. Verifica tu conexión a internet.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="contact">
      <div className="py-14 md:py-16 bg-ecuador-blue">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-yellow mb-4 font-montserrat">Contáctanos</h2>
            <p className="text-lg text-ecuador-yellow-light max-w-xl mx-auto">
              ¿Tienes preguntas o quieres unirte? Envíanos un mensaje y te responderemos a la brevedad.
            </p>
          </div>
          <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                  aria-label="Nombre Completo"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                  aria-label="Correo Electrónico"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje (Opcional)</label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                  aria-label="Tu mensaje"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ecuador-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                  aria-label="Enviar formulario de contacto"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </form>
            {status.message && (
              <div className={`mt-6 p-4 rounded-md text-sm flex items-center ${
                  status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
                role="alert"
              >
                {status.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <ExclamationCircleIcon className="w-5 h-5 mr-2" />}
                {status.message}
              </div>
            )}
             {FORMSPREE_ENDPOINT === "https://formspree.io/f/YOUR_FORM_ID_HERE" && (
               <p className="mt-4 text-xs text-center text-gray-500">
                 Nota: El formulario de contacto es una demostración. Reemplace YOUR_FORM_ID_HERE en `constants.ts` con su endpoint de Formspree real para habilitarlo.
               </p>
             )}
          </div>
        </div>
      </div>
    </section>
  );
};
