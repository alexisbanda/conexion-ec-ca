import React from 'react';

export const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        {/* Poste central */}
        <line x1="12" y1="3" x2="12" y2="21" />

        {/* Brazo izquierdo */}
        <line x1="12" y1="9" x2="6" y2="15" />
        <line x1="6" y1="15" x2="3" y2="15" />
        <circle cx="6" cy="17" r="2" />

        {/* Brazo derecho */}
        <line x1="12" y1="9" x2="18" y2="15" />
        <line x1="18" y1="15" x2="21" y2="15" />
        <circle cx="18" cy="17" r="2" />

        {/* Base */}
        <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
);
