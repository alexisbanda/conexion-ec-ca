import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  region?: string;
  schema?: Record<string, any> | Record<string, any>[];
  noIndex?: boolean;
}

const SITE_NAME = 'Conexión Ecuador-Canadá';
const SITE_URL = 'https://conexion-ecuador-canada.com';
const DEFAULT_IMAGE = '/ecuanada.png';

const setTag = (selector: string, create: () => HTMLElement) => {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const removePreviousDynamic = () => {
  document.querySelectorAll('[data-dyn-seo="true"]').forEach(n => n.remove());
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = '',
  image = DEFAULT_IMAGE,
  url = '/',
  type = 'website',
  region,
  schema,
  noIndex = false,
}) => {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    removePreviousDynamic();

    const metaDescription = setTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    metaDescription.setAttribute('content', description);

    if (keywords) {
      const metaKeywords = setTag('meta[name="keywords"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'keywords');
        return m;
      });
      metaKeywords.setAttribute('content', keywords);
    }

    const canonicalUrl = `${SITE_URL}${url}`.replace(/(?<!:)\/+/g, '/');
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    const ogPairs: Record<string,string> = {
      'og:site_name': SITE_NAME,
      'og:type': type,
      'og:title': fullTitle,
      'og:description': description,
      'og:image': image.startsWith('http') ? image : `${SITE_URL}${image}`,
      'og:url': canonicalUrl
    };
    Object.entries(ogPairs).forEach(([property, content]) => {
      let tag = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    const twitterPairs: Record<string,string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:image': image.startsWith('http') ? image : `${SITE_URL}${image}`
    };
    Object.entries(twitterPairs).forEach(([name, content]) => {
      let tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    const robots = setTag('meta[name="robots"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'robots');
      return m;
    });
    robots.setAttribute('content', noIndex ? 'noindex,nofollow' : 'index,follow');

    if (region) {
      const geoPlacename = document.createElement('meta');
      geoPlacename.setAttribute('name', 'geo.placename');
      geoPlacename.setAttribute('content', region);
      geoPlacename.dataset.dynSeo = 'true';
      document.head.appendChild(geoPlacename);

      const geoRegion = document.createElement('meta');
      geoRegion.setAttribute('name', 'geo.region');
      geoRegion.setAttribute('content', 'CA');
      geoRegion.dataset.dynSeo = 'true';
      document.head.appendChild(geoRegion);
    }

    const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];
    schemas.forEach(obj => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(obj);
      script.dataset.dynSeo = 'true';
      document.head.appendChild(script);
    });
  }, [title, description, keywords, image, url, type, region, JSON.stringify(schema), noIndex]);

  return null; // No renderiza nada en el DOM
};

export default SEO;
