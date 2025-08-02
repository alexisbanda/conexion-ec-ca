import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon } from './icons';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Enviando...');

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'contact', ...formData }).toString()
      });

      if (response.ok) {
        setStatus('¡Mensaje enviado con éxito!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Network response was not ok.');
      }
    } catch (error) {
      setStatus('Hubo un error al enviar el mensaje. Inténtalo de nuevo.');
      console.error('Form submission error:', error);
    }
  };

  return (
    <section 
      id="contact" 
      className="relative bg-cover bg-center text-white py-20 md:py-32"
      style={{ backgroundImage: `url('/assets/images/Vancouver_Quito_2.png')` }}
    >
      <div className="absolute inset-0 bg-ecuador-blue bg-opacity-80"></div>
      
      <div className="relative container mx-auto px-6 flex flex-col items-center">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* --- Encabezado --- */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">Conecta con Nosotros</h2>
            <p className="text-lg text-blue-200 leading-relaxed">
              Tu viaje en Canadá es importante para nosotros. Escríbenos, estamos listos para escucharte.
            </p>
          </div>

          {/* --- Tarjeta Flotante (Glassmorphism) --- */}
          <div className="bg-white/10 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20">
            <form 
              name="contact" 
              method="POST" 
              data-netlify="true" 
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden"><label>Don’t fill this out if you’re human: <input name="bot-field" /></label></p>
              
              <div className="space-y-8">
                <div className="relative">
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="peer w-full bg-transparent border-b-2 border-white/50 text-white placeholder-transparent focus:outline-none focus:border-ecuador-yellow transition-colors" placeholder="Nombre Completo" />
                  <label htmlFor="name" className="absolute left-0 -top-5 text-blue-200 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-100/70 peer-placeholder-shown:top-0.5 peer-focus:-top-5 peer-focus:text-ecuador-yellow peer-focus:text-sm">Nombre Completo</label>
                </div>
                <div className="relative">
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="peer w-full bg-transparent border-b-2 border-white/50 text-white placeholder-transparent focus:outline-none focus:border-ecuador-yellow transition-colors" placeholder="Correo Electrónico" />
                  <label htmlFor="email" className="absolute left-0 -top-5 text-blue-200 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-100/70 peer-placeholder-shown:top-0.5 peer-focus:-top-5 peer-focus:text-ecuador-yellow peer-focus:text-sm">Correo Electrónico</label>
                </div>
                <div className="relative">
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={4} className="peer w-full bg-transparent border-b-2 border-white/50 text-white placeholder-transparent focus:outline-none focus:border-ecuador-yellow transition-colors" placeholder="Tu Mensaje"></textarea>
                  <label htmlFor="message" className="absolute left-0 -top-5 text-blue-200 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-100/70 peer-placeholder-shown:top-1 peer-focus:-top-5 peer-focus:text-ecuador-yellow peer-focus:text-sm">Tu Mensaje</label>
                </div>
              </div>

              <button type="submit" className="mt-10 w-full bg-ecuador-yellow hover:bg-yellow-400 text-ecuador-blue font-bold py-4 px-4 rounded-xl text-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 flex items-center justify-center">
                <PaperAirplaneIcon className="w-6 h-6 mr-3" />
                Enviar Mensaje
              </button>

              {status && <p className="mt-4 text-center text-sm font-medium text-white">{status}</p>}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};