// /home/alexis/Sites/Landings/conexion-ec-ca/pages/OnboardingPage.tsx
import React from 'react';
import { OnboardingWizard } from '../components/OnboardingWizard';

export const OnboardingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <OnboardingWizard />
        </div>
    );
};