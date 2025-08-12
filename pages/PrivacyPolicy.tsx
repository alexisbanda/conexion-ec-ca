import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white text-gray-800">
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-4">Política de Privacidad de Portal de Ecuatorianos en Canadá</h1>
        <p className="mb-4 text-sm text-gray-600">
          En Conexión Ecuatorianos EC-CA, la privacidad y la confianza de nuestra comunidad son de suma importancia. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos la información personal de nuestros usuarios, de acuerdo con la Ley de Protección de Información Personal y Documentos Electrónicos (PIPEDA) de Canadá y otras regulaciones aplicables. Al utilizar nuestro portal, aceptas las prácticas descritas en esta política.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">1. Información que Recopilamos</h3>
        <p className="mb-4">
          Recopilamos información personal para proporcionar y mejorar nuestros servicios, y para personalizar tu experiencia. La información que podemos recopilar incluye:
        </p>
        <ul className="list-disc mb-4 ml-8 text-sm text-gray-600">
          <li>
           <b>Datos de Registro:</b> Al crear una cuenta, solicitamos tu nombre, dirección de correo electrónico y contraseña.
          </li>
          <li>
           <b>Datos del Perfil (Onboarding):</b> A través del proceso de incorporación, recopilamos información detallada como tu año de nacimiento, fecha de llegada a Canadá, estatus migratorio, ciudad de residencia, industria, estudios, composición familiar, y un mensaje personal.
          </li>
          <li>
           <b>Contenido Generado por el Usuario:</b> Información que publicas en el portal, como descripciones de servicios, eventos, noticias, comentarios en foros y fotos.
          </li>
          <li>
           <b>Datos de Uso:</b> Información técnica sobre cómo interactúas con el portal, como tu dirección IP, tipo de navegador, páginas visitadas y el tiempo que pasas en el sitio, recopilada a través de herramientas como Google Analytics.
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">2. Uso de tu Información</h3>
        <p className="mb-4">
          Utilizamos la información recopilada exclusivamente para los siguientes fines:
        </p>
        <ul className="list-disc mb-4 ml-8 text-sm text-gray-600">
          <li>
           <b>Para Personalizar tu Experiencia:</b> Usamos tus datos de perfil para recomendar proactivamente servicios, eventos, recursos y anuncios relevantes para tu ciudad, profesión y necesidades.
          </li>
          <li>
           <b>Para Facilitar Conexiones Comunitarias:</b> Tu información de perfil nos ayuda a conectarte con otros miembros que comparten intereses o situaciones similares, fomentando la construcción de redes de apoyo.
          </li>
          <li>
           <b>Para Mejorar y Administrar el Portal:</b> Analizamos los datos de uso de manera anónima y agregada para entender las necesidades de nuestra comunidad y optimizar la funcionalidad del portal.
          </li>
          <li>
           <b>Para Comunicación:</b> Enviamos correos electrónicos transaccionales y notificaciones relevantes a los usuarios que han dado su consentimiento.
          </li>
          <li>
           <b>Para Generar Impacto Social:</b> Los datos demográficos agregados y anonimizados nos permiten crear informes para la asociación, buscar patrocinios para recursos específicos y abogar por políticas que beneficien a nuestra comunidad.
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">3. Protección y Seguridad de tu Información</h3>
        <p className="mb-4">
          Nos comprometemos a proteger tu información personal mediante las siguientes medidas:
        </p>
        <ul className="list-disc mb-4 ml-8 text-sm text-gray-600">
          <li>
           <b>Cifrado de Datos:</b> Todos tus datos están cifrados tanto en reposo como en tránsito.
          </li>
          <li>
           <b>Control de Acceso (RBAC):</b> El acceso a tus datos está estrictamente controlado por un sistema de roles. Solo tú puedes ver y editar tu perfil completo.
          </li>
          <li>
           <b>No Venta de Datos:</b> Nos adherimos a una estricta política de no vender, alquilar o compartir tu información personal individual con terceros.
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">4. Derechos del Usuario y Cómo Contactarnos</h3>
        <p className="mb-4 text-sm text-gray-600">
          Tienes el derecho de acceder a tu información personal, corregirla si es inexacta y solicitar su eliminación. Si deseas ejercer alguno de estos derechos o tienes preguntas sobre esta política, puedes contactarnos a través de nuestro formulario de contacto o enviando un correo electrónico a [info@tu-dominio.com].
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Aclaración sobre la Publicidad</h3>
        <p className="mb-4 text-sm text-gray-600">
          El portal puede mostrar anuncios contextuales de patrocinadores. Estos anuncios se seleccionan en función de la página que estás visitando y no se basan en el seguimiento de tu actividad individual. No vendemos tus datos a anunciantes.
        </p>
        
        <p className="text-sm text-gray-500 mt-8">
          Al utilizar el Portal "Ecuatorianos en Canadá", reconoces y aceptas los términos de esta Política de Privacidad.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;