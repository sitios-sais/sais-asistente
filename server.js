const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.post('/api/asistente', async (req, res) => {
    try {
        const mensajeUsuario = req.body.mensaje || "Hola";

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: mensajeUsuario }],
            model: "llama-3.3-70b-versatile",
        });

        res.json({ respuesta: completion.choices[0]?.message?.content || "Sin respuesta" });
    } catch (error) {
        console.error("Error con Groq:", error);
        res.status(500).json({ respuesta: "Error procesando con la IA." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});