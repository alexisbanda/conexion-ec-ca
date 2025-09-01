import React, { useState, useEffect, useContext, useMemo } from 'react';
import { NAV_ITEMS } from '../constants';
import { NavItem } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import { regions } from './NationalRegionSelector';
import { ArrowLeftOnRectangleIcon, LeafIcon } from './icons';
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

  const regionShortName = useMemo(() => {
    const currentPath = location.pathname;
    const currentRegion = regions.find(region => region.path === currentPath);
    return currentRegion ? currentRegion.shortName : 'BC'; 
  }, [location.pathname]);

  // --- LÓGICA DE FILTRADO DE ENLACES ---
  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter(item => {
      // Ocultar si es solo para admin y el usuario no es admin o regional_admin
      if (item.adminOnly && !['admin', 'regional_admin'].includes(user?.role || '')) {
        return false;
      }
      // Ocultar si es premium y el usuario no está autenticado
      if (item.isPremium && !isAuthenticated) {
        return false;
      }
      // En todos los demás casos, mostrar el item
      return true;
    });
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== isSticky) {
        setIsSticky(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSticky]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const homePath = sessionStorage.getItem('lastVisitedRegion') || '/'; // Usa la región guardada

      // Si ya estamos en la página de inicio correcta, solo nos desplazamos.
      if (location.pathname === homePath) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Si estamos en otra página, navegamos a la de inicio y pasamos el anclaje.
        navigate(homePath, { state: { scrollTo: targetId } });
      }
      setMobileMenuOpen(false);
    } else {
      // Para enlaces que no son de anclaje (como /dashboard, /admin)
      setMobileMenuOpen(false);
    }
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
      <div className="container mx-auto flex justify-between items-center"> {/* Estas clases son clave para la alineación */}
        {/* Nombre del sitio alineado a la izquierda */}
        <Link to="/" onClick={(e) => handleNavClick(e, '#hero')} className={`text-2xl font-bold font-montserrat ${headerIsSolid ? 'text-ecuador-yellow' : 'text-white'}`}>
          Ecuatorianos<span className={headerIsSolid ? 'text-white' : 'text-ecuador-yellow'}>{regionShortName}</span>
        </Link>

        {/* Contenedor del menú y botón móvil alineado a la derecha */}
        <div className="flex items-center">
          {/* Menú de escritorio */}
          <nav className="hidden md:flex space-x-6 items-center">
            {visibleNavItems.map((item: NavItem) => {
              const isDashboardLink = isAuthenticated && item.href === '/dashboard';
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
                  className={`${linkClasses}
                    ${item.href === '#services-directory'
                      ? `bg-ecuador-red text-white rounded-md px-3 py-1.5 shadow-sm hover:shadow-md pulsating-button`
                      : ''
                    }
                  `}
                  style={{
                    ...(item.href === '#services-directory' && {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }),
                  }}
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
          {/* Enlace al selector de regiones (Desktop) */}
            <Link
              to="/"
              className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-ecuador-blue text-white shadow-md transition-transform hover:scale-110 hover:brightness-110"
              aria-label="Seleccionar región"
              title="Seleccionar otra región"
            >
              🍁
            </Link>
          {/* Botón de menú móvil */}
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

      {/* Menú Móvil */}
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
            {/* Enlace al selector de regiones (Móvil) */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium transition-colors text-white hover:text-ecuador-yellow"
              aria-label="Seleccionar región"
            >
              Cambiar Región
            </Link>
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