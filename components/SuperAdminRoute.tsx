import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);

    // No se renderiza nada si está cargando para evitar un parpadeo
    if (auth.loading) {
        return null;
    }

    // Si el usuario no es un administrador, redirige a la página principal del admin.
    if (auth.user?.role !== 'admin') {
        // Opcionalmente, podrías mostrar un toast o un mensaje aquí.
        console.warn("Acceso denegado. Se requiere rol de 'admin'.");
        return <Navigate to="/admin" replace />;
    }

    // Si es admin, renderiza el contenido protegido.
    return <>{children}</>;
};

export default SuperAdminRoute;