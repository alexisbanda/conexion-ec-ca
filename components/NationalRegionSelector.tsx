import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { useNavigate, Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative'; // Ojo: en tu código usas EffectCoverflow pero importas creative CSS

interface Region {
  id: string;
  name: string;
  shortName: string;
  path: string;
  heroImageUrl: string;
  cardImageUrl: string;
  tagline: string;
  description: string;
}

export const regions: Region[] = [
  {
    id: 'bc',
    name: 'British Columbia',
    shortName: 'BC',
    path: '/bc',
    heroImageUrl: 'assets/images/hero/Vancouver_Quito_2.png',
    cardImageUrl: 'https://picsum.photos/seed/bc_card/800/600',
    tagline: 'Montañas majestuosas, océano vibrante y una comunidad que te abraza.',
    description: 'Descubre un nuevo comienzo en la costa del Pacífico, donde la naturaleza y las oportunidades te esperan con el apoyo de tu gente.',
  },
  {
    id: 'on',
    name: 'Ontario',
    shortName: 'ON',
    path: '/on',
    heroImageUrl: 'assets/images/hero/Toronto_Guayaquil_2.png',
    cardImageUrl: 'https://picsum.photos/seed/on_card/800/600',
    tagline: 'El corazón de Canadá, latiendo con oportunidades y una red ecuatoriana próspera.',
    description: 'Desde la metrópolis de Toronto hasta la capital Ottawa, forja tu futuro en una provincia llena de vida, cultura y conexiones comunitarias.',
  },
  {
    id: 'ab',
    name: 'Alberta',
    shortName: 'AB',
    path: '/ab',
    heroImageUrl: 'assets/images/hero/Calgary_Riobamba_2.png',
    cardImageUrl: 'https://picsum.photos/seed/ab_card/800/600',
    tagline: 'Cielos infinitos y oportunidades que transforman sueños en realidad.',
    description: 'Bienvenido a la tierra de las Rocosas, donde el espíritu emprendedor y una cálida comunidad te impulsarán hacia el éxito y la estabilidad.',
  },
  {
    id: 'qc',
    name: 'Quebec',
    shortName: 'QC',
    path: '/qc',
    heroImageUrl: 'assets/images/hero/Montreal_Cuenca_1.png',
    cardImageUrl: 'https://picsum.photos/seed/qc_card/800/600',
    tagline: 'Una cultura rica y un nuevo idioma para abrazar, en una comunidad que te acoge.',
    description: 'Sumérgete en el encanto europeo de Quebec, donde la diversidad cultural y el apoyo comunitario abren puertas a nuevas experiencias y crecimiento.',
  },
  {
    id: 'mb',
    name: 'Manitoba',
    shortName: 'MB',
    path: '/mb',
    heroImageUrl: 'assets/images/hero/Winnipeg_Ambato_2.png',
    cardImageUrl: 'https://picsum.photos/seed/mb_card/800/600',
    tagline: 'El corazón del continente, donde la oportunidad crece a tu ritmo.',
    description: 'Descubre la tranquilidad y un costo de vida accesible, construyendo tu hogar en una comunidad acogedora que valora tu llegada.',
  },
  /*{
    id: 'sk',
    name: 'Saskatchewan',
    shortName: 'SK',
    path: '/sk',
    heroImageUrl: 'https://picsum.photos/seed/sk_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/sk_card/800/600',
    tagline: 'Horizontes vastos, un futuro prometedor y una comunidad que siembra esperanza.',
    description: 'Atrévete a explorar una tierra de oportunidades en el corazón de las praderas canadienses, donde el crecimiento económico y la calidez humana te esperan.',
  },
  {
    id: 'nb',
    name: 'New Brunswick',
    shortName: 'NB',
    path: '/nb',
    heroImageUrl: 'https://picsum.photos/seed/nb_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/nb_card/800/600',
    tagline: 'Belleza costera y la calidez de una comunidad bilingüe que te da la bienvenida.',
    description: 'Encuentra un equilibrio perfecto entre la vida serena, la naturaleza impresionante y una comunidad que te apoyará en cada paso de tu nueva etapa.',
  },
  {
    id: 'ns',
    name: 'Nova Scotia',
    shortName: 'NS',
    path: '/ns',
    heroImageUrl: 'https://picsum.photos/seed/ns_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/ns_card/800/600',
    tagline: 'El espíritu marítimo te guía hacia nuevos horizontes y una comunidad llena de vida.',
    description: 'Ancla tus sueños en esta hermosa provincia costera, donde la hospitalidad y las oportunidades crecen junto al mar.',
  },
  {
    id: 'pe',
    name: 'Prince Edward Island',
    shortName: 'PE',
    path: '/pe',
    heroImageUrl: 'https://picsum.photos/seed/pe_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/pe_card/800/600',
    tagline: 'El encanto de la isla te envuelve en una comunidad unida y un futuro prometedor.',
    description: 'Descubre la belleza pintoresca y la tranquilidad de la Isla del Príncipe Eduardo, donde una comunidad solidaria te espera para crecer juntos.',
  },
  {
    id: 'nl',
    name: 'Newfoundland and Labrador',
    shortName: 'NL',
    path: '/nl',
    heroImageUrl: 'https://picsum.photos/seed/nl_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/nl_card/800/600',
    tagline: 'La belleza indómita y la genuina amabilidad de una comunidad resiliente.',
    description: 'Embárcate en una nueva aventura en esta provincia única, donde la naturaleza impresionante y el espíritu acogedor de su gente te harán sentir en casa.',
  },
  {
    id: 'yt',
    name: 'Yukon',
    shortName: 'YT',
    path: '/yt',
    heroImageUrl: 'https://picsum.photos/seed/yt_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/yt_card/800/600',
    tagline: 'El llamado de la naturaleza, respondido por una comunidad de corazón cálido.',
    description: 'Atrévete a vivir la experiencia del norte, donde la aurora boreal y una comunidad unida te acompañarán en cada paso de tu integración.',
  },
  {
    id: 'nt',
    name: 'Northwest Territories',
    shortName: 'NT',
    path: '/nt',
    heroImageUrl: 'https://picsum.photos/seed/nt_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/nt_card/800/600',
    tagline: 'Luces del norte, horizontes infinitos y la calidez de una comunidad resistente.',
    description: 'Conecta en los vastos y hermosos Territorios del Noroeste, un lugar de oportunidades únicas y apoyo comunitario en el corazón del Ártico.',
  },
  {
    id: 'nu',
    name: 'Nunavut',
    shortName: 'NU',
    path: '/nu',
    heroImageUrl: 'https://picsum.photos/seed/nu_hero/1600/900',
    cardImageUrl: 'https://picsum.photos/seed/nu_card/800/600',
    tagline: 'El espíritu del Ártico te espera en una comunidad de resiliencia y cultura ancestral.',
    description: 'Explora la cultura inuit y los paisajes impresionantes de Nunavut, forjando un futuro en una comunidad fuerte y con apoyo mutuo.',
  },*/
];

const NationalRegionSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleRegionSelect = (region: Region) => {
    localStorage.setItem('lastSelectedRegion', region.id);
    //alert(`Ruta seleccionada: ${region.path}`);
    navigate(region.path); // Descomentar esta línea y comentar la de alert para la navegación real
  };

  return (
    // Contenedor principal con fondo degradado
    <div className="relative w-full h-screen group bg-gradient-to-br from-gray-900 to-gray-700"> 
      
      {/* --- ENCABEZADO SUPERIOR SIMPLIFICADO --- */}
      <div className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-center">
        {/* Nombre del sitio */}
        <Link to="/" className="text-2xl font-bold font-montserrat text-white">
          Ecuatorianos<span className="text-ecuador-yellow">.CA</span> {/* Ajustado a 'CA' para ser más general */}
        </Link>
        {/* Puedes añadir un botón de "Volver" o "Inicio" aquí si es necesario */}
      </div>

      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectCoverflow]}
        effect="coverflow"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ['-120%', 0, -500],
          },
          next: {
            translate: ['120%', 0, -500],
          },
        }}
        
        slidesPerView={1.2}
        centeredSlides={true} 
        spaceBetween={10} 
        
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        className="h-full w-full"
      >
        {regions.map((region) => (
          <SwiperSlide key={region.id}> 
            <div className="relative w-full h-full">
              <img
                src={region.heroImageUrl}
                alt={`View of ${region.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center p-4">
                {/* --- CAMBIOS AQUÍ: Nombre de la Provincia Resaltado --- */}
                <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-shadow-lg leading-tight">
                  Conecta con tu comunidad en <br /> 
                  <span className="text-ecuador-yellow text-6xl md:text-7xl font-extrabold block mt-2">
                    {region.name}
                  </span>
                </h2>
                <p className="mt-4 text-lg md:text-xl max-w-2xl text-shadow">
                  {region.tagline}
                </p>
                <button
                  onClick={() => handleRegionSelect(region)}
                  className="mt-8 bg-[#fcd116] text-[#002d62] font-bold py-3 px-8 rounded-full hover:bg-[#ce1126] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Explora {region.name}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* --- BOTONES DE NAVEGACIÓN PERSONALIZADOS --- */}
      <div className="swiper-button-prev-custom absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer p-3 rounded-full shadow-lg 
                    bg-[#fcd116] text-[#002d62] hover:bg-[#ce1126] hover:text-white 
                    transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <div className="swiper-button-next-custom absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer p-3 rounded-full shadow-lg 
                    bg-[#fcd116] text-[#002d62] hover:bg-[#ce1126] hover:text-white 
                    transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default NationalRegionSelector;