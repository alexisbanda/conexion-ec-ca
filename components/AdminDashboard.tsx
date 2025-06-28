// /home/alexis/Sites/Landings/conexion-ec-ca/components/AdminDashboard.tsx
import React from 'react';

export const AdminDashboard: React.FC = () => {
    return (
        <section className="py-16 md:py-24 bg-gray-100 min-h-screen pt-24">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold text-ecuador-blue mb-8 font-montserrat">
                    Panel de Administración
                </h1>

                {/* Aquí irán las secciones de moderación y gestión de usuarios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Servicios Pendientes de Aprobación</h2>
                        <p>Aquí se mostrará la lista de servicios pendientes.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Usuarios</h2>
                        <p>Aquí se mostrará la lista de usuarios.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};