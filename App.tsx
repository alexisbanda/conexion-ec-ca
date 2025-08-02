// /home/alexis/Sites/Landings/conexion-ec-ca/App.tsx
import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { UserStatus } from './types';

// NUEVO: 1. IMPORTAR EL PARALLAX PROVIDER
import { ParallaxProvider } from 'react-scroll-parallax';

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
import { Chatbot } from './components/Chatbot';
import AdminLayout from './components/admin/layout/AdminLayout';
import NationalRegionSelector from './components/NationalRegionSelector';
import ReportsDashboard from './components/admin/ReportsDashboard';
import { AdManager } from './components/admin/AdManager';
import UserManager from './components/admin/UserManager';
import ServiceManager from './components/admin/ServiceManager';
import EventManager from './components/admin/EventManager';
import NewsManager from './components/admin/NewsManager';

const PendingApprovalPage: React.FC = () => (
    // ... (código sin cambios)
    <section className="py-16 md:py-24 bg-gray-100 text-center min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Cuenta en Revisión</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-xl">
            ¡Gracias por registrarte! Tu cuenta está siendo revisada por nuestro equipo.
            Recibirás una notificación por correo electrónico una vez que sea aprobada.
        </p>
    </section>
);


const LandingPage: React.FC = () => {
    const { region } = useParams<{ region: string }>();

    useEffect(() => {
        // Guarda la ruta de la región actual para que el Header sepa a dónde volver
        if (region) {
            sessionStorage.setItem('lastVisitedRegion', `/${region}`);
        }
    }, [region]);

    return (
        <>
            <ScrollProgressBar />
            <Hero />
            <AboutUs />
            <Benefits />
            <ResourcesTools />
            <EventsNews />
            <ContactForm />
        </>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... (código sin cambios)
    const auth = useContext(AuthContext);
    const location = useLocation();

    useEffect(() => {
        if (auth && !auth.loading && !auth.isAuthenticated && !auth.user) {
            auth.openLoginModal();
        }
    }, [auth?.loading, auth?.isAuthenticated, auth?.user, auth?.openLoginModal]);

    if (!auth) return <div>Cargando...</div>;
    if (auth.loading) return <div>Verificando autenticación...</div>;

    if (!auth.user) {
        return <Navigate to="/" replace />;
    }

    if (!auth.isAuthenticated) {
        if (auth.user.status === UserStatus.PENDIENTE) {
            return <Navigate to="/pending-approval" replace />;
        }
        return <Navigate to="/" replace />;
    }

    if (auth.user.onboardingCompleted === false) {
        if (location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }
    }
    
    if (auth.user.onboardingCompleted === true && location.pathname === '/onboarding') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    const location = useLocation();
    const isDashboardPage = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/onboarding');
    const isRegionSelectorPage = location.pathname === '/';

    useEffect(() => {
        if (location.state?.scrollTo) {
            const targetElement = document.getElementById(location.state.scrollTo);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        // NUEVO: 2. ENVOLVER TODA LA APP CON EL PROVIDER
        <ParallaxProvider>
            <div className="flex flex-col min-h-screen">
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
                            <Route path="news" element={<NewsManager />} />
                            <Route path="services" element={<ServiceManager />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                <Footer />
                <AuthModals />
                <Chatbot />
            </div>
        </ParallaxProvider>
    );
};

export default App;