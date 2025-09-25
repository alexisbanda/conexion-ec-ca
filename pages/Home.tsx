import React, { useContext, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import NationalRegionSelector from '../components/NationalRegionSelector';
import { cityData } from '../constants';
import SEO from '../components/SEO';

// Mapeo de nombres de provincia a las abreviaturas usadas en las URLs
const provinceAbbreviations: { [key: string]: string } = {
    "Alberta": "ab",
    "British Columbia": "bc",
    "Manitoba": "mb",
    "New Brunswick": "nb",
    "Newfoundland and Labrador": "nl",
    "Nova Scotia": "ns",
    "Ontario": "on",
    "Prince Edward Island": "pe",
    "Quebec": "qc",
    "Saskatchewan": "sk",
    "Northwest Territories": "nt",
    "Nunavut": "nu",
    "Yukon": "yt"
};

const Home: React.FC = () => {
  const auth = useContext(AuthContext);

  // Creamos un mapa de ciudad a provincia para una búsqueda eficiente.
  // Se memoriza para no recalcularlo en cada render.
  const cityToProvinceMap = useMemo(() => {
    const map = new Map<string, string>();
    cityData.forEach(province => {
      const provinceAbbr = provinceAbbreviations[province.provincia];
      if (provinceAbbr) {
        province.ciudades.forEach(city => {
          map.set(city.toLowerCase(), provinceAbbr);
        });
      }
    });
    return map;
  }, []);

  if (auth?.loading) {
    return <div>Verificando autenticación...</div>;
  }

  if (auth?.isAuthenticated && auth.user) {
    let region: string | null = null;

    // 1. Intentar con la provincia directamente (ej. "bc")
    if (auth.user.province) {
      const provinceLower = auth.user.province.toLowerCase();
      // Validar si la provincia es una abreviatura conocida
      if (Object.values(provinceAbbreviations).includes(provinceLower)) {
        region = provinceLower;
      }
    }

    // 2. Si no hay región, intentar buscar por ciudad
    if (!region && auth.user.city) {
      region = cityToProvinceMap.get(auth.user.city.toLowerCase()) || null;
    }
    
    // Si encontramos una región, redirigimos
    if (region) {
      return <Navigate to={`/${region}`} replace />;
    }
  }

  // Si no hay usuario, o no se pudo determinar la región, mostrar el selector
  return (
    <>
      <SEO
        title="Conecta con la Comunidad Ecuatoriana en Canadá"
        description="Encuentra eventos, recursos, servicios y apoyo para ecuatorianos en Canadá. Únete a la comunidad y participa."
        keywords="ecuatorianos canada, comunidad ecuatoriana, eventos ecuatorianos canada, migrantes ecuatorianos"
        url="/"
      />
      <NationalRegionSelector />
    </>
  );
};

export default Home;