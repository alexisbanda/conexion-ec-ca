import React, { useState, useEffect, useContext } from 'react';
import { NAV_ITEMS, ECUADOR_COLORS } from '../constants';
import { NavItem } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from './icons'; // New icons

export const Header: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useContext(AuthContext);

  if (!auth) {
    // This should ideally not happen if AuthProvider is set up correctly
    console.error("AuthContext is not available");
    return <header>Error loading header: AuthContext missing.</header>;
  }

  const { isAuthenticated, user, openLoginModal, openRegisterModal, logout, openUserProfileModal } = auth;


  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1); // Remove #
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
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
  
  const handleOpenUserProfileModal = () => {
    openUserProfileModal();
    setMobileMenuOpen(false);
  }


  return (
    <header 
      className={`w-full py-4 px-6 md:px-10 transition-all duration-300 z-40 ${
        isSticky ? 'fixed top-0 bg-ecuador-blue shadow-lg' : 'absolute top-0 bg-transparent'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')} className={`text-2xl font-bold font-montserrat ${isSticky ? 'text-ecuador-yellow' : 'text-white'}`}>
          Conexión<span className={isSticky ? 'text-white' : 'text-ecuador-yellow'}>Migrante</span>
        </a>
        <div className="flex items-center">
          <nav className="hidden md:flex space-x-6 items-center">
            {NAV_ITEMS.map((item: NavItem) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`font-medium hover:text-ecuador-yellow transition-colors ${isSticky ? 'text-white' : 'text-white text-shadow-sm'}`}
                aria-label={`Ir a ${item.label}`}
              >
                {item.label}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleOpenUserProfileModal}
                  className={`flex items-center font-medium hover:text-ecuador-yellow transition-colors ${isSticky ? 'text-white' : 'text-white text-shadow-sm'}`}
                  aria-label="Ver mi perfil"
                >
                  <UserCircleIcon className="w-6 h-6 mr-1" />
                  Mi Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center font-medium hover:text-ecuador-yellow transition-colors ${isSticky ? 'text-white' : 'text-white text-shadow-sm'}`}
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
                  className={`font-medium hover:text-ecuador-yellow transition-colors ${isSticky ? 'text-white' : 'text-white text-shadow-sm'}`}
                  aria-label="Iniciar sesión"
                >
                  Login
                </button>
                <button
                  onClick={handleOpenRegisterModal}
                  className={`bg-ecuador-red hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-transform transform hover:scale-105 ${isSticky ? '' : 'shadow-md'}`}
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
              className={`focus:outline-none ${isSticky ? 'text-white' : 'text-white'}`}
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
            {NAV_ITEMS.map((item: NavItem) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="text-white font-medium hover:text-ecuador-yellow transition-colors"
                aria-label={`Ir a ${item.label}`}
              >
                {item.label}
              </a>
            ))}
            <hr className="w-3/4 border-gray-500 my-2"/>
            {isAuthenticated ? (
               <>
                <button
                  onClick={handleOpenUserProfileModal}
                  className="text-white font-medium hover:text-ecuador-yellow transition-colors flex items-center"
                  aria-label="Ver mi perfil"
                >
                   <UserCircleIcon className="w-5 h-5 mr-2" />Mi Perfil
                </button>
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