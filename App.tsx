// /home/alexis/Sites/Landings/conexion-ec-ca/App.tsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Importa useLocation
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// Importa tus componentes de sección como componentes de página
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutUs } from './components/AboutUs';
import { Benefits } from './components/Benefits';
import { EventsNews } from './components/EventsNews';
import { ResourcesTools } from './components/ResourcesTools';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { AuthModals } from './components/AuthModals';
import { MemberDashboard } from './components/MemberDashboard';

// Componente para la página principal (Landing Page)
const LandingPage: React.FC = () => (
    <>
        <ScrollProgressBar />
        <Hero />
        <AboutUs />
        <Benefits />
        <EventsNews />
        <ResourcesTools />
        <ContactForm />
    </>
);

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);

    if (!auth) return <div>Cargando...</div>;
    if (auth.loading) return <div>Verificando autenticación...</div>; // Muestra un loader mientras se verifica

    // Si no está autenticado, puedes redirigir a la home y abrir el modal de login
    if (!auth.isAuthenticated) {
        React.useEffect(() => {
            auth.openLoginModal();
        }, [auth]);
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContentWithHeader /> {/* Nuevo componente envoltorio para usar useLocation */}
            </Router>
        </AuthProvider>
    );
};

// Nuevo componente para envolver el contenido principal y pasar props basadas en la ubicación
const AppContentWithHeader: React.FC = () => {
    const location = useLocation(); // Obtiene la ubicación actual
    const isDashboardPage = location.pathname === '/dashboard'; // Verifica si es la página del dashboard

    return (
        <div className="flex flex-col min-h-screen">
            <Header isDashboardPage={isDashboardPage} /> {/* Pasa la prop */}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <MemberDashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* Puedes añadir más rutas aquí, como /perfil, /eventos, etc. */}
                    <Route path="*" element={<Navigate to="/" />} /> {/* Redirige cualquier ruta no encontrada a la home */}
                </Routes>
            </main>
            <Footer />
            <AuthModals />
        </div>
    );
};

export default App;