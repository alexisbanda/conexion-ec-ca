import { useEffect } from 'react';

// Single injection of Organization structured data.
// Mounted near the root (e.g., inside App) to avoid duplication across pages.
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Conexión Ecuador-Canadá',
  url: 'https://ecuadorencanada.com',
  logo: 'https://ecuadorencanada.com/ecuanada.png',
  sameAs: [
    'https://www.facebook.com',
    'https://www.instagram.com'
  ],
  description: 'Plataforma de comunidad y recursos para ecuatorianos en Canadá.'
};

const OrganizationSchema = () => {
  useEffect(() => {
    const id = 'org-structured-data';
    if (document.getElementById(id)) return; // Prevent double inject on HMR
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(ORG_SCHEMA);
    document.head.appendChild(script);
  }, []);
  return null;
};

export default OrganizationSchema;