function getEscanearView() {
    return `
    <div id="scanner-container">
        <h1 class="text-2xl font-bold text-white mb-6 text-center z-10">Escanear QR de Negocio</h1>
        <div class="relative w-full max-w-md mx-auto">
            <video id="scanner-video" autoplay playsinline muted style="width: 100%; height: auto; max-height: 70vh; object-fit: cover;"></video>
            <div id="scanner-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; height: 80%; border: 2px solid #00ff00; pointer-events: none;"></div>
        </div>
        <div id="scanner-controls" class="z-10 mt-4">
            <button onclick="switchView('pago')" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md">
                Cancelar
            </button>
        </div>
        <div id="scanner-message" class="text-center text-white mt-4">Iniciando cámara...</div>
        <!-- Canvas oculto para procesamiento de jsQR -->
        <canvas id="scanner-canvas" style="display: none;"></canvas>
    </div>
    `;
}

let scanningActive = false;
let videoStream = null;
let animationFrameId = null;

function iniciarEscaneo() {
    const video = document.getElementById('scanner-video');
    const canvasElement = document.getElementById('scanner-canvas');
    const canvas = canvasElement.getContext('2d');
    const messageDiv = document.getElementById('scanner-message'); // Elemento de mensaje en pantalla

    if (!video) {
        console.error("Elemento video no encontrado para escaneo.");
        messageDiv.textContent = "Error: Cámara no encontrada.";
        messageDiv.className = "text-center text-red-500 mt-4";
        showMessage("Error al iniciar la cámara.", 'error');
        switchView('pago');
        return;
    }

    // Mostrar mensaje de inicio
    messageDiv.textContent = "Iniciando cámara...";
    messageDiv.className = "text-center text-yellow-400 mt-4";

    scanningActive = true;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        videoStream = stream;
        video.srcObject = stream;
        video.play();
        // Mensaje de éxito al iniciar cámara
        messageDiv.textContent = "Cámara iniciada. Apunta al QR.";
        messageDiv.className = "text-center text-green-400 mt-4";

        // Función recursiva para escanear continuamente
        function scan() {
            if (!scanningActive) return; // Detener si la bandera cambia

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvasElement.width = video.videoWidth;
                canvasElement.height = video.videoHeight;
                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    console.log("Código QR detectado:", code.data);
                    // Mensaje de detección
                    messageDiv.textContent = `QR detectado: ${code.data}`;
                    messageDiv.className = "text-center text-blue-400 mt-4";
                    detenerEscaneo(); // Detiene la cámara y el bucle de escaneo
                    procesarCodigoQR(code.data, messageDiv); // Pasa el div de mensaje
                    return; // Salir de la función scan
                }
            }
            // Solicitar el próximo frame de escaneo
            animationFrameId = requestAnimationFrame(scan);
        }

        // Iniciar el bucle de escaneo
        scan();

    }).catch(err => {
        console.error("Error al acceder a la cámara:", err);
        messageDiv.textContent = `Error cámara: ${err.message || 'No se pudo acceder.'}`;
        messageDiv.className = "text-center text-red-500 mt-4";
        scanningActive = false; // Asegura que no se intente escanear
    });
}

function detenerEscaneo() {
    scanningActive = false; // Cambia la bandera para detener el bucle

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (videoStream) {
        const tracks = videoStream.getTracks();
        tracks.forEach(track => track.stop());
        videoStream = null;
    }
    console.log("Escaneo detenido.");
}

// --- FUNCIÓN ACTUALIZADA para procesar el código QR ---
// Recibe también el div de mensaje para mostrar estado
function procesarCodigoQR(code, messageDiv) {
    // Detenemos la cámara inmediatamente para congelar la imagen en el estado de lectura
    detenerEscaneo();

    // El formato esperado es "ID_NEGOCIO,MONTO"
    const parts = code.split(',');
    if (parts.length !== 2) {
        messageDiv.textContent = "QR inválido: Formato incorrecto.";
        messageDiv.className = "text-center text-red-500 mt-4";
        console.error("Código QR inválido, no tiene 2 partes:", code);
        // Aseguramos que se haya detenido y damos un tiempo antes de volver
        setTimeout(() => switchView('pago'), 2000); // Espera 2 segundos antes de volver
        return;
    }

    const negocioId = parts[0].trim();
    const montoStr = parts[1].trim();

    // Validar ID (4 dígitos)
    if (!/^\d{4}$/.test(negocioId)) {
        messageDiv.textContent = `QR inválido: ID (${negocioId}) incorrecto.`;
        messageDiv.className = "text-center text-red-500 mt-4";
        console.error("Código QR inválido: ID no es 4 dígitos:", negocioId);
        setTimeout(() => switchView('pago'), 2000);
        return;
    }

    // Validar Monto
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
        messageDiv.textContent = `QR inválido: Monto (${montoStr}) incorrecto.`;
        messageDiv.className = "text-center text-red-500 mt-4";
        console.error("Código QR inválido: Monto no es número válido:", montoStr);
        setTimeout(() => switchView('pago'), 2000);
        return;
    }

    // Verificar si el negocio existe
    const negocio = usuarios.find(u => u.id === negocioId);
    if (!negocio) {
        messageDiv.textContent = `Negocio ID ${negocioId} no encontrado.`;
        messageDiv.className = "text-center text-red-500 mt-4";
        console.error("Negocio no encontrado para ID:", negocioId);
        setTimeout(() => switchView('pago'), 2000);
        return;
    }

    // Almacenar temporalmente los datos leídos
    // La vista de pago los cargará cuando se renderice
    window.tempScannedData = { negocioId, monto };

    // Mostramos el mensaje de éxito
    messageDiv.textContent = `✅ Leído: ${negocio.nombre}, $${monto.toFixed(2)}. Cargando...`;
    messageDiv.className = "text-center text-green-400 mt-4";
    // Esperamos un momento antes de cambiar de vista para que se vea el mensaje
    setTimeout(() => {
        // Aquí es donde se debería cambiar la vista
        switchView('pago');
        // Y mostrar un mensaje global si es necesario
        // showMessage(`QR leído. Negocio: ${negocio.nombre}, Monto: $${monto.toFixed(2)}`, 'success');
    }, 1500); // Espera 1.5 segundos antes de volver
}
