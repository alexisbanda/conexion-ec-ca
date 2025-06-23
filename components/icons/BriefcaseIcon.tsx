import React from 'react';

export const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        {/* Cuerpo del maletín */}
        <rect x="3" y="8" width="18" height="12" rx="2" ry="2" />
        {/* Asa del maletín */}
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
);
