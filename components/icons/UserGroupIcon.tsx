import React from 'react';

export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Persona central */}
        <circle cx="12" cy="9" r="3" />
        {/* Personas laterales (cabezas) */}
        <circle cx="6.5" cy="11.5" r="2" />
        <circle cx="17.5" cy="11.5" r="2" />
        {/* Cuerpos */}
        <path d="M9 21v-2a3 3 0 0 1 6 0v2" />
        <path d="M4 19v-1a2 2 0 0 1 3-1.732" />
        <path d="M20 19v-1a2 2 0 0 0-3-1.732" />
    </svg>
);
