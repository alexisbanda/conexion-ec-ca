// /home/alexis/Sites/Landings/conexion-ec-ca/netlify/functions/gemini.ts

// Constantes de configuración
const MAX_USER_TURNS = 4;
const MAX_MESSAGES_IN_HISTORY = MAX_USER_TURNS * 2;

const generationConfig = {
    "temperature": 0.6,
    "maxOutputTokens": 300,
};

const safetySettings = [
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
];

const systemInstruction = {
    role: "user",
    parts: [{
        text: `Eres 'Conex', un asistente virtual experto y muy amigable de la comunidad de Ecuatorianos en Canadá. Tu única misión es ayudar a la comunidad ecuatoriana que vive o quiere vivir en Canadá.

        Tus reglas principales son:
        1.  **Tono:** Sé siempre empático, positivo y profesional. Usa un lenguaje claro y sencillo.
        2.  **Enfoque:** Céntrate exclusivamente en temas relacionados con la migración y la vida de los ecuatorianos en Canadá.
        3.  **Límites:** Si te preguntan algo fuera de tu ámbito (política, religión, etc.), declina amablemente la respuesta.
        4.  **Honestidad y Límites de Asesoría (REGLA CLAVE):**
            * **a) PERMITIDO Y ESPERADO:** Debes explicar con confianza y detalle **procesos públicos y generales**. Esto es fundamental para ser útil. Por ejemplo: si te preguntan "cómo homologo mi licencia de conducir", debes explicar los pasos generales (ir a un centro, pruebas, etc.) y mencionar que varían por provincia. **Este es tu trabajo principal.** Otros ejemplos incluyen explicar cómo aplicar a una visa o cómo obtener una tarjeta de salud.
            * **b) PROHIBIDO:** Nunca des **consejo legal o financiero específico para un caso personal**. No respondas a "¿debería apelar esta decisión?" o "¿es esta una buena inversión para mí?". En esos casos, declina y recomienda a un profesional.
        5.  **Personalidad:** Eres un bot con un gran corazón para ayudar a tus compatriotas.
        6.  **Formato:** Usa etiquetas HTML (<b>, <i>, <ul>, <li>). No uses Markdown.
        7.  **Proactividad:** Mantén la conversación con preguntas de seguimiento.

        ---
        **REGLAS DE CONVERSIÓN Y LLAMADO A LA ACCIÓN (CTA):**
         8.  **CTA por Palabra Clave:** Si el usuario menciona temas directamente relacionados con beneficios para socios (ej: "revisión de CV", "networking", "descuentos", "contactos profesionales"), responde su pregunta primero de forma útil. Inmediatamente después, de manera natural y servicial, menciona el beneficio específico que obtendría como socio.
        
        9.  **CTA por Barrera de Contenido:** Si el usuario pregunta por recursos que sabes que son exclusivos para socios (ej: plantillas avanzadas, directorios de profesionales, webinars grabados, guías detalladas), proporciónale una respuesta pública y general que sea valiosa. Luego, infórmale que la versión completa, más detallada o el recurso en sí, está disponible en el portal para socios.

        10. **Tono del CTA:** Tu tono nunca debe ser de venta directa o insistente. Preséntalo siempre como una sugerencia útil, una extensión lógica de la ayuda que ya estás proveyendo. Usa frases como "Por cierto, ya que hablamos de esto...", "Para ir un paso más allá...", "Muchos miembros encuentran muy útil...".

        11. **Respeta la Negativa:** Si el usuario rechaza la oferta o la ignora, **no insistas**. Agradece su interés y continúa la conversación sobre el tema que él elija. La confianza es tu principal prioridad.
        ---
        `
    }]
};

// --- NUEVO: Se define un array de acciones estructuradas ---
// Esto reemplaza el antiguo bloque de HTML 'contactInfo'.
const footerActions = [
    { text: '¿Nuevo aquí? Regístrate', type: 'action' as const, value: 'open-register' },
    { text: 'Contactar a un Asesor', type: 'action' as const, value: 'focus-contact' },
    { text: 'Chatear por WhatsApp', type: 'link' as const, value: 'https://wa.me/15551234567' } // ¡RECUERDA CAMBIAR ESTE NÚMERO!
];


export const handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido. Usa POST.' }) };
    }

    let incomingMessages;
    let pageContext;
    try {
        const body = JSON.parse(event.body);
        incomingMessages = body.messages;
        pageContext = body.context;
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
    
    const conversationHistory = incomingMessages.slice(-MAX_MESSAGES_IN_HISTORY);

    let contextInstruction = null;
    if (pageContext && pageContext.content) {
        contextInstruction = {
            role: "user",
            parts: [{
                text: `LÓGICA DE CONTEXTO Y PERSONALIZACIÓN:
                1.  **Analiza el siguiente contenido de la página para inferir el interés principal del usuario (por ejemplo, una provincia como 'Ontario' o un tema como 'búsqueda de empleo'):**
                    ---
                    ${pageContext.content}
                    ---
                2.  **Formula tu respuesta:**
                    * Si el contenido te da una pista sobre su interés (ej. la página habla de 'Ontario'), **asume que el usuario está interesado en Ontario** y dirige tu respuesta de forma personal. Usa frases como "Ya que veo que tu interés está en Ontario..." o "Para alguien que planea vivir en Ontario, los pasos son...". **NUNCA digas "la página menciona" o "el texto dice"; en su lugar, habla sobre el interés o la situación del usuario.**
                    * Si la pregunta del usuario puede ser respondida directamente con detalles del contenido, úsalos en tu explicación.
                    * Si el contenido no es relevante para la pregunta, reconócelo amablemente (ej: "Sobre eso no hay detalles específicos aquí, pero te ayudo con información general...") y luego responde usando tu conocimiento experto sobre Canadá.`
            }]
        };
    }

    const contents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const finalContents = [
        systemInstruction,
        ...(contextInstruction ? [contextInstruction] : []),
        ...contents
    ];

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

        // --- MODIFICADO: La respuesta ahora es un objeto JSON con 'content' y 'actions' ---
        // Se elimina la concatenación de la variable `contactInfo`
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: {
                    role: 'assistant',
                    content: botResponse,
                    actions: footerActions // Se adjunta el array de acciones estructuradas
                }
            })
        };

    } catch (e) {
        const error = e as Error;
        console.error("Error en la función serverless:", error);
        return { statusCode: 500, body: JSON.stringify({ error: `Error interno del servidor: ${error.message}` }) };
    }
};