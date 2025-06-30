// /home/alexis/Sites/Landings/conexion-ec-ca/components/PendingApprovalPage.tsx
import React from 'react';

export const PendingApprovalPage: React.FC = () => (
    <section className="py-16 md:py-24 bg-gray-100 text-center min-h-screen flex flex-col justify-center items-center px-4">
        <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">
                ¡Ya casi estás dentro!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
                Hemos recibido tu registro y nuestro equipo lo está revisando. Este paso nos ayuda a mantener una comunidad segura y de confianza para todos.
            </p>
            <p className="text-md text-gray-600">
                Recibirás una notificación por correo electrónico tan pronto como tu cuenta sea aprobada. ¡Gracias por tu paciencia!
            </p>
        </div>
    </section>
);