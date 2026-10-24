const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa Groq usando la variable de entorno configurada en Render
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.post('/api/asistente', async (req, res) => {
    try {
        const mensajeUsuario = req.body.mensaje || "Hola";

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: mensajeUsuario }],
            model: "llama3-8b-8192",
        });

        const respuestaIA = completion.choices[0]?.message?.content || "No obtuve respuesta";
        res.json({ respuesta: respuestaIA });

    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ respuesta: "Hubo un error al procesar con la inteligencia artificial." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
