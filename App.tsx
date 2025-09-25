// /home/alexis/Sites/Landings/conexion-ec-ca/App.tsx
import React, { useContext, useEffect, Suspense, lazy } from 'react';
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
const EventDetailPage = lazy(() => import('./components/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
import { Chatbot } from './components/Chatbot';
import AdminLayout from './components/admin/layout/AdminLayout';
import NationalRegionSelector from './components/NationalRegionSelector';
import Home from './pages/Home';
const ReportsDashboard = lazy(() => import('./components/admin/ReportsDashboard'));
const AdManager = lazy(() => import('./components/admin/AdManager').then(m => ({ default: m.AdManager })));
const UserManager = lazy(() => import('./components/admin/UserManager'));
const ServiceManager = lazy(() => import('./components/admin/ServiceManager').then(m => ({ default: m.ServiceManager })));
const EventManager = lazy(() => import('./components/admin/EventManager').then(m => ({ default: m.EventManager })));
const NewsManager = lazy(() => import('./components/admin/NewsManager').then(m => ({ default: m.NewsManager })));
const SuperAdminRoute = lazy(() => import('./components/SuperAdminRoute'));
const SettingsPage = lazy(() => import('./components/admin/SettingsPage'));
const GuideManagerPage = lazy(() => import('./components/admin/GuideManagerPage').then(m => ({ default: m.default })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import SEO from './components/SEO';
import { getRegion } from './regions';
import OrganizationSchema from './components/OrganizationSchema';

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
    useEffect(() => { if (region) sessionStorage.setItem('lastVisitedRegion', `/${region}`); }, [region]);
    const regionData = getRegion(region);
    if (region && !regionData) {
        return (
            <>
                <SEO title="Región no encontrada" description="La región especificada no existe." url={`/${region}`} noIndex />
                <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
                    <h1 className="text-4xl font-bold mb-4 text-ecuador-blue">Región inválida</h1>
                    <p className="text-gray-600 mb-6">La región "{region}" no está disponible en la plataforma.</p>
                    <a className="text-white bg-ecuador-blue px-5 py-3 rounded-md" href="/">Volver</a>
                </div>
            </>
        );
    }
    return (
        <>
            {regionData && (
                <SEO
                    title={regionData.title}
                    description={regionData.description}
                    keywords={regionData.keywords}
                    url={`/${regionData.slug}`}
                    region={regionData.slug}
                />
            )}
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
    const auth = useContext(AuthContext);
    const location = useLocation();
    useEffect(() => {
        if (auth && !auth.loading && !auth.isAuthenticated && !auth.user) {
            auth.openLoginModal();
        }
    }, [auth?.loading, auth?.isAuthenticated, auth?.user, auth?.openLoginModal]);
    if (!auth) return <div>Cargando...</div>;
    if (auth.loading) return <div>Verificando autenticación...</div>;
    if (!auth.user) return <Navigate to="/" replace />;
    if (!auth.isAuthenticated) {
        if (auth.user.status === UserStatus.PENDIENTE) return <Navigate to="/pending-approval" replace />;
        return <Navigate to="/" replace />;
    }
    if (auth.user.onboardingCompleted === false && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }
    if (auth.user.onboardingCompleted === true && location.pathname === '/onboarding') {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
    const location = useLocation();
    const isDashboardPage = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/onboarding') || location.pathname === '/privacy-policy' || location.pathname === '/terms-of-service';
    const isRegionSelectorPage = location.pathname === '/';
    useEffect(() => {
        if ((location.state as any)?.scrollTo) {
            const targetElement = document.getElementById((location.state as any).scrollTo);
            if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);
    return (
        <ParallaxProvider>
            <div className="flex flex-col min-h-screen">
                {/* Global Organization JSON-LD once */}
                <OrganizationSchema />
                {!isRegionSelectorPage && <Header isDashboardPage={isDashboardPage} />}
                <main className={`flex-grow flex flex-col ${isDashboardPage ? 'pt-16' : ''}`}>
                    <Suspense fallback={<div className="p-10 text-center text-gray-500">Cargando módulo...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path= "/:region" element={<LandingPage />} />
                            <Route path="/pending-approval" element={<PendingApprovalPage />} />
                            <Route path="/events/:eventId" element={<EventDetailPage />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
                            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                                <Route index element={<ReportsDashboard />} />
                                <Route path="ads" element={<AdManager />} />
                                <Route path="users" element={<UserManager />} />
                                <Route path="guides" element={<GuideManagerPage />} />
                                <Route path="events" element={<EventManager />} />
                                <Route path="news" element={<NewsManager />} />
                                <Route path="services" element={<ServiceManager />} />
                                <Route path="settings" element={<SuperAdminRoute><SettingsPage /></SuperAdminRoute>} />
                            </Route>
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
                <AuthModals />
                <Chatbot />
            </div>
        </ParallaxProvider>
    );
};

export default App;