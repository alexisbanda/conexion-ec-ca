// /home/alexis/Sites/Landings/conexion-ec-ca/components/AdminRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);

    if (!auth) return <div>Cargando...</div>;
    if (auth.loading) return <div>Verificando autenticación...</div>;

    // Redirige si no está autenticado O si no es admin
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
        // Podríamos mostrar un mensaje de "Acceso denegado" o simplemente redirigir a la home.
        console.warn("Acceso de administrador denegado.");
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;