
import { NavItem } from './types';

export const ECUADOR_COLORS = {
  yellow: '#FFDD00',
  blue: '#0059A3',
  red: '#ED2939',
  yellowLight: '#FFFBEA',
  blueLight: '#E6F0FF',
  darkText: '#1A202C',
  lightText: '#FFFFFF',
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Quiénes Somos', href: '#about-us' },
  { label: 'Beneficios', href: '#benefits' },
  { label: 'Eventos', href: '#events-news' },
  { label: 'Recursos', href: '#resources-tools' },
  { label: 'Contacto', href: '#contact' },
];

export const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID_HERE"; // Replace with your Formspree endpoint
