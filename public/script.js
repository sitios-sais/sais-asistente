// Sincronización automática del mundo global cada 4 segundos
setInterval(() => {
    sincronizarMundo();
}, 4000);

async function ejecutarDecretoCreador() {
    const textarea = document.getElementById('inputDios');
    const decreto = textarea.value.trim();
    const modelo = document.getElementById('modeloSelect').value;
    if (decreto === "") return;

    textarea.value = "";

    // Ejecutar construcción en el motor 3D
    construirElemento3D(decreto);

    const promptDios = `[MODO DIOS 3D - ARQUITECTO]\nEl Creador ordenó: "${decreto}"\n\nNarra la materialización de este elemento en el universo.`;

    try {
        await fetch('/api/asistente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: promptDios, modelo: modelo })
        });
        sincronizarMundo();
    } catch (error) {
        console.error("Error al enviar decreto:", error);
    }
}

async function enviarAccionMundo() {
    const input = document.getElementById('inputMensaje');
    const accion = input.value.trim();
    const modelo = document.getElementById('modeloSelect').value;
    if (accion === "") return;

    input.value = "";

    const promptAccion = `[MUNDO 3D - ACCIÓN]\nEl viajero realiza: "${accion}"\n\nSimula la consecuencia en el entorno.`;

    try {
        await fetch('/api/asistente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: promptAccion, modelo: modelo })
        });
        sincronizarMundo();
    } catch (error) {
        console.error("Error al enviar acción:", error);
    }
}

async function sincronizarMundo() {
    try {
        const respuesta = await fetch('/api/historial');
        const datos = await respuesta.json();
        
        document.getElementById('contadorTotal').innerText = `Entidades en el mundo: ${datos.length + objetos3D.length}`;

        const contenedorMensajes = document.getElementById('chatMensajes');
        const estaAbajo = contenedorMensajes.scrollHeight - contenedorMensajes.scrollTop <= contenedorMensajes.clientHeight + 50;

        contenedorMensajes.innerHTML = '';

        if (datos.length === 0) {
            contenedorMensajes.innerHTML = `
                <div class="message assistant-message">
                    <div class="message-body">
                        <h3>El Vacío Absoluto</h3>
                        <p>Usa el panel izquierdo para ordenar al motor crear elementos físicos.</p>
                    </div>
                </div>
            `;
            return;
        }

        datos.forEach(item => {
            let etiqueta = "Viajero";
            let textoUsuario = item.usuario;

            if (textoUsuario.includes("[MODO DIOS")) {
                etiqueta = "⚡ Creador";
                textoUsuario = textoUsuario.replace('[MODO DIOS 3D - ARQUITECTO]\nEl Creador ordenó: "', '').replace('"\n\nNarra la materialización...', '');
            }

            contenedorMensajes.innerHTML += `
                <div class="message user-message">
                    <p><strong>${etiqueta}:</strong> ${escapeHtml(textoUsuario)}</p>
                </div>
            `;
            contenedorMensajes.innerHTML += `
                <div class="message assistant-message">
                    <div class="message-body">${marked.parse(item.respuesta)}</div>
                </div>
            `;
        });

        const historialContainer = document.getElementById('historial-container');
        historialContainer.innerHTML = '';
        datos.slice(-10).reverse().forEach(item => {
            historialContainer.innerHTML += `
                <div class="history-card">
                    <p>${escapeHtml(item.usuario.substring(0, 35))}...</p>
                    <small style="color: var(--text-muted);">${new Date(item.fecha).toLocaleTimeString()}</small>
                </div>
            `;
        });

        if (estaAbajo) {
            contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
        }
    } catch (error) {
        console.error("Error al sincronizar:", error);
    }
}

async function reiniciarUniversoTotal() {
    if (!confirm("¿Destruir el universo y vaciar la base de datos?")) return;
    try {
        await fetch('/api/historial', { method: 'DELETE' });
        limpiarMundo3DCompleto();
        sincronizarMundo();
    } catch (error) {
        console.error("Error al reiniciar:", error);
    }
}

function verificarEnter(event) {
    if (event.key === 'Enter') {
        enviarAccionMundo();
    }
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

window.onload = () => {
    inicializarMotor3D();
    sincronizarMundo();
};
