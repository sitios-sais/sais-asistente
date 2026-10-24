const express = require('express');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("Conectado a MongoDB Atlas exitosamente"))
    .catch(err => console.error("Error al conectar a MongoDB:", err));

// Esquema y modelo para el historial
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

// Ruta del chat con la IA y guardado automático
app.post('/api/asistente', async (req, res) => {
    try {
        const mensajeUsuario = req.body.mensaje || "Hola";

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: mensajeUsuario }],
            model: "openai/gpt-oss-20b",
        });

        const respuestaIA = completion.choices[0]?.message?.content || "No obtuve respuesta";

        // Guardar en MongoDB Atlas
        const nuevoRegistro = new Mensaje({ usuario: mensajeUsuario, respuesta: respuestaIA });
        await nuevoRegistro.save();

        res.json({ respuesta: respuestaIA });

    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ respuesta: "Hubo un error al procesar con la inteligencia artificial." });
    }
});

// NUEVA RUTA: Consultar el historial de mensajes
app.get('/api/historial', async (req, res) => {
    try {
        const historial = await Mensaje.find().sort({ fecha: -1 }).limit(10);
        res.json(historial);
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "No se pudo cargar el historial" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
