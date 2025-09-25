import React from 'react';
import SEO from '../components/SEO';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Página no encontrada"
        description="La página que buscas no existe o ha sido movida."
        url="/404"
        noIndex
      />
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-6xl font-extrabold text-ecuador-blue mb-6">404</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          Lo sentimos, no pudimos encontrar la página que buscas.
        </p>
        <a
          href="/"
          className="bg-ecuador-blue text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
        >
          Volver al inicio
        </a>
      </div>
    </>
  );
};

export default NotFoundPage;
