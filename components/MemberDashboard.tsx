// /home/alexis/Sites/Landings/conexion-ec-ca/components/MemberDashboard.tsx
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ECUADOR_COLORS } from '../constants';
import { BriefcaseIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, UserCircleIcon, MapPinIcon } from './icons';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

export const MemberDashboard: React.FC = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate(); // Inicializa useNavigate

    // Este componente solo debería renderizarse si el usuario está autenticado.
    // Si por alguna razón no lo está, podemos mostrar un mensaje o redirigir.
    if (!auth || !auth.isAuthenticated || !auth.user) {
        return (
            <section id="member-dashboard" className="py-16 md:py-24 bg-gray-100 text-center min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Acceso Restringido</h2>
                <p className="text-lg text-gray-700 mb-6">Por favor, inicia sesión para acceder a tu espacio de miembro.</p>
                <button onClick={auth?.openLoginModal} className="mt-6 bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
                    Iniciar Sesión
                </button>
            </section>
        );
    }

    const { user } = auth;

    // Función para navegar a la página principal y luego hacer scroll a una sección
    const handleNavigateToSection = (sectionId: string) => {
        navigate('/'); // Navega a la página principal
        // Usa un timeout para asegurar que la navegación se complete antes de hacer scroll
        setTimeout(() => {
            const targetElement = document.getElementById(sectionId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Usa 'start' para alinear al inicio
            }
        }, 100); // Pequeño retraso para permitir la transición de página
    };

    return (
        <section id="member-dashboard" className="py-16 md:py-24 bg-ecuador-blue-light min-h-screen pt-24"> {/* Añadido pt-24 para empujar el contenido debajo del header fijo */}
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">
                        ¡Bienvenido, {user.name || user.email}!
                    </h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        Este es tu espacio exclusivo como miembro de Conexión Migrante EC-CA. Aquí encontrarás recursos y oportunidades diseñadas solo para ti.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Tarjeta de Recursos Premium */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <BriefcaseIcon className="w-12 h-12 text-ecuador-red mb-4" />
                        <h3 className="text-xl font-semibold text-ecuador-blue mb-2 font-montserrat">Recursos Premium</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Accede a guías avanzadas, plantillas y herramientas exclusivas para tu desarrollo profesional y personal en Canadá.</p>
                        <button
                            onClick={() => handleNavigateToSection('resources-tools')}
                            className="text-ecuador-red font-semibold hover:underline mt-auto"
                        >
                            Explorar Recursos &rarr;
                        </button>
                    </div>

                    {/* Tarjeta de Directorio Comunitario */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <MapPinIcon className="w-12 h-12 text-ecuador-red mb-4" />
                        <h3 className="text-xl font-semibold text-ecuador-blue mb-2 font-montserrat">Directorio Comunitario</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Conecta con negocios y servicios de nuestra comunidad, y publica los tuyos propios.</p>
                        <button
                            onClick={() => handleNavigateToSection('resources-tools')}
                            className="text-ecuador-red font-semibold hover:underline mt-auto"
                        >
                            Ver Directorio &rarr;
                        </button>
                    </div>

                    {/* Tarjeta de Eventos Exclusivos */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CalendarDaysIcon className="w-12 h-12 text-ecuador-red mb-4" />
                        <h3 className="text-xl font-semibold text-ecuador-blue mb-2 font-montserrat">Eventos Exclusivos</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Participa en talleres privados, sesiones de preguntas y respuestas con expertos y encuentros de networking solo para miembros.</p>
                        <button
                            onClick={() => handleNavigateToSection('events-news')}
                            className="text-ecuador-red font-semibold hover:underline mt-auto"
                        >
                            Ver Eventos &rarr;
                        </button>
                    </div>

                    {/* Tarjeta de Foro de Miembros (Próximamente) - Feedback visual mejorado */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center opacity-70 cursor-not-allowed"> {/* Añadida opacidad y cursor */}
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mb-4" /> {/* Cambiado color del icono */}
                        <h3 className="text-xl font-semibold text-gray-600 mb-2 font-montserrat">Foro de Miembros</h3> {/* Cambiado color del texto */}
                        <p className="text-gray-500 text-sm mb-4 flex-grow">Conéctate directamente con otros miembros, comparte experiencias y resuelve dudas en nuestro foro privado.</p>
                        <span className="text-gray-500 font-semibold mt-auto">Próximamente</span> {/* Cambiado a span, eliminado href */}
                    </div>

                    {/* Tarjeta de Perfil de Usuario */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <UserCircleIcon className="w-12 h-12 text-ecuador-red mb-4" />
                        <h3 className="text-xl font-semibold text-ecuador-blue mb-2 font-montserrat">Mi Perfil</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Gestiona tu información personal, preferencias y revisa tu actividad dentro de la comunidad.</p>
                        <button onClick={auth?.openUserProfileModal} className="text-ecuador-red font-semibold hover:underline mt-auto">Ver Perfil &rarr;</button>
                    </div>
                </div>
            </div>
        </section>
    );
};