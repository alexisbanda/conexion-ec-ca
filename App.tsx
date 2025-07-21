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
import AdminRoute from './components/AdminRoute';
import { EventDetailPage } from './components/EventDetailPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { Chatbot } from './components/Chatbot'; // <-- 1. IMPORTAR EL CHATBOT
import AdminLayout from './components/admin/layout/AdminLayout';
import NationalRegionSelector from './components/NationalRegionSelector';
import ReportsDashboard from './components/admin/ReportsDashboard';
import { AdManager } from './components/admin/AdManager';
import UserManager from './components/admin/UserManager';
import ServiceManager from './components/admin/ServiceManager';
import EventManager from './components/admin/EventManager';

const PendingApprovalPage: React.FC = () => (
    <section className="py-16 md:py-24 bg-gray-100 text-center min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Cuenta en Revisión</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-xl">
            ¡Gracias por registrarte! Tu cuenta está siendo revisada por nuestro equipo.
            Recibirás una notificación por correo electrónico una vez que sea aprobada.
        </p>
    </section>
);


const LandingPage: React.FC = () => (
    <>
        <ScrollProgressBar />
        {/* Usamos <section> para cada bloque temático. El id permite la navegación por ancla. */}
            <Hero />
            <AboutUs />
            <Benefits />
            <ResourcesTools />
            <EventsNews />
            <ContactForm />
    </>
);

// --- PROTECTEDROUTE MEJORADO ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);
    const location = useLocation(); // Necesario para evitar bucles de redirección

    useEffect(() => {
        if (auth && !auth.loading && !auth.isAuthenticated && !auth.user) {
            auth.openLoginModal();
        }
    }, [auth?.loading, auth?.isAuthenticated, auth?.user, auth?.openLoginModal]);

    if (!auth) return <div>Cargando...</div>;
    if (auth.loading) return <div>Verificando autenticación...</div>;

    // 1. Si no hay usuario (nunca ha iniciado sesión), lo mandamos a la home.
    if (!auth.user) {
        return <Navigate to="/" replace />;
    }

    // 2. Si el usuario existe pero no está aprobado
    if (!auth.isAuthenticated) {
        if (auth.user.status === UserStatus.PENDIENTE) {
            return <Navigate to="/pending-approval" replace />;
        }
        // Para otros estados (ej. Rechazado), lo mandamos a la home.
        return <Navigate to="/" replace />;
    }

    // 3. Si está aprobado pero no ha completado el onboarding
    if (auth.user.onboardingCompleted === false) {
        // Y no está ya en la página de onboarding, lo redirigimos allí.
        if (location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }
    }

    // 4. (Opcional pero recomendado) Si ya completó el onboarding e intenta volver a esa página, lo mandamos al dashboard.
    if (auth.user.onboardingCompleted === true && location.pathname === '/onboarding') {
        return <Navigate to="/dashboard" replace />;
    }

    // 5. Si pasa todas las validaciones, mostramos el contenido protegido.
    return <>{children}</>;
};

const App: React.FC = () => {
    const location = useLocation();
    const isDashboardPage = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/onboarding');
    const isRegionSelectorPage = location.pathname === '/';

    return (
        <div className="flex flex-col min-h-screen">
            {/* No mostrar el Header en la página de selección de región */}
            {!isRegionSelectorPage && <Header isDashboardPage={isDashboardPage} />}
            <main className={`flex-grow flex flex-col ${isDashboardPage ? 'pt-16' : ''}`}>
                <Routes>
                    <Route path="/" element={<NationalRegionSelector />} />
                    <Route path="/:region" element={<LandingPage />} />
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
                    {/* --- AÑADIR LA RUTA PARA EL ONBOARDING --- */}
                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute>
                                <OnboardingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route index element={<ReportsDashboard />} />
                        <Route path="ads" element={<AdManager />} />
                        <Route path="users" element={<UserManager />} />
                        <Route path="events" element={<EventManager />} />
                        <Route path="services" element={<ServiceManager />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
            <AuthModals />
            <Chatbot /> {/* <-- 2. AÑADIR EL COMPONENTE AQUÍ */}
        </div>
    );
};

export default App;