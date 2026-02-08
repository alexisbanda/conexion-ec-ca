import React from 'react';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import { GeneralSettingsSection } from './GeneralSettingsSection';

const SettingsPage: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-ecuador-blue mb-6 font-montserrat">
                Configuración General del Portal
            </h2>
            <div className="space-y-8">
                <GeneralSettingsSection />
                <NotificationSettingsSection />
                {/* En el futuro, aquí podrías añadir más secciones de configuración */}
                {/* <SomeOtherSettingsSection /> */}
            </div>
        </div>
    );
};

export default SettingsPage;