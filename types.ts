// /home/alexis/Sites/Landings/conexion-ec-ca/types.ts
import React from 'react';
import { Timestamp } from 'firebase/firestore';

// --- Contenido General ---
export interface EventItem {
  id: string;
  title: string;
  date: Timestamp;
  description: string;
  imageUrl?: string;
  isPremium?: boolean;
  published: boolean;
  createdAt: Timestamp;
  rsvps?: string[];
  province?: string;
  city?: string;
  userId?: string; // <-- AÑADIDO
  category?: ServiceCategory;
  referenceUrl?: string;
}

export interface NewsItem {
  id:string;
  title: string;
  summary: string;
  link: string;
  publishedAt: Timestamp;
  published: boolean;
  province?: string;
  city?: string;
}

export interface NavItem {
  label: string;
  href: string;
  target?: string;
  isPremium?: boolean;
  adminOnly?: boolean;
}

// --- Tipos para Beneficios y Recursos ---
export interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl?: string;
  isPremium?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

export interface Resource {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details?: string;
  isPremium?: boolean;
  knowledgePoints?: { question: string, answer: string }[];
  downloadUrl?: string;
}

export interface Tool {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  modalContent: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  isPremium?: boolean;
  isFeatured?: boolean;
  backgroundImageUrl?: string;
}


// --- Tipos de Usuario y Autenticación ---

export enum UserStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

export enum EducationLevel {
  SECUNDARIA = 'Secundaria',
  TERCER_NIVEL = 'Tercer Nivel',
  CUARTO_NIVEL = 'Cuarto Nivel',
}

export enum FamilyComposition {
  SOLO = 'Solo(a)',
  PAREJA = 'En pareja',
  CON_HIJOS = 'Con Hijos',
  OTRO = 'Otro',
}

export enum RemittanceUsage {
  EC_TO_CA = 'Ecuador a Canadá',
  CA_TO_EC = 'Canadá a Ecuador',
  NO_ENVIO = 'No envío dinero',
}

/**
 * Representa la estructura completa de un usuario en Firestore.
 * Combina datos del registro inicial y del wizard de onboarding.
 */
export interface User {
  id: string;
  name: string | null; // Nombre completo del registro
  email: string | null;
  role?: 'admin' | 'member';
  status?: UserStatus;
  createdAt?: Timestamp;
  onboardingCompleted?: boolean;

  // --- Datos del Registro Inicial ---
  arrivalDateCanada?: Timestamp;
  city?: string;
  immigrationStatus?: string;
  supportNeeded?: string[];
  message?: string;
  newsletterSubscription?: boolean;

  // --- Datos del Onboarding Wizard ---
  lastName?: string; // Apellidos
  phone?: string;
  birthYear?: number;
  educationLevel?: EducationLevel;
  profession?: string;
  familyComposition?: FamilyComposition[];
  spouseName?: string;
  hasChildren?: boolean;
  childrenAges?: string[];
  studiesInCanada?: string;
  educationalInstitution?: string;
  remittanceUsage?: RemittanceUsage[];
  isEmployed?: boolean;
  currentEmployer?: string;
  currentPosition?: string;
  
  servicesOffered?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;

  // --- NUEVO CAMPO PARA SUSCRIPCIONES ---
  subscribedServiceCategories?: ServiceCategory[];

  // --- Campos de Gamificación y Conteo ---
  membershipLevel?: string; // e.g., 'Socio', 'Socio Full', 'Embajador'
  points?: number;
  servicesCount?: number;
  eventsCount?: number;
}

export enum Industry {
  TECNOLOGIA = 'Tecnología y Software',
  SALUD = 'Salud y Medicina',
  EDUCACION = 'Educación y Formación',
  FINANZAS = 'Finanzas y Contabilidad',
  MARKETING = 'Marketing y Publicidad',
  VENTAS = 'Ventas y Comercial',
  RECURSOS_HUMANOS = 'Recursos Humanos',
  CONSTRUCCION = 'Construcción y Oficios',
  HOSPITALIDAD = 'Hostelería y Turismo',
  TRANSPORTE = 'Transporte y Logística',
  ARTE_DISENO = 'Arte y Diseño',
  MEDIOS_COMUNICACION = 'Medios y Comunicación',
  LEGAL = 'Legal y Asesoría',
  CIENCIA_INVESTIGACION = 'Ciencia e Investigación',
  AGRICULTURA = 'Agricultura y Alimentación',
  SERVICIOS_SOCIALES = 'Servicios Sociales',
  ADMINISTRACION = 'Administración y Oficina',
  CONSULTORIA = 'Consultoría',
  MANUFACTURA = 'Manufactura',
  ENERGIA = 'Energía y Medio Ambiente',
  INMOBILIARIA = 'Inmobiliaria',
  OTRO = 'Otro',
}

/**
 * Representa los datos que se envían desde el formulario de registro.
 */
export interface RegistrationData {
  name: string;
  email: string;
  password?: string;
  arrivalDateCanada?: Date;
  city?: string;
  immigrationStatus?: string;
  supportNeeded?: string[];
  message?: string;
  newsletterSubscription?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (registrationData: RegistrationData) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openUserProfileModal: () => void;
  openDirectoryModal: () => void;
  closeAuthModal: () => void;
  authModalState: ModalState;
  refreshUserData: (partialUser?: Partial<User>) => Promise<void>;
}

// --- Tipos para el Directorio de Servicios ---

export enum ServiceType {
  OFERTA = 'Oferta',
  DEMANDA = 'Demanda',
}

export enum ServiceStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

// --- ENUM ACTUALIZADO CON NUEVAS CATEGORÍAS ---
export enum ServiceCategory {
  COMIDA = 'Comida y Alimentos',
  LEGAL = 'Asesoría Legal y Migratoria',
  VIVIENDA = 'Búsqueda de Vivienda',
  EMPLEO = 'Oportunidades de Empleo',
  SALUD_MENTAL = 'Salud Mental',
  BELLEZA = 'Salud y Belleza',
  CUIDADO_INFANTIL = 'Cuidado Infantil',
  EDUCACION = 'Educación y Clases',
  TRADUCCION = 'Traducción e Interpretación',
  TECNOLOGIA = 'Tecnología y Soporte',
  DELIVERY = 'Envíos y Delivery',
  EVENTOS = 'Eventos y Social',
  HOGAR = 'Servicios del Hogar',
  OTRO = 'Otro',
}

export interface CommunityServiceItem {
  id: string;
  serviceName: string;
  type: ServiceType;
  // --- CAMPOS NUEVOS ---
  shortDescription: string; // Descripción corta para la tarjeta
  category: ServiceCategory; // Categoría para filtrar y agrupar
  icon?: string; // Opcional: para un ícono representativo
  whatsapp?: string; // Número de WhatsApp
  instagram?: string; // Usuario de Instagram sin @
  isRecommended?: boolean; // Para que el admin pueda destacar un servicio
  // --- FIN DE CAMPOS NUEVOS ---
  contact: string; // Email del usuario (se mantiene como fallback)
  contactName: string;
  province: string;
  city: string;
  website?: string;
  websiteText?: string;
  userId: string;
  createdAt: Timestamp;
  status: ServiceStatus;
  imageUrl?: string; // URL de la imagen del servicio
  cost?: number; // Costo del servicio (opcional)
}

// --- Tipos para Modales ---

export enum ModalContentType {
  BENEFIT_DETAILS,
  RESOURCE_DETAILS,
  TOOL_CONTENT,
  LOGIN_FORM,
  REGISTER_FORM,
  USER_PROFILE,
  COMMUNITY_DIRECTORY,
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  type?: ModalContentType;
  fullWidth?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// --- Tipos para Anuncios (Banners) ---
export interface AdSlotItem {
  id: string;
  location: string;       // e.g., 'benefits_section', 'event_detail'
  isActive: boolean;
  priority: number;
  startDate?: Timestamp | null;
  endDate?: Timestamp | null;
  createdAt: Timestamp;

  // Datos específicos del anuncio anidados para mayor claridad
  adData: {
    imageUrl: string;
    targetUrl: string;
    sponsorName?: string;
  };

  // Campos para la segmentación geográfica
  province?: string; // e.g., 'Ontario'. Si está vacío, es para todas.
  city?: string;     // e.g., 'Toronto'. Si está vacío, es para toda la provincia.
}


// --- Tipos para el Administrador ---

export interface UserForAdmin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: UserStatus;
  createdAt: Timestamp;
  onboardingCompleted: boolean;
  city?: string;
  province?: string;
}

export interface ServiceForAdmin {
  id: string;
  serviceName: string;
  type: ServiceType;
  category: ServiceCategory;
  contactName: string;
  province: string;
  city: string;
  status: ServiceStatus;
  createdAt: Timestamp;
  userId: string;
}

export interface EventForAdmin {
  id: string;
  title: string;
  date: Timestamp;
  isPremium: boolean;
  published: boolean;
  createdAt: Timestamp;
  rsvps: number;
}

export interface AdForAdmin {
  id: string;
  location: string;
  isActive: boolean;
  priority: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
  imageUrl: string;
  targetUrl: string;
  sponsorName?: string;
  province?: string;
  city?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Define el tipo para una sola acción/botón
export interface ChatAction {
  text: string;
  type: 'action' | 'link'; // 'action' para clics internos, 'link' para externos
  value: string; // Puede ser un data-action o una URL
}

// Modifica ChatMessage para incluir un array opcional de acciones
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[]; // Array opcional de acciones
}