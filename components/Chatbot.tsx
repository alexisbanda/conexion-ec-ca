// /home/alexis/Sites/Landings/conexion-ec-ca/components/Chatbot.tsx

import React, { useState, useEffect, useRef, useContext } from 'react';
// --- MODIFICADO: Se importan los nuevos tipos para las acciones ---
import { ChatMessage, ChatAction } from '../types'; 
import { AuthContext } from '../contexts/AuthContext';
import {
    ChatBubbleOvalLeftEllipsisIcon,
    PaperAirplaneIcon,
    XMarkIcon
} from './icons';

const initialMessage: ChatMessage = {
    role: 'assistant',
    content: `¡Hola! Soy <b>Conex</b>, tu asistente virtual. Estoy aquí para ayudarte con tus dudas sobre la vida y migración en Canadá. Puedes escribirme una pregunta o empezar con una de las siguientes opciones:`
};

// --- NUEVO: Lista de Preguntas Frecuentes ---
const frequentQuestions = [
    "¿Cuáles son los primeros trámites que debo hacer al llegar?",
    "¿Cómo puedo adaptar mi CV al formato canadiense?",
    "¿Qué tipos de visa de trabajo existen?",
    "¿Cómo funciona el sistema de salud en Canadá?",
];

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // --- NUEVO: Estado para controlar la visibilidad de las FAQ ---
    const [showFaqs, setShowFaqs] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const auth = useContext(AuthContext);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);
    
    // Maneja los clics en los botones de acción del chat
    useEffect(() => {
        const handleChatClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const link = target.closest('a, button');
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
    }, [auth, isOpen]);


    // --- MODIFICADO: Lógica de envío refactorizada para reutilización ---
    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading) return;

        if (showFaqs) {
            setShowFaqs(false);
        }

        const userMessage: ChatMessage = { role: 'user', content: messageContent };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const currentMessages = [...messages, userMessage];

        try {
            const mainContentElement = document.querySelector('#page-content') || document.querySelector('main');
            const mainContentText = mainContentElement ? mainContentElement.innerText.trim().substring(0, 2000) : '';
            const pageContext = {
                url: window.location.href,
                title: document.title,
                content: mainContentText
            };


    const MAX_MESSAGES_IN_HISTORY = 8;
    const allMessages = [...messages, userMessage];
    const historyToSend = allMessages.slice(-MAX_MESSAGES_IN_HISTORY);

            const response = await fetch('/.netlify/functions/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: historyToSend, context: pageContext })
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
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendMessage(input);
        setInput('');
    };

    const handleFaqClick = async (question: string) => {
        await sendMessage(question);
    };

    const toggleChat = () => setIsOpen(!isOpen);

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
                            <div key={index} className={`flex flex-col mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                        msg.role === 'user'
                                            ? 'bg-ecuador-red text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                                >
                                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content }}></p>
                                </div>
                                
                                {/* --- NUEVO: Renderizado de los botones de acción --- */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 max-w-xs lg:max-w-md">
                                        {msg.actions.map((action, actionIndex) => (
                                            action.type === 'link' ? (
                                                <a
                                                    key={actionIndex}
                                                    href={action.value}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    {action.text}
                                                </a>
                                            ) : (
                                                <button
                                                    key={actionIndex}
                                                    data-action={action.value}
                                                    className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    {action.text}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* --- NUEVO: Renderizado de las Preguntas Frecuentes --- */}
                        {showFaqs && (
                            <div className="mt-4 p-2">
                                <div className="flex flex-col items-start gap-2">
                                    {frequentQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleFaqClick(q)}
                                            className="w-full text-left text-sm text-ecuador-blue p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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
                        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                            <input
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