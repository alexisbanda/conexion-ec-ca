// /home/alexis/Sites/Landings/conexion-ec-ca/App.tsx
import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { UserStatus } from './types';

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
import { EventDetailPage } from './components/EventDetailPage'; // <-- NUEVO

// --- NUEVO COMPONENTE PARA LA PÁGINA DE ESPERA ---
const PendingApprovalPage: React.FC = () => (
    <section className="py-16 md:py-24 bg-gray-100 text-center min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Cuenta en Revisión</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-xl">
            ¡Gracias por registrarte! Tu cuenta está siendo revisada por nuestro equipo.
            Recibirás una notificación por correo electrónico una vez que sea aprobada.
        </p>
    </section>
);

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
// --- 2. PROTECTEDROUTE MEJORADO ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);

    useEffect(() => {
        // Este efecto solo se encarga de abrir el modal si el usuario intenta
        // acceder a una ruta protegida sin estar logueado.
        if (auth && !auth.loading && !auth.isAuthenticated && !auth.user) {
            auth.openLoginModal();
        }
    }, [auth?.loading, auth?.isAuthenticated, auth?.user, auth?.openLoginModal]);

    if (!auth) return <div>Cargando...</div>;
    if (auth.loading) return <div>Verificando autenticación...</div>;

    // Si el usuario está logueado (tenemos su objeto) pero no está "autenticado" (no aprobado)
    if (auth.user && !auth.isAuthenticated) {
        // Lo redirigimos a la página de espera si su estado es PENDIENTE
        if (auth.user.status === UserStatus.PENDIENTE) {
            return <Navigate to="/pending-approval" replace />;
        }
        // Si está rechazado o en otro estado, lo mandamos a la home.
        // AuthContext ya se encarga de no dejarlo pasar.
        return <Navigate to="/" replace />;
    }

    // Si no hay ningún objeto de usuario (nunca intentó loguearse), a la home.
    if (!auth.user) {
        return <Navigate to="/" replace />;
    }

    // Si pasa todas las validaciones (autenticado y aprobado)
    return <>{children}</>;
};

// --- 3. COMPONENTE PRINCIPAL DE LA APP (AÑADIR RUTA) ---
const App: React.FC = () => {
    const location = useLocation();
    const isDashboardPage = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            <Header isDashboardPage={isDashboardPage} />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    {/* AÑADIR LA NUEVA RUTA */}
                    <Route path="/pending-approval" element={<PendingApprovalPage />} />
                    <Route path="/events/:eventId" element={<EventDetailPage />} />
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