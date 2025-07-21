import React from 'react';
// Importa la configuración de la librería principal de Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
// Importa los iconos sólidos que vas a usar
import {
    faBriefcase,
    faUserCircle,
    faMapPin,
    faPlusCircle,
    faBell,
    faListUl, // Equivalente a ListBulletIcon
    faChevronLeft,
    faChevronRight,
    faChevronDown,
    faCalendarDays,
    faLock, // Equivalente a LockClosedIcon
    faUsers, // Equivalente a UserGroupIcon
    faEnvelope,
    faLink,
    faUtensils, // Equivalente a FoodIcon
    faBalanceScale, // Equivalente a LegalIcon
    faMicrochip, // Equivalente a TechIcon
    faPalette, // Equivalente a BeautyIcon (usando paleta de colores como metáfora de belleza)
    faTruck, // Equivalente a DeliveryIcon
    faGraduationCap, // Equivalente a AcademicCapIcon
    faCalendarCheck, // Reemplazo para faCalendarStar (para EventIcon)
    faHome,
    faEllipsisH, // Equivalente a OtherIcon (tres puntos horizontales)
    faExclamationCircle,
    faSearch, // Equivalente a MagnifyingGlassIcon
    faSignOutAlt, // Equivalente a ArrowLeftOnRectangleIcon
    faArrowDown,
    faComments, // Equivalente a ChatBubbleLeftRightIcon (múltiples burbujas de chat)
    faTimes, // Equivalente a XMarkIcon (una X simple)
    faDollarSign, // Equivalente a CurrencyDollarIcon
    faNewspaper,
    faScaleBalanced, // Otro posible para LegalIcon, más directo
    faCheckCircle,
    faInfoCircle,
    faTimesCircle, // Otro posible para XCircleIcon
    faCommentDots, // Equivalente a ChatBubbleOvalLeftEllipsisIcon (burbuja de chat con puntos)
    faPaperPlane,
    faImage, // Equivalente a PaperAirplaneIcon
    faBullhorn, // Equivalente a MegaphoneIcon
    faClock,
    faLeaf
} from '@fortawesome/free-solid-svg-icons';
// Importa el componente FontAwesomeIcon para usar los iconos en React
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Añade los iconos a la librería de Font Awesome para que estén disponibles
library.add(
    faBriefcase,
    faUserCircle,
    faMapPin,
    faPlusCircle,
    faBell,
    faListUl,
    faChevronLeft,
    faChevronRight,
    faChevronDown,
    faCalendarDays,
    faLock,
    faUsers,
    faEnvelope,
    faLink,
    faUtensils,
    faBalanceScale,
    faMicrochip,
    faPalette,
    faTruck,
    faGraduationCap,
    faCalendarCheck, // Actualizado aquí
    faHome,
    faEllipsisH,
    faExclamationCircle,
    faSearch,
    faSignOutAlt,
    faArrowDown,
    faComments,
    faTimes,
    faDollarSign,
    faNewspaper,
    faScaleBalanced,
    faCheckCircle,
    faInfoCircle,
    faTimesCircle,
    faCommentDots,
    faPaperPlane, // Equivalente a PaperAirplaneIcon
    faImage, // Equivalente a PaperAirplaneIcon
    faBullhorn,
    faClock,
    faLeaf
);

// Tipo genérico para las props de los iconos, ahora más simple ya que Font Awesome maneja la mayoría
// Puedes pasar props adicionales que Font AwesomeIcon acepte, como 'size', 'color', 'className'
type IconProps = {
    className?: string; // Para aplicar estilos con Tailwind u otros CSS
    size?: "xs" | "lg" | "sm" | "1x" | "2x" | "3x" | "4x" | "5x" | "6x" | "7x" | "8x" | "9x" | "10x";
    color?: string;
    // Agrega cualquier otra prop que necesites pasar a FontAwesomeIcon
};

// Ahora, cada componente de icono simplemente renderiza un FontAwesomeIcon
// Mapeamos tus nombres de componentes a los nombres de iconos de Font Awesome
export const BriefcaseIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faBriefcase} {...props} />
);

export const UserCircleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faUserCircle} {...props} />
);

export const MapPinIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faMapPin} {...props} />
);

export const PlusCircleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faPlusCircle} {...props} />
);

export const BellIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faBell} {...props} />
);

export const ListBulletIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faListUl} {...props} />
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faChevronLeft} {...props} />
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faChevronRight} {...props} />
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faChevronDown} {...props} />
);

export const CalendarDaysIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faCalendarDays} {...props} />
);

export const LockClosedIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faLock} {...props} />
);

export const UserGroupIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faUsers} {...props} />
);

export const EnvelopeIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faEnvelope} {...props} />
);

export const LinkIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faLink} {...props} />
);

export const FoodIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faUtensils} {...props} />
);

export const LegalIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faBalanceScale} {...props} />
);

export const TechIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faMicrochip} {...props} />
);

export const BeautyIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faPalette} {...props} />
);

export const DeliveryIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faTruck} {...props} />
);

export const AcademicCapIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faGraduationCap} {...props} />
);

export const EventIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faCalendarCheck} {...props} />
);

export const HomeIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faHome} {...props} />
);

export const OtherIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faEllipsisH} {...props} />
);

export const ExclamationCircleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faExclamationCircle} {...props} />
);

export const MagnifyingGlassIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faSearch} {...props} />
);

export const ArrowLeftOnRectangleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faSignOutAlt} {...props} />
);

export const ArrowDownIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faArrowDown} {...props} />
);

export const ChatBubbleLeftRightIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faComments} {...props} />
);

export const XMarkIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faTimes} {...props} />
);

export const CurrencyDollarIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faDollarSign} {...props} />
);

export const NewspaperIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faNewspaper} {...props} />
);

export const ScaleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faScaleBalanced} {...props} />
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faCheckCircle} {...props} />
);

export const InformationCircleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faInfoCircle} {...props} />
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faTimesCircle} {...props} />
);

export const ChatBubbleOvalLeftEllipsisIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faCommentDots} {...props} />
);

export const PaperAirplaneIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faPaperPlane} {...props} />
);

export const MegaphoneIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faBullhorn} {...props} />
);

export const ImageIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faImage} {...props} />
);

export const ClockIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faClock} {...props} />
);

export const LeafIcon: React.FC<IconProps> = (props) => (
    <FontAwesomeIcon icon={faLeaf} {...props} />
);
