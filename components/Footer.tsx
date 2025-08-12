import React from 'react';
import { ECUADOR_COLORS, NAV_ITEMS } from '../constants'; // Asumo que NAV_ITEMS tiene suficientes elementos

// Simplified Social Icons (Se mantienen como están)
const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M12 2.04c-5.5 0-10 4.49-10 10s4.5 10 10 10 10-4.49 10-10S17.5 2.04 12 2.04zm1 14.5h-2v-6h-2v-2.5h2V9.55c0-1.6 1-2.55 3-2.55h1.5v2.5h-1c-.49 0-.6.28-.6.77v1.23h2l-.5 2.5h-1.5v6z"></path></svg>
);
const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M12 2c-2.72 0-3.05.01-4.12.06a6.37 6.37 0 00-4.47 1.63 6.37 6.37 0 00-1.63 4.47c-.05 1.07-.06 1.4-.06 4.12s.01 3.05.06 4.12a6.37 6.37 0 001.63 4.47 6.37 6.37 0 004.47 1.63c1.07.05 1.4.06 4.12.06s3.05-.01 4.12-.06a6.37 6.37 0 004.47-1.63 6.37 6.37 0 001.63-4.47c.05-1.07.06-1.4.06-4.12s-.01-3.05-.06-4.12a6.37 6.37 0 00-1.63-4.47A6.37 6.37 0 0016.12 2.06C15.05 2.01 14.72 2 12 2zm0 1.8c2.65 0 2.95.01 4 .06.97.04 1.64.21 2.2.45.63.29 1.12.68 1.51 1.08.4.4.79.88 1.08 1.51.24.56.41 1.23.45 2.2.05 1.05.06 1.35.06 4s-.01 2.95-.06 4a4.57 4.57 0 01-.45 2.2c-.29.63-.68 1.12-1.08 1.51a4.51 4.51 0 01-1.51 1.08c-.56.24-1.23.41-2.2.45-1.05.05-1.35.06-4 .06s-2.95-.01-4-.06a4.57 4.57 0 01-2.2-.45c-.63-.29-1.12-.68-1.51-1.08a4.51 4.51 0 01-1.08-1.51c-.24-.56-.41-1.23-.45-2.2-.05-1.05-.06-1.35-.06-4s.01-2.95.06-4c.04-.97.21-1.64.45-2.2.29-.63.68-1.12 1.08-1.51s.88-.79 1.51-1.08c.56-.24 1.23-.41 2.2-.45C9.05 3.81 9.35 3.8 12 3.8zm0 3.03A5.17 5.17 0 1012 17.17 5.17 5.17 0 0012 6.83zm0 8.54A3.37 3.37 0 1112 10.2a3.37 3.37 0 010 5.17zM16.95 6.16a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"></path></svg>
);
const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M22.46 6c-.77.35-1.6.58-2.46.67.9-.53 1.59-1.37 1.92-2.38-.84.5-1.77.86-2.76 1.06C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.94.07 4.28 4.28 0 004 2.96 8.54 8.54 0 01-5.33 1.84c-.34 0-.68-.02-1.01-.06A12.04 12.04 0 0012.02 20c7.09 0 11-5.87 11-11.02 0-.17 0-.33-.01-.5.76-.55 1.42-1.23 1.95-1.98z"></path></svg>
);


export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-gray-300 py-6 px-6"> {/* py-8 a py-6 */}
      <div className="container mx-auto">
        {/* Ajustamos la cuadrícula principal a 3 columnas para pantallas grandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* gap-8 a gap-6 */}
          {/* Logo and Description */}
          <div>
            <h3 className="text-xl font-bold text-ecuador-yellow mb-2 font-montserrat">Conexión Ecuatoriana en Canada</h3> {/* mb-3 a mb-2 */}
            <p className="text-sm mb-3 text-justify"> {/* mb-4 a mb-3 */}
              Fortaleciendo la comunidad ecuatoriana en Canadá. Apoyo, cultura y oportunidades.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook de Conexión Migrante" className="text-gray-400 hover:text-ecuador-yellow transition-colors"><FacebookIcon className="w-6 h-6" /></a>
              <a href="#" aria-label="Instagram de Conexión Migrante" className="text-gray-400 hover:text-ecuador-yellow transition-colors"><InstagramIcon className="w-6 h-6" /></a>
              <a href="#" aria-label="Twitter de Conexión Migrante" className="text-gray-400 hover:text-ecuador-yellow transition-colors"><TwitterIcon className="w-6 h-6" /></a>
            </div>
          </div>

          {/* Quick Links (Ahora en dos columnas) */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Enlaces Rápidos</h4> {/* mb-3 a mb-2 */}
            {/* Se añade 'grid grid-cols-2' para dividir la lista en dos columnas */}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm"> {/* space-y-1 a gap-y-1 para grid */}
              {/* Iteramos sobre todos los NAV_ITEMS */}
              {NAV_ITEMS.map(item => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-ecuador-yellow transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Contacto y Apoyo</h4> {/* mb-3 a mb-2 */}
            <ul className="space-y-1 text-sm mb-3"> {/* space-y-2 a space-y-1, mb-4 a mb-3 */}
              <li>Email: <a href="mailto:info@conexionmigrante.ca" className="hover:text-ecuador-yellow transition-colors">admin@ecuatorianos.ca</a></li>
              <li>Teléfono: <span className="hover:text-ecuador-yellow transition-colors">+1 (604) 841-1221</span></li>
            </ul>
            <p className="text-sm mb-2">Suscríbete para novedades:</p>
            <div className="flex">
              <input type="email" placeholder="Tu correo" className="w-full p-2 rounded-l-md bg-gray-700 text-sm border border-gray-600 focus:ring-ecuador-yellow focus:border-ecuador-yellow" aria-label="Correo para suscribirse"/>
              <button className="bg-ecuador-red hover:bg-red-700 text-white text-sm py-2 px-4 rounded-r-md transition-colors">OK</button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm"> {/* pt-8 a pt-6 */}
          <p>&copy; {currentYear} Conexión Migrante EC-CA. Todos los derechos reservados.</p>
          <div className="mt-2 space-x-4">
            <a href="/privacy-policy" className="hover:text-ecuador-yellow transition-colors">Política de Privacidad</a>
            <span>|</span>
            <a href="/terms-of-service" className="hover:text-ecuador-yellow transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};