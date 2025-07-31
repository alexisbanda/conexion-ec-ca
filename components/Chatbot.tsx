// /home/alexis/Sites/Landings/conexion-ec-ca/components/Chatbot.tsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import { ChatMessage } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import {
    ChatBubbleOvalLeftEllipsisIcon,
    PaperAirplaneIcon,
    XMarkIcon
} from './icons';
// --- CAMBIO APLICADO: Seguridad ---
// Se importa DOMPurify para sanitizar el HTML recibido del bot.
import DOMPurify from 'dompurify';


const initialMessage: ChatMessage = {
    role: 'assistant',
    content: `¡Hola! Soy <b>Conex</b>, tu asistente virtual de la Comunidad de Ecuatorianos en Canadá!. Estoy aquí para ayudarte con tus preguntas sobre la vida y migración en Canadá. ¿En qué puedo ayudarte hoy?`
};

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const auth = useContext(AuthContext);

    // --- CAMBIO APLICADO: UX y Accesibilidad ---
    // Ref para el campo de texto para poder hacer focus en él.
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- CAMBIO APLICADO: UX y Accesibilidad ---
    // Este efecto maneja el foco automático al abrir el chat.
    useEffect(() => {
        if (isOpen) {
            // Se usa un pequeño timeout para asegurar que el input es parte del DOM
            // y visible después de la animación de entrada de la ventana.
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Efecto para manejar los clics en los enlaces dinámicos del chat
    useEffect(() => {
        const handleChatClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const link = target.closest('a');
            if (!link || !auth) return;

            const action = link.dataset.action;
            if (action) {
                event.preventDefault();
                if (action === 'open-register') {
                    setIsOpen(false);
                    auth.openRegisterModal();
                } else if (action === 'focus-contact') {
                    const contactForm = document.getElementById('contact');
                    if (contactForm) {
                        setIsOpen(false);
                        contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        };

        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('click', handleChatClick);
        }

        return () => {
            if (container) {
                container.removeEventListener('click', handleChatClick);
            }
        };
    }, [auth, messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // --- CAMBIO APLICADO: Rendimiento ---
            // Se recorta el historial en el cliente antes de enviarlo al backend.
           // Capturamos el contenido de texto principal de la página.
const mainContentElement = document.querySelector('#page-content') || document.querySelector('main');
// Usamos .innerText para obtener solo el texto, sin HTML.
// Limitamos a 2000 caracteres para no sobrecargar el prompt.
const mainContentText = mainContentElement ? mainContentElement.innerText.trim().substring(0, 2000) : '';

const pageContext = {
    url: window.location.href,
    title: document.title,
    // Añadimos el contenido de texto
    content: mainContentText
};


    const MAX_MESSAGES_IN_HISTORY = 8;
    const allMessages = [...messages, userMessage];
    const historyToSend = allMessages.slice(-MAX_MESSAGES_IN_HISTORY);

    const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Si tienes autenticación, el token iría aquí
        },
        body: JSON.stringify({
            messages: historyToSend,
            // Añadimos el objeto de contexto a la petición
            context: pageContext
        })
    });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Hubo un problema con la respuesta del asistente.');
            }

            const data = await response.json();
            setMessages(prev => [...prev, data.message]);

        } catch (error) {
            console.error("Error al contactar al chatbot:", error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 bg-ecuador-red text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 z-50"
                aria-label="Abrir chat de ayuda"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col animate-chat-window-in z-50">
                    <header className="bg-ecuador-blue text-white p-4 rounded-t-xl flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-ecuador-yellow">Asistente Virtual Conex</h3>
                            <p className="text-xs opacity-80">Ayuda sobre migración a Canadá</p>
                        </div>
                        <button onClick={toggleChat} aria-label="Cerrar chat">
                            <XMarkIcon className="w-6 h-6 hover:text-ecuador-yellow" />
                        </button>
                    </header>

                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto scrollbar-hide bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                        msg.role === 'user'
                                            ? 'bg-ecuador-red text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                                >
                                    {/* --- CAMBIO APLICADO: Seguridad --- */}
                                    {/* Se renderiza el contenido de forma segura. El HTML del bot se sanitiza */}
                                    {/* y el contenido del usuario se trata como texto plano. */}
                                    {msg.role === 'assistant' ? (
                                        <p
                                            className="text-sm"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(msg.content)
                                            }}
                                        ></p>
                                    ) : (
                                        <p className="text-sm">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <footer className="p-4 border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                // --- CAMBIO APLICADO: UX y Accesibilidad ---
                                // Se asigna la ref al input.
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu pregunta aquí..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-ecuador-yellow"
                                disabled={isLoading}
                                aria-label="Mensaje para el chatbot"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-ecuador-blue text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                aria-label="Enviar mensaje"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
};