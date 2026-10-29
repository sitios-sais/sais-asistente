let scene, camera, renderer, objetos3D = [];
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevMouseX = 0, prevMouseY = 0, isMouseDown = false;
let cameraRotationX = 0, cameraRotationY = 0;

function inicializarMotor3D() {
    const container = document.getElementById('canvas3d-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Vacío negro inicial

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Controles de movimiento (WASD / Flechas)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'w' || e.key === 'ArrowUp') moveForward = true;
        if (e.key === 's' || e.key === 'ArrowDown') moveBackward = true;
        if (e.key === 'a' || e.key === 'ArrowLeft') moveLeft = true;
        if (e.key === 'd' || e.key === 'ArrowRight') moveRight = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'w' || e.key === 'ArrowUp') moveForward = false;
        if (e.key === 's' || e.key === 'ArrowDown') moveBackward = false;
        if (e.key === 'a' || e.key === 'ArrowLeft') moveLeft = false;
        if (e.key === 'd' || e.key === 'ArrowRight') moveRight = false;
    });

    // Control de cámara con mouse
    container.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isMouseDown = false; });

    container.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        cameraRotationY -= deltaX * 0.003;
        cameraRotationX -= deltaY * 0.003;
        cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotationX));

        const direction = new THREE.Vector3(
            Math.sin(cameraRotationY) * Math.cos(cameraRotationX),
            Math.sin(cameraRotationX),
            Math.cos(cameraRotationY) * Math.cos(cameraRotationX)
        );
        camera.lookAt(camera.position.clone().add(direction));
    });

    // Bucle de renderizado y movimiento
    function animate() {
        requestAnimationFrame(animate);

        const speed = 0.1;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();

        const sideDir = new THREE.Vector3(-dir.z, 0, dir.x);

        if (moveForward) camera.position.addScaledVector(dir, speed);
        if (moveBackward) camera.position.addScaledVector(dir, -speed);
        if (moveLeft) camera.position.addScaledVector(sideDir, speed);
        if (moveRight) camera.position.addScaledVector(sideDir, -speed);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Interpretar decretos para construir el mundo físico
function construirElemento3D(texto) {
    const t = texto.toLowerCase();

    if (t.includes('luz') || t.includes('sol')) {
        const light = new THREE.DirectionalLight(0xfff5cc, 2);
        light.position.set(10, 20, 10);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    }

    if (t.includes('cielo')) {
        scene.background = new THREE.Color(0x38bdf8);
    }

    if (t.includes('suelo') || t.includes('tierra') || t.includes('piso')) {
        const geo = new THREE.PlaneGeometry(60, 60);
        const mat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
        const floor = new THREE.Mesh(geo, mat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        scene.add(floor);
        objetos3D.push(floor);
    }

    if (t.includes('arbol') || t.includes('bosque')) {
        for (let i = 0; i < 6; i++) {
            const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2), new THREE.MeshStandardMaterial({ color: 0x78350f }));
            const hojas = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0x166534 }));
            hojas.position.y = 1.5;

            const arbol = new THREE.Group();
            arbol.add(tronco);
            arbol.add(hojas);
            arbol.position.set((Math.random() - 0.5) * 25, 0, (Math.random() - 0.5) * 25);
            scene.add(arbol);
            objetos3D.push(arbol);
        }
    }

    if (!t.includes('suelo') && !t.includes('arbol') && !t.includes('luz') && !t.includes('cielo')) {
        const obj = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }));
        obj.position.set((Math.random() - 0.5) * 12, 0, (Math.random() - 0.5) * 12);
        scene.add(obj);
        objetos3D.push(obj);
    }
}

function limpiarMundo3DCompleto() {
    objetos3D.forEach(obj => scene.remove(obj));
    objetos3D = [];
    scene.background = new THREE.Color(0x000000);
}
