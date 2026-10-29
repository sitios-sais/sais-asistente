let ultimoHistorialData = [];

async function enviarMensaje() {
    const input = document.getElementById('inputMensaje');
    const texto = input.value.trim();
    const modelo = document.getElementById('modeloSelect').value;
    if (texto === "") return;

    agregarMensajeAlChat(texto, 'user');
    input.value = "";

    const idEscribiendo = mostrarIndicadorEscribiendo();

    try {
        const respuesta = await fetch('/api/asistente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: texto, modelo: modelo })
        });
        const data = await respuesta.json();
        
        removerIndicadorEscribiendo(idEscribiendo);

        const caracteres = data.respuesta.length;
        agregarMensajeAlChat(data.respuesta, 'assistant', caracteres);
        
        cargarHistorial();
    } catch (error) {
        console.error("Error al conectar:", error);
        removerIndicadorEscribiendo(idEscribiendo);
        agregarMensajeAlChat("Lo siento, ocurrió un error de conexión con el servidor.", 'assistant');
    }
}

async function cargarHistorial() {
    try {
        const respuesta = await fetch('/api/historial');
        const datos = await respuesta.json();
        ultimoHistorialData = datos;
        
        document.getElementById('contadorTotal').innerText = `Mensajes guardados: ${datos.length}`;

        const contenedor = document.getElementById('historial-container');
        contenedor.innerHTML = '';
        
        if (datos.length === 0) {
            contenedor.innerHTML = '<div class="history-empty">Sin registros guardados</div>';
            return;
        }

        datos.forEach(item => {
            contenedor.innerHTML += `
                <div class="history-card">
                    <p><strong>Tú:</strong> ${escapeHtml(item.usuario)}</p>
                    <p style="color: var(--text-muted);"><strong>IA:</strong> ${escapeHtml(item.respuesta.substring(0, 45))}...</p>
                    <small>${new Date(item.fecha).toLocaleTimeString()}</small>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

async function limpiarBaseDatos() {
    if (!confirm("¿Estás seguro de borrar todo el historial en MongoDB?")) return;
    try {
        await fetch('/api/historial', { method: 'DELETE' });
        cargarHistorial();
        alert("Base de datos vaciada con éxito.");
    } catch (error) {
        console.error("Error al limpiar:", error);
    }
}

function exportarHistorial() {
    if (ultimoHistorialData.length === 0) {
        alert("No hay historial para exportar.");
        return;
    }
    let textoExport = "=== HISTORIAL DE CONVERSACIONES - SAIS ===\n\n";
    ultimoHistorialData.forEach((item, index) => {
        textoExport += `[${index + 1}] Fecha: ${new Date(item.fecha).toLocaleString()}\n`;
        textoExport += `Tú: ${item.usuario}\n`;
        textoExport += `IA: ${item.respuesta}\n`;
        textoExport += "--------------------------------------------------\n\n";
    });

    const blob = new Blob([textoExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sais_historial_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function verificarEnter(event) {
    if (event.key === 'Enter') {
        enviarMensaje();
    }
}

function agregarMensajeAlChat(texto, remitente, caracteres = null) {
    const contenedorMensajes = document.getElementById('chatMensajes');
    const divMensaje = document.createElement('div');
    divMensaje.className = `message ${remitente === 'user' ? 'user-message' : 'assistant-message'}`;
    
    if (remitente === 'assistant') {
        const htmlMarkdown = marked.parse(texto);
        let contenidoHtml = `<div class="message-body">${htmlMarkdown}</div>`;
        
        if (caracteres !== null) {
            contenidoHtml += `
                <div class="message-footer">
                    <span class="meta-info">Caracteres: ${caracteres}</span>
                    <button class="copy-btn" onclick="copiarTexto(this, \`${escapeJs(texto)}\`)">Copiar</button>
                </div>
            `;
        }
        divMensaje.innerHTML = contenidoHtml;
    } else {
        divMensaje.innerHTML = `<p>${escapeHtml(texto)}</p>`;
    }

    contenedorMensajes.appendChild(divMensaje);
    contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function copiarTexto(boton, texto) {
    navigator.clipboard.writeText(texto).then(() => {
        const originalText = boton.innerText;
        boton.innerText = 'Copiado';
        setTimeout(() => { boton.innerText = originalText; }, 2000);
    });
}

function escapeJs(str) {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function mostrarIndicadorEscribiendo() {
    const contenedorMensajes = document.getElementById('chatMensajes');
    const divMensaje = document.createElement('div');
    divMensaje.className = 'message assistant-message typing-indicator';
    divMensaje.id = 'temp-escribiendo';
    divMensaje.innerHTML = '<p>Analizando y redactando respuesta...</p>';
    contenedorMensajes.appendChild(divMensaje);
    contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
    return 'temp-escribiendo';
}

function removerIndicadorEscribiendo(id) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.remove();
}

window.onload = () => {
    cargarHistorial();
};
