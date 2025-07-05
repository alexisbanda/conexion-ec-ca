// /home/alexis/Sites/Landings/conexion-ec-ca/netlify/functions/gemini.ts

// Limita el historial a los últimos 8 turnos (4 del usuario, 4 del bot).
// Es un poco más largo para permitir un contexto más rico en temas migratorios.
const MAX_HISTORY_TURNS = 4;

// Configuración de generación para un tono más informativo y menos "creativo".
const generationConfig = {
    "temperature": 0.6,
    "maxOutputTokens": 200, // Un poco más de espacio para respuestas detalladas.
};

// Filtros de seguridad estándar.
const safetySettings = [
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
];

// *** ¡LA CLAVE! *** La nueva personalidad del bot.
const systemInstruction = {
    role: "user",
    parts: [{
        text: `Eres 'Conex', un asistente virtual experto y muy amigable de 'EcuatorianosBC'. Tu única misión es ayudar a la comunidad ecuatoriana que vive o quiere vivir en Canadá.

        Tus reglas principales son:
        1.  **Tono:** Sé siempre empático, positivo y profesional. Usa un lenguaje claro y sencillo.
        2.  **Enfoque:** Céntrate exclusivamente en temas relacionados con la migración y la vida de los ecuatorianos en Canadá (visas, trabajo, estudios, adaptación cultural, servicios de la asociación, etc.).
        3.  **Límites:** Si te preguntan algo fuera de tu ámbito (política, deportes, temas no relacionados con la migración), declina amablemente la respuesta y redirige la conversación a tu propósito. Ejemplo: "Mi especialidad es la vida y migración en Canadá. ¿Cómo puedo ayudarte con eso?".
        4.  **Honestidad:** Si no sabes una respuesta o se trata de un caso legal muy específico, sé honesto. No inventes información. Recomienda contactar a un asesor humano de la asociación a través del formulario de contacto del sitio web.
        5.  **Personalidad:** Eres un bot, pero con un gran corazón para ayudar a tus compatriotas. ¡Haz que se sientan bienvenidos y apoyados!
        6.  **Formato:** Usa etiquetas HTML para dar formato al texto. Por ejemplo, usa <b> para negritas, <i> para cursivas, y <ul> con <li> para listas. No uses Markdown (como ** o *).`
    }]
};

export const handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido. Usa POST.' }) };
    }

    let incomingMessages;
    try {
        incomingMessages = JSON.parse(event.body).messages;
        if (!incomingMessages || !Array.isArray(incomingMessages)) {
            throw new Error("El body debe contener un array 'messages'.");
        }
    } catch (e) {
        const error = e as Error;
        return { statusCode: 400, body: JSON.stringify({ error: `Body inválido: ${error.message}` }) };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'La API Key de Gemini no está configurada en el servidor.' }) };
    }

    const conversationHistory = incomingMessages.slice(-MAX_HISTORY_TURNS);

    const contents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Inyectar la instrucción del sistema al principio de la conversación.
    const finalContents = [systemInstruction, ...contents];

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: finalContents,
                    generationConfig,
                    safetySettings
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error desde la API de Gemini:", errorData);
            const errorMessage = errorData.error?.message || "Ocurrió un error al contactar a la IA.";
            if (errorData.promptFeedback?.blockReason) {
                return { statusCode: 200, body: JSON.stringify({ message: { role: 'assistant', content: 'Lo siento, tu pregunta infringe nuestras políticas de seguridad. ¿Puedo ayudarte con otra cosa?' } }) };
            }
            return { statusCode: response.status, body: JSON.stringify({ error: errorMessage }) };
        }

        const data = await response.json();
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta. Por favor, intenta reformular tu pregunta.";

        // --- MODIFICACIÓN: Añadir los enlaces al final de cada respuesta ---
        // El frontend debe tener listeners para los atributos `data-action`.
        // ¡RECUERDA CAMBIAR EL NÚMERO DE WHATSAPP DE EJEMPLO!
        const contactInfo = `
<hr style="margin: 1rem 0; border-color: rgba(255,255,255,0.2);">
<p><b>¿Necesitas más ayuda?</b></p>
<ul>
    <li><b>¿Nuevo aquí?</b> <a href="#" data-action="open-register" style="color: inherit; text-decoration: underline;">Regístrate gratis</a> para acceder a todos los beneficios.</li>
    <li><b>¿Preguntas específicas?</b> <a href="#contact" data-action="focus-contact" style="color: inherit; text-decoration: underline;">Contacta a un asesor</a>.</li>
    <li><b>Chatea con nosotros:</b> <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">WhatsApp</a>.</li>
</ul>
`;

        const finalResponse = `${botResponse}\n\n${contactInfo}`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: {
                    role: 'assistant',
                    content: finalResponse
                }
            })
        };

    } catch (e) {
        const error = e as Error;
        console.error("Error en la función serverless:", error);
        return { statusCode: 500, body: JSON.stringify({ error: `Error interno del servidor: ${error.message}` }) };
    }
};