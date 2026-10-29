let scene, camera, renderer, objetos3D = [];

// Inicializar el entorno gráfico 3D al cargar la página
function inicializar3D() {
    const container = document.getElementById('canvas3d-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03050a);

    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Cuadrícula del suelo
    const gridHelper = new THREE.GridHelper(20, 20, 0x8b5cf6, 0x1e293b);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Bucle de animación (rota los objetos ligeramente para dar vida)
    function animate() {
        requestAnimationFrame(animate);
        objetos3D.forEach((obj, index) => {
            obj.rotation.y += 0.005 * (index % 2 === 0 ? 1 : -1);
        });
        renderer.render(scene, camera);
    }
    animate();

    // Adaptar tamaño si cambia la ventana
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Generar una entidad geométrica 3D física en la pantalla según el decreto
function generarEntidad3D(tipo = 'default') {
    let geometria, material;

    // Crear distintas formas basadas en aleatoriedad o tipo
    const formas = [
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.ConeGeometry(1, 2, 32),
        new THREE.CylinderGeometry(0.8, 0.8, 2, 32)
    ];

    geometria = formas[Math.floor(Math.random() * formas.length)];
    
    const colores = [0x8b5cf6, 0x2563eb, 0x059669, 0xdc2626, 0xf59e0b];
    material = new THREE.MeshStandardMaterial({
        color: colores[Math.floor(Math.random() * colores.length)],
        roughness: 0.3,
        metalness: 0.8
    });

    const mesh = new THREE.Mesh(geometria, material);

    // Distribuir aleatoriamente en el espacio 3D
    mesh.position.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 2,
        (Math.random() - 0.5) * 8
    );

    scene.add(mesh);
    objetos3D.push(mesh);
}

// Sincronización del mundo cada 4 segundos
setInterval(() => {
    cargarMundoGlobal();
}, 4000);

async function enviarDecretoDivino() {
    const textarea = document.getElementById('inputDios');
    const decreto = textarea.value.trim();
    const modelo = document.getElementById('modeloSelect').value;
    if (decreto === "") return;

    textarea.value = "";

    // Generar un objeto 3D físico inmediato en pantalla
    generarEntidad3D();

    const promptDios = `[MODO DIOS 3D - ARQUITECTO SUPREMO]\nEl Creador ha ordenado físicamente: "${decreto}"\n\nInstrucciones:\n1. Describe cómo este decreto materializa estructuras físicas, energía o seres en el mundo 3D.\n2. Mantén la narrativa inmersiva de simulación activa.`;

    try {
        await fetch('/api/asistente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: promptDios, modelo: modelo })
        });
        cargarMundoGlobal();
    } catch (error) {
        console.error("Error al enviar decreto 3D:", error);
    }
}

async function enviarAccionJugador() {
    const input = document.getElementById('inputMensaje');
    const accion = input.value.trim();
    const modelo = document.getElementById('modeloSelect').value;
    if (accion === "") return;

    input.value = "";

    const promptJugador = `[MUNDO 3D - ACCIÓN]\nEl viajero realiza: "${accion}"\n\nSimula la consecuencia física de esta acción en el entorno tridimensional.`;

    try {
        await fetch('/api/asistente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: promptJugador, modelo: modelo })
        });
        cargarMundoGlobal();
    } catch (error) {
        console.error("Error al enviar acción:", error);
    }
}

async function cargarMundoGlobal() {
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
                        <h3>El Vacío 3D</h3>
                        <p>El espacio tridimensional está vació. Usa el <strong>Panel del Creador</strong> para emitir el primer decreto y ver cómo se materializan objetos físicos.</p>
                    </div>
                </div>
            `;
            return;
        }

        datos.forEach(item => {
            let etiqueta = "Viajero";
            let textoUsuario = item.usuario;

            if (textoUsuario.includes("[MODO DIOS")) {
                etiqueta = "⚡ Creador (Decreto 3D)";
                textoUsuario = textoUsuario.replace('[MODO DIOS 3D - ARQUITECTO SUPREMO]\nEl Creador ha ordenado físicamente: "', '').replace('"\n\nInstrucciones:\n1. Describe cómo este...', '');
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

        // Actualizar lista lateral
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

async function reiniciarUniverso() {
    if (!confirm("¿Destruir el universo 3D actual?")) return;
    try {
        await fetch('/api/historial', { method: 'DELETE' });
        // Limpiar objetos 3D de la escena
        objetos3D.forEach(obj => scene.remove(obj));
        objetos3D = [];
        cargarMundoGlobal();
    } catch (error) {
        console.error("Error al reiniciar:", error);
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
    inicializar3D();
    cargarMundoGlobal();
};
