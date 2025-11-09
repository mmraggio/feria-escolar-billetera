// --- FUNCIÓN ACTUALIZADA getQRView ---
function getQRView() {
  // Crear el contenedor donde se generará el QR
  const qrContainerHtml = `<div id="qr-code-container" class="flex justify-center p-4 border border-gray-200 rounded-lg bg-white"></div>`;
  const html = `
    <div class="flex items-center mb-6">
      <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Mi Código QR (Receptor)</h1>
    </div>
    <div class="text-center p-4">
      <h3 class="text-lg font-semibold">${userData?.nombre || 'Desconocido'}</h3>
      <p class="text-sm text-gray-500 mb-4">ID: <span class="font-mono">${userId}</span></p>
      ${qrContainerHtml}
      <div id="qr-error-message" class="mt-2 text-red-500 text-sm hidden">Error al generar el QR. Revisa la consola.</div>
      <p class="mt-4 text-sm text-gray-600">Otro usuario puede escanear este código para transferirte dinero.</p>
    </div>
  `;
  return html;
}

// --- Actualización de la vista QR ---
function updateQRView() {
  if (currentView === 'qr' && userId) {
    // Esperar a que el DOM esté listo usando setTimeout
    setTimeout(() => {
      const container = document.getElementById('qr-code-container');
      const errorDiv = document.getElementById('qr-error-message');
      
      if (container) {
        container.innerHTML = ''; // Limpiar contenedor
        if (errorDiv) errorDiv.classList.add('hidden');
        
        try {
          // Generar QR con la nueva sintaxis
          new QRCode(container, {
            text: userId, // Contenido: Solo el ID del usuario
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
          console.log('QR de ID generado correctamente.');
        } catch (error) {
          console.error('Error al generar QR de ID:', error);
          if (errorDiv) errorDiv.classList.remove('hidden');
        }
      } else {
        console.error('Contenedor QR no encontrado en updateQRView.');
      }
    }, 0); // El timeout de 0ms permite que el DOM se actualice primero
  }
}
