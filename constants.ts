// /home/alexis/Sites/Landings/conexion-ec-ca/constants.ts
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
  { label: 'Directorio', href: '#services-directory', isPremium: true },
  { label: 'Mi Espacio', href: '/dashboard', isPremium: true },
  { label: 'Admin', href: '/admin', adminOnly: true },
];

// Asegúrate de reemplazar esto con tu endpoint real de Formspree
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID_HERE";

export const cityData = [
    {
        "provincia": "Alberta",
        "ciudades": [
            "Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert",
            "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Leduc"
        ]
    },
    {
        "provincia": "British Columbia",
        "ciudades": [
            "Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond",
            "Kelowna", "Abbotsford", "Coquitlam", "Langley", "Nanaimo"
        ]
    },
    {
        "provincia": "Manitoba",
        "ciudades": [
            "Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie",
            "Selkirk", "Winkler", "Dauphin", "The Pas", "Morden"
        ]
    },
    {
        "provincia": "New Brunswick",
        "ciudades": [
            "Moncton", "Saint John", "Fredericton", "Dieppe", "Bathurst",
            "Miramichi", "Edmundston", "Oromocto", "Campbellton", "Sackville"
        ]
    },
    {
        "provincia": "Newfoundland and Labrador",
        "ciudades": [
            "St. John's", "Mount Pearl", "Corner Brook", "Gander", "Grand Falls-Windsor",
            "Happy Valley-Goose Bay", "Labrador City", "Stephenville", "Marystown", "Conception Bay South"
        ]
    },
    {
        "provincia": "Nova Scotia",
        "ciudades": [
            "Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow",
            "Kentville", "Bridgewater", "Amherst", "Yarmouth", "Antigonish"
        ]
    },
    {
        "provincia": "Ontario",
        "ciudades": [
            "Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton",
            "London", "Markham", "Vaughan", "Kitchener", "Windsor"
        ]
    },
    {
        "provincia": "Prince Edward Island",
        "ciudades": [
            "Charlottetown", "Summerside", "Stratford", "Cornwall", "Montague",
            "Souris", "Kensington", "Alberton", "Tignish", "Georgetown"
        ]
    },
    {
        "provincia": "Quebec",
        "ciudades": [
            "Montréal", "Quebec City", "Laval", "Gatineau", "Longueuil",
            "Sherbrooke", "Saguenay", "Trois-Rivières", "Terrebonne", "Saint-Jean-sur-Richelieu"
        ]
    },
    {
        "provincia": "Saskatchewan",
        "ciudades": [
            "Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Yorkton",
            "Swift Current", "North Battleford", "Estevan", "Weyburn", "Martensville"
        ]
    },
    {
        "provincia": "Northwest Territories",
        "ciudades": [
            "Yellowknife", "Hay River", "Inuvik", "Fort Smith", "Behchoko",
            "Norman Wells", "Fort Simpson", "Tuktoyaktuk", "Fort Resolution", "Aklavik"
        ]
    },
    {
        "provincia": "Nunavut",
        "ciudades": [
            "Iqaluit", "Rankin Inlet", "Arviat", "Baker Lake", "Cambridge Bay",
            "Pond Inlet", "Igloolik", "Kugluktuk", "Coral Harbour", "Cape Dorset"
        ]
    },
    {
        "provincia": "Yukon",
        "ciudades": [
            "Whitehorse", "Dawson City", "Watson Lake", "Haines Junction", "Carmacks",
            "Faro", "Teslin", "Mayo", "Carcross", "Ross River"
        ]
    }
];
