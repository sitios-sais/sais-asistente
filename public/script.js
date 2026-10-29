// Sincronizar el mundo global cada 4 segundos para que todos los jugadores vean los cambios en tiempo real
setInterval(() => {
    cargarMundoGlobal();
}, 4000);

async function enviarDecretoDivino() {
    const textarea = document.getElementById('inputDios');
    const decreto = textarea.value.trim();
    const modelo = document.getElementById('modeloSelect').value;
    if (decreto === "") return;

    textarea.value = "";

    // Prompt estricto de Creador / Modo Dios
    const promptDios = `[MODO DIOS - DECRETO DEL ARQUITECTO SUPREMO]\nEl Creador ha ordenado lo siguiente para dar forma y vida al mundo: "${decreto}"\n\nInstrucciones:\n1. Integra este evento, PNJ, objeto o regla directamente en el mundo persistente.\n2. Describe cómo el universo cambia, cómo reaccionan los habitantes o el entorno ante este mandato divino.\n3. Mantén una narrativa rica y viva para los aventureros que habitan este mundo.`;

    try {
        await fetch('/api/asistente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: promptDios, modelo: modelo })
        });
        cargarMundoGlobal();
    } catch (error) {
        console.error("Error al enviar decreto divino:", error);
    }
}

async function enviarAccionJugador() {
    const input = document.getElementById('inputMensaje');
    const accion = input.value.trim();
    const modelo = document.getElementById('modeloSelect').value;
    if (accion === "") return;

    input.value = "";

    // Prompt de acción de aventurero en el mundo abierto
    const promptJugador = `[MUNDO ABIERTO - ACCIÓN DE AVENTURERO]\nUn viajero realiza la siguiente acción en el mundo: "${accion}"\n\nInstrucciones:\n1. Simula el resultado de esta acción basándote en el estado actual del mundo.\n2. Permite que el entorno y los PNJs reaccionen de manera autónoma.\n3. Haz avanzar la simulación viva de este universo persistente.`;

    try {
        await fetch('/api/asistente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: promptJugador, modelo: modelo })
        });
        cargarMundoGlobal();
    } catch (error) {
        console.error("Error al enviar acción del jugador:", error);
    }
}

async function cargarMundoGlobal() {
    try {
        const respuesta = await fetch('/api/historial');
        const datos = await respuesta.json();
        
        document.getElementById('contadorTotal').innerText = `Eventos en la historia: ${datos.length}`;

        const contenedorMensajes = document.getElementById('chatMensajes');
        const estaAbajo = contenedorMensajes.scrollHeight - contenedorMensajes.scrollTop <= contenedorMensajes.clientHeight + 50;

        contenedorMensajes.innerHTML = '';

        if (datos.length === 0) {
            contenedorMensajes.innerHTML = `
                <div class="message assistant-message">
                    <div class="message-body">
                        <h3>El Génesis</h3>
                        <p>El universo aún no ha sido esculpido. Usa el <strong>Panel del Creador (Modo Dios)</strong> a la izquierda para escribir el primer decreto y dar vida a la tierra, el cielo y las primeras criaturas.</p>
                    </div>
                </div>
            `;
            return;
        }

        datos.forEach(item => {
            let etiqueta = "Aventurero";
            let textoUsuario = item.usuario;

            if (textoUsuario.includes("[MODO DIOS")) {
                etiqueta = "⚡ Creador (Decreto Divino)";
                textoUsuario = textoUsuario.replace('[MODO DIOS - DECRETO DEL ARQUITECTO SUPREMO]\nEl Creador ha ordenado lo siguiente para dar forma y vida al mundo: "', '').replace('"\n\nInstrucciones:\n1. Integra este evento...', '');
            } else if (textoUsuario.includes("[MUNDO ABIERTO")) {
                etiqueta = "Viajero";
                textoUsuario = textoUsuario.replace('[MUNDO ABIERTO - ACCIÓN DE AVENTURERO]\nUn viajero realiza la siguiente acción en el mundo: "', '').replace('"\n\nInstrucciones:\n1. Simula el resultado...', '');
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

        // Actualizar lista lateral de eventos
        const historialContainer = document.getElementById('historial-container');
        historialContainer.innerHTML = '';
        datos.slice(-10).reverse().forEach(item => {
            historialContainer.innerHTML += `
                <div class="history-card">
                    <p>${escapeHtml(item.usuario.substring(0, 40))}...</p>
                    <small style="color: var(--text-muted);">${new Date(item.fecha).toLocaleTimeString()}</small>
                </div>
            `;
        });

        if (estaAbajo) {
            contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
        }
    } catch (error) {
        console.error("Error al sincronizar simulación:", error);
    }
}

async function reiniciarUniverso() {
    if (!confirm("¿Estás seguro de destruir este universo? Se borrará todo el historial y la base de datos volverá al vacío.")) return;
    try {
        await fetch('/api/historial', { method: 'DELETE' });
        cargarMundoGlobal();
    } catch (error) {
        console.error("Error al reiniciar universo:", error);
    }
}

function verificarEnter(event) {
    if (event.key === 'Enter') {
        enviarAccionJugador();
    }
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

window.onload = () => {
    cargarMundoGlobal();
};
