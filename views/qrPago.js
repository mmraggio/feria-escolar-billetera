// --- FUNCIÓN ACTUALIZADA getQRPagoView ---
function getQRPagoView() {
    if (!window.tempPagoData) {
        showMessage("Error: Datos de pago no encontrados.", 'error');
        switchView('home');
        return `<div>Error...</div>`;
    }
    const { receiverId, amount } = window.tempPagoData;
    // Buscar negocio en la lista de usuarios (ahora solo tiene negocios)
    const negocio = usuarios.find(u => u.id === receiverId) || { nombre: 'Negocio (ID Desconocido)' };
    const nombreNegocio = negocio.nombre;

    const qrContainerHtml = `<div id="qr-pago-container" class="flex justify-center p-4 border border-gray-200 rounded-lg bg-white"></div>`;
    const html = `
    <div class="flex items-center mb-6">
      <button onclick="switchView('pago')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">QR de Cobro</h1>
    </div>
    <div class="text-center p-4">
      <h3 class="text-xl font-semibold text-green-700">Monto: $${amount.toFixed(2)}</h3>
      <p class="text-sm text-gray-500 mb-2">Para: ${nombreNegocio} (ID: ${receiverId})</p>
      ${qrContainerHtml}
      <div id="qr-pago-error-message" class="mt-2 text-red-500 text-sm hidden">Error al generar el QR. Revisa la consola.</div>
      <p class="mt-4 text-sm text-gray-600">Este QR contiene el ID del Negocio y el monto. El cliente debe escanearlo para iniciar el pago.</p>
      <button onclick="switchView('home')"
              class="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
        Volver al Inicio
      </button>
    </div>
  `;
  return html;
}

// --- Actualización de la vista QR de Pago ---
function updateQRPagoView() {
  if (currentView === 'qrPago' && window.tempPagoData) {
    const container = document.getElementById('qr-pago-container');
    const errorDiv = document.getElementById('qr-pago-error-message');
    
    if (container) {
        container.innerHTML = ''; // Limpiar
        errorDiv.classList.add('hidden');

        const qrContent = `${window.tempPagoData.receiverId},${window.tempPagoData.amount.toFixed(2)}`;

        try {
            // Generar QR con la nueva sintaxis
            new QRCode(container, {
              text: qrContent, // Contenido: ID_NEGOCIO,MONTO
              width: 200,
              height: 200,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
            console.log('QR de Pago generado correctamente.');

        } catch (error) {
            console.error('Error al generar QR de pago:', error);
            errorDiv.classList.remove('hidden');
        }
    } else {
        console.error('Contenedor QR Pago o tempPagoData no encontrado.');
    }
  }
}
