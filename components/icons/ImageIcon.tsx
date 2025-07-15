// /home/alexis/Sites/Landings/conexion-ec-ca/components/icons/ImageIcon.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <FontAwesomeIcon icon={faImage} className={className} />
);