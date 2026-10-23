const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/asistente', (req, res) => {
    const mensajeUsuario = req.body.mensaje ? req.body.mensaje.toLowerCase() : '';
    let respuestaAsistente = "Hola, estoy aprendiendo.";

    if (mensajeUsuario.includes('hola')) {
        respuestaAsistente = "¡Hola! ¿En qué te ayudo?";
    }

    res.json({ respuesta: respuestaAsistente });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});