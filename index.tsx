// /home/alexis/Sites/Landings/conexion-ec-ca/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast'; // <-- IMPORTAR
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-center" /> {/* <-- AÑADIR COMPONENTE */}
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
    