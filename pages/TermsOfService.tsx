import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white text-gray-800">
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-4">Términos de Servicio del Portal de Ecuatorianos en Canadá</h1>
        <p className="mb-4 text-sm text-gray-600">
        </p>
        <p className="mb-4 text-sm text-gray-600">
          Bienvenido al Portal!. Estos Términos de Servicio ("Términos") rigen tu acceso y uso de nuestro portal web. Al acceder, registrarte o utilizar nuestros servicios, aceptas estar sujeto a estos Términos, que constituyen un acuerdo legal vinculante entre tú y el Portal. Si no estás de acuerdo con estos Términos, no debes utilizar nuestro portal.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">1. Aceptación de los Términos</h3>
        <p className="mb-4 text-sm text-gray-600">
          Al crear una cuenta de miembro, confirmas que tienes la capacidad legal para aceptar este acuerdo y que has leído, entendido y aceptado estos Términos de Servicio en su totalidad.
        </p>
        
        <h3 className="text-xl font-bold mt-8 mb-3">2. Reglas de la Comunidad y Conducta del Usuario</h3>
        <p className="mb-4 text-sm text-gray-600">
          Nuestro portal es un espacio diseñado para fomentar el apoyo y la conexión. Nos reservamos el derecho de moderar el contenido. Por ello, al usar la plataforma, aceptas:
        </p>
        <ul className="list-disc mb-4 ml-8 text-sm text-gray-600">
          <li>
            Proporcionar información veraz y completa durante el registro y en tu perfil.
          </li>
          <li>
            Tratar a los demás miembros y administradores con respeto, cortesía y profesionalismo.
          </li>
          <li>
            No publicar contenido que sea ilegal, difamatorio, acosador, abusivo, obsceno, odioso o que infrinja los derechos de otros.
          </li>
          <li>
            Aceptar que el contenido generado por el usuario (UGC), como los servicios y comentarios, puede ser revisado por administradores para asegurar que no contenga desinformación o contenido dañino.
          </li>
        </ul>
        
        <h3 className="text-xl font-bold mt-8 mb-3">3. Uso del Directorio de Servicios y Contenido del Usuario</h3>
        <p className="mb-4 text-sm text-gray-600">
          El Directorio de Servicios es una herramienta para conectar a la comunidad.
        </p>
        <ul className="list-disc mb-4 ml-8 text-sm text-gray-600">
          <li>
           <b>Publicación:</b> Al publicar un servicio, garantizas que la información es precisa y que tienes el derecho de ofrecer dicho servicio. La publicación está sujeta a la aprobación de un administrador.
          </li>
          <li>
           <b>Responsabilidad:</b> Reconoces que el portal es un facilitador de la conexión. EL Portal no es responsable de las transacciones, acuerdos o disputas que surjan entre los usuarios. Te recomendamos ejercer tu propio juicio y diligencia al interactuar con otros miembros.
          </li>
          <li>
           <b>Licencia de Contenido:</b> Al subir contenido, otorgas al Portal una licencia limitada para usar, reproducir y mostrar dicho contenido en el portal para los fines de la plataforma.
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">4. Cuentas de Usuario y Acceso</h3>
        <p className="mb-4 text-sm text-gray-600">
          Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Nuestro sistema de roles (ej., Miembro, Administrador) controla tu acceso a diferentes áreas del portal.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">5. Limitación de Responsabilidad</h3>
        <p className="mb-4 text-sm text-gray-600">
          Nuestro Portal proporciona el portal "tal cual" y no ofrece garantías de ningún tipo sobre la exactitud, fiabilidad o idoneidad de la información o los servicios listados. En la medida máxima permitida por la ley, la plataforma no será responsable de ningún daño indirecto, incidental o consecuente que surja de tu uso del portal.
        </p>
        
        <h3 className="text-xl font-bold mt-8 mb-3">6. Integración de la Política de Privacidad</h3>
        <p className="mb-4 text-sm text-gray-600">
          Estos Términos incorporan nuestra <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-ecuador-blue hover:underline">Política de Privacidad</a>, la cual explica cómo manejamos tu información personal. Al aceptar estos Términos, también aceptas los términos de nuestra Política de Privacidad.
        </p>

        <p className="text-sm text-gray-500 mt-8">
          Este Portal se reserva el derecho de modificar estos Términos en cualquier momento. El uso continuado del portal después de dichas modificaciones constituye tu aceptación de los nuevos Términos.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;