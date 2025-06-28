// /home/alexis/Sites/Landings/conexion-ec-ca/components/Header.tsx
import React, { useState, useEffect, useContext, useMemo } from 'react'; // <-- Importar useMemo
import { NAV_ITEMS } from '../constants';
import { NavItem } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import { ArrowLeftOnRectangleIcon } from './icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  isDashboardPage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isDashboardPage = false }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!auth) {
    console.error("AuthContext is not available");
    return <header>Error loading header: AuthContext missing.</header>;
  }

  const { isAuthenticated, user, logout, openLoginModal, openRegisterModal } = auth;

  // --- INICIO DE LA MODIFICACIÓN: LÓGICA DE FILTRADO DE ENLACES ---
  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter(item => {
      // Ocultar si es solo para admin y el usuario no es admin
      if (item.adminOnly && user?.role !== 'admin') {
        return false;
      }
      // Ocultar si es premium y el usuario no está autenticado
      if (item.isPremium && !isAuthenticated) {
        return false;
      }
      // En todos los demás casos, mostrar el item
      return true;
    });
  }, [isAuthenticated, user?.role]); // Recalcular solo si cambia la autenticación o el rol
  // --- FIN DE LA MODIFICACIÓN ---

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    if (!isDashboardPage) {
      window.addEventListener('scroll', handleScroll);
    } else {
      setIsSticky(true);
    }
    return () => {
      if (!isDashboardPage) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isDashboardPage]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith('#')) {
      setMobileMenuOpen(false);
      return;
    }
    e.preventDefault();
    const targetId = href.substring(1);
    if (location.pathname === '/') {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  }

  const handleOpenLoginModal = () => {
    openLoginModal();
    setMobileMenuOpen(false);
  }

  const handleOpenRegisterModal = () => {
    openRegisterModal();
    setMobileMenuOpen(false);
  }

  const headerIsSolid = isSticky || isDashboardPage;

  return (
      <header
          className={`w-full py-4 px-6 md:px-10 transition-all duration-300 z-40 ${
              headerIsSolid ? 'fixed top-0 bg-ecuador-blue shadow-lg' : 'absolute top-0 bg-transparent'
          }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" onClick={(e) => handleNavClick(e, '#hero')} className={`text-2xl font-bold font-montserrat ${headerIsSolid ? 'text-ecuador-yellow' : 'text-white'}`}>
            Conexión<span className={headerIsSolid ? 'text-white' : 'text-ecuador-yellow'}>Migrante</span>
          </Link>
          <div className="flex items-center">
            {/* Usamos visibleNavItems en lugar de NAV_ITEMS */}
            <nav className="hidden md:flex space-x-6 items-center">
              {visibleNavItems.map((item: NavItem) => {
                const isDashboardLink = isAuthenticated && item.href === '/dashboard';
                // --- MODIFICACIÓN: Estilo para el enlace de admin ---
                const isAdminLink = item.href === '/admin';
                const linkClasses = `
                    font-medium transition-colors
                    ${isDashboardLink
                    ? 'bg-ecuador-red text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700'
                    : (headerIsSolid ? 'text-white' : 'text-white text-shadow-sm')
                }
                    ${!isDashboardLink && !isAdminLink ? 'hover:text-ecuador-yellow' : ''}
                    ${isAdminLink ? 'text-ecuador-yellow font-semibold hover:brightness-110' : ''}
                `;

                return (
                    <Link
                        key={item.label}
                        to={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={linkClasses}
                        aria-label={`Ir a ${item.label}`}
                    >
                      {item.label}
                    </Link>
                );
              })}
              {isAuthenticated ? (
                  <>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center font-medium hover:text-ecuador-yellow transition-colors ${headerIsSolid ? 'text-white' : 'text-white text-shadow-sm'}`}
                        aria-label="Cerrar sesión"
                    >
                      <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-1" />
                      Salir
                    </button>
                  </>
              ) : (
                  <>
                    <button
                        onClick={handleOpenLoginModal}
                        className={`font-medium hover:text-ecuador-yellow transition-colors ${headerIsSolid ? 'text-white' : 'text-white text-shadow-sm'}`}
                        aria-label="Iniciar sesión"
                    >
                      Login
                    </button>
                    <button
                        onClick={handleOpenRegisterModal}
                        className={`bg-ecuador-red hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-transform transform hover:scale-105 ${headerIsSolid ? '' : 'shadow-md'}`}
                        aria-label="Registrarse"
                    >
                      Registro
                    </button>
                  </>
              )}
            </nav>
            <div className="md:hidden ml-4">
              <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`focus:outline-none ${headerIsSolid ? 'text-white' : 'text-white'}`}
                  aria-label="Abrir menú de navegación"
                  aria-expanded={mobileMenuOpen}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu: Usamos visibleNavItems también aquí */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-ecuador-blue shadow-lg py-3">
              <nav className="flex flex-col items-center space-y-3">
                {visibleNavItems.map((item: NavItem) => {
                  const isDashboardLink = isAuthenticated && item.href === '/dashboard';
                  const isAdminLink = item.href === '/admin';
                  const linkClasses = `
                      font-medium transition-colors
                      ${isDashboardLink
                      ? 'bg-ecuador-red text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700'
                      : 'text-white'
                  }
                      ${!isDashboardLink && !isAdminLink ? 'hover:text-ecuador-yellow' : ''}
                      ${isAdminLink ? 'text-ecuador-yellow font-semibold' : ''}
                  `;

                  return (
                      <Link
                          key={item.label}
                          to={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className={linkClasses}
                          aria-label={`Ir a ${item.label}`}
                      >
                        {item.label}
                      </Link>
                  );
                })}
                <hr className="w-3/4 border-gray-500 my-2"/>
                {isAuthenticated ? (
                    <>
                      <button
                          onClick={handleLogout}
                          className="text-white font-medium hover:text-ecuador-yellow transition-colors flex items-center"
                          aria-label="Cerrar sesión"
                      >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />Cerrar Sesión
                      </button>
                    </>
                ) : (
                    <>
                      <button
                          onClick={handleOpenLoginModal}
                          className="text-white font-medium hover:text-ecuador-yellow transition-colors"
                          aria-label="Iniciar sesión"
                      >
                        Iniciar Sesión
                      </button>
                      <button
                          onClick={handleOpenRegisterModal}
                          className="text-white font-medium hover:text-ecuador-yellow transition-colors"
                          aria-label="Registrarse"
                      >
                        Registrarse
                      </button>
                    </>
                )}
              </nav>
            </div>
        )}
      </header>
  );
};