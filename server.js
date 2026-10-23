const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa Groq (tomará automáticamente la variable de entorno GROQ_API_KEY)
const groq = new Groq();

app.use(express.json());
app.use(express.static('public'));

app.post('/api/asistente', async (req, res) => {
    try {
        const mensajeUsuario = req.body.mensaje || "Hola";

        // Llamada a la API de Groq usando un modelo rápido y potente como Llama 3
        const completion = await groq.chat.completions.create({
            model: "llama3-8b-8192", // O puedes usar "llama-3.3-70b-versatile"
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente personal útil, amigable y conciso."
                },
                {
                    role: "user",
                    content: mensajeUsuario
                }
            ],
            temperature: 0.7,
        });

        const respuestaAsistente = completion.choices[0]?.message?.content || "No pude generar una respuesta.";

        // Devuelve la respuesta al cliente (app o web)
        res.json({ respuesta: respuestaAsistente });
        
    } catch (error) {
        console.error("Error al conectar con Groq:", error);
        res.status(500).json({ respuesta: "Lo siento, tuve un problema procesando tu mensaje con la IA." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});