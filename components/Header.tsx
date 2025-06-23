import React, { useState, useEffect, useContext } from 'react';
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
  const location = useLocation(); // Hook para obtener la ubicación actual
  const navigate = useNavigate(); // Hook para navegar programáticamente

  if (!auth) {
    console.error("AuthContext is not available");
    return <header>Error loading header: AuthContext missing.</header>;
  }

  const { isAuthenticated, logout, openLoginModal, openRegisterModal } = auth;

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    if (!isDashboardPage) {
      window.addEventListener('scroll', handleScroll);
    } else {
      // Si estamos en el dashboard, el header siempre es "sticky"
      setIsSticky(true);
    }
    return () => {
      if (!isDashboardPage) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isDashboardPage]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    // Si no es un enlace de ancla (no empieza con #), deja que el componente Link haga su trabajo
    if (!href.startsWith('#')) {
      setMobileMenuOpen(false);
      return;
    }

    e.preventDefault(); // Previene el comportamiento por defecto del ancla

    const targetId = href.substring(1);

    // Si ya estamos en la página de inicio, solo haz scroll
    if (location.pathname === '/') {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si estamos en otra página (ej. /dashboard), navega a la home y luego haz scroll
      navigate('/');
      setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Un pequeño delay para asegurar que la página haya cambiado
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
            <nav className="hidden md:flex space-x-6 items-center">
              {NAV_ITEMS.map((item: NavItem) => {
                if (item.isPremium && !isAuthenticated) {
                  return null;
                }
                const isDashboardLink = isAuthenticated && item.href === '/dashboard';
                const linkClasses = `
                    font-medium transition-colors
                    ${isDashboardLink
                    ? 'bg-ecuador-red text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700'
                    : (headerIsSolid ? 'text-white' : 'text-white text-shadow-sm')
                }
                    ${!isDashboardLink ? 'hover:text-ecuador-yellow' : ''}
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
        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-ecuador-blue shadow-lg py-3">
              <nav className="flex flex-col items-center space-y-3">
                {NAV_ITEMS.map((item: NavItem) => {
                  if (item.isPremium && !isAuthenticated) {
                    return null;
                  }
                  const isDashboardLink = isAuthenticated && item.href === '/dashboard';
                  const linkClasses = `
                      font-medium transition-colors
                      ${isDashboardLink
                      ? 'bg-ecuador-red text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700'
                      : 'text-white'
                  }
                      ${!isDashboardLink ? 'hover:text-ecuador-yellow' : ''}
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