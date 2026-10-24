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

// Esquema para el historial
const mensajeSchema = new mongoose.Schema({
    usuario: String,
    respuesta: String,
    fecha: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model('Mensaje', mensajeSchema);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static('public'));

// Ruta del chat (con soporte para elegir modelo desde la web)
app.post('/api/asistente', async (req, res) => {
    try {
        const mensajeUsuario = req.body.mensaje || "Hola";
        const modeloSeleccionado = req.body.modelo || "openai/gpt-oss-20b";

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: mensajeUsuario }],
            model: modeloSeleccionado,
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

// Ruta para consultar el historial
app.get('/api/historial', async (req, res) => {
    try {
        const historial = await Mensaje.find().sort({ fecha: -1 }).limit(15);
        res.json(historial);
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "No se pudo cargar el historial" });
    }
});

// NUEVA RUTA: Borrar todo el historial de la base de datos
app.delete('/api/historial', async (req, res) => {
    try {
        await Mensaje.deleteMany({});
        res.json({ mensaje: "Historial borrado con éxito" });
    } catch (error) {
        console.error("Error al borrar historial:", error);
        res.status(500).json({ error: "No se pudo vaciar la base de datos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
