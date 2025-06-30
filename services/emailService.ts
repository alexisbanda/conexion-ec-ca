// /home/alexis/Sites/Landings/conexion-ec-ca/services/emailService.ts

interface WelcomeEmailPayload {
    name: string;
    email: string;
}

// --- NUEVA INTERFAZ Y FUNCIÓN ---
interface ApprovalEmailPayload {
    name: string;
    email: string;
}

/**
 * Llama a nuestra Netlify Function para enviar el correo de bienvenida.
 * @param payload - El objeto con el nombre y email del destinatario.
 */
export const sendWelcomeEmail = async (payload: WelcomeEmailPayload): Promise<void> => {
    try {
        // El endpoint es relativo a la raíz del sitio
        await fetch('/.netlify/functions/send-welcome-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        console.log(`Solicitud de correo de bienvenida enviada para: ${payload.email}`);
    } catch (error) {
        console.error("Error al llamar a la función de envío de correo:", error);
        // No relanzamos el error para no interrumpir el flujo principal del usuario
        // si solo falla la notificación por correo.
    }
};

/**
 * Llama a una nueva Netlify Function para enviar el correo de aprobación.
 * @param payload - El objeto con el nombre y email del destinatario.
 */
export const sendApprovalEmail = async (payload: ApprovalEmailPayload): Promise<void> => {
    try {
        // Usaremos un nuevo endpoint para esta lógica
        await fetch('/.netlify/functions/send-approval-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        console.log(`Solicitud de correo de aprobación enviada para: ${payload.email}`);
    } catch (error) {
        console.error("Error al llamar a la función de aprobación de correo:", error);
    }
};