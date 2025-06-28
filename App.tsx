// /home/alexis/Sites/Landings/conexion-ec-ca/App.tsx
import React, { useContext, useEffect } from 'react'; // Importa useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// Importa tus componentes
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
import { AdminDashboard } from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';

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

// --- INICIO DE LA CORRECCIÓN ---
// Componente para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);

    // Los Hooks siempre deben llamarse en el nivel superior.
    // La lógica condicional va DENTRO del Hook.
    useEffect(() => {
        // Solo queremos abrir el modal si la carga ha terminado y el usuario NO está autenticado.
        if (auth && !auth.loading && !auth.isAuthenticated) {
            auth.openLoginModal();
        }
    }, [auth?.loading, auth?.isAuthenticated, auth?.openLoginModal]); // Dependencias específicas

    if (!auth) {
        return <div>Cargando...</div>;
    }
    if (auth.loading) {
        return <div>Verificando autenticación...</div>; // Muestra un loader mientras se verifica
    }

    // Si no está autenticado, redirigimos. El useEffect de arriba se encargará de abrir el modal.
    if (!auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
// --- FIN DE LA CORRECCIÓN ---


const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContentWithHeader />
            </Router>
        </AuthProvider>
    );
};

const AppContentWithHeader: React.FC = () => {
    const location = useLocation();
    const isDashboardPage = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
    return (
        <div className="flex flex-col min-h-screen">
            <Header isDashboardPage={isDashboardPage} />
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
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
            <AuthModals />
        </div>
    );
};

export default App;