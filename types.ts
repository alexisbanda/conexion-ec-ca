import React from 'react';

export interface NavItem {
  label: string;
  href: string;
  target?: string;
}

export interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl?: string; 
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
}

export interface Resource {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details?: string; // For modal
}

export interface Tool {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  modalContent: React.ReactNode;
}

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

// Authentication Types
export interface User {
  id: string; // Firebase UID
  name: string | null; // Firebase displayName
  email: string | null; // Firebase email
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openUserProfileModal: () => void;
  closeAuthModal: () => void;
  authModalState: ModalState;
}

// Community Directory Types
export enum ServiceType {
  OFERTA = 'Oferta',
  DEMANDA = 'Demanda',
}

export interface CommunityServiceItem {
  id: string;
  serviceName: string;
  type: ServiceType;
  contact: string; 
  city: string;
  website?: string; 
  websiteText?: string;
}