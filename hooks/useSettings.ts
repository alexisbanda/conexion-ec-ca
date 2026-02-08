import { useState, useEffect } from 'react';
import { getGeneralSettings, GeneralSettings } from '../services/adminService';

export const useSettings = () => {
    const [settings, setSettings] = useState<GeneralSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getGeneralSettings();
                setSettings(data);
            } catch (err) {
                console.error("Error loading settings:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
};
