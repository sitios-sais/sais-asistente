const express = require('express');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB Atlas usando la variable de entorno
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("Conectado a MongoDB Atlas exitosamente"))
    .catch(err => console.error("Error al conectar a MongoDB:", err));

// Esquema para guardar el historial de chat
const mensajeSchema = new mongoose.Schema({
    usuario: String,
    respuesta: String,
    fecha: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model('Mensaje', mensajeSchema);

// Inicializar Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.post('/api/asistente', async (req, res) => {
    try {
        const mensajeUsuario = req.body.mensaje || "Hola";

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: mensajeUsuario }],
            model: "openai/gpt-oss-20b",
        });

        const respuestaIA = completion.choices[0]?.message?.content || "No obtuve respuesta";

        // Guardar automáticamente en MongoDB Atlas
        const nuevoRegistro = new Mensaje({ usuario: mensajeUsuario, respuesta: respuestaIA });
        await nuevoRegistro.save();

        res.json({ respuesta: respuestaIA });

    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ respuesta: "Hubo un error al procesar con la inteligencia artificial." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
