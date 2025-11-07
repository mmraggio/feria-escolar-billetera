// views/qrPago.js

// --- FUNCIÓN ACTUALIZADA getQRPagoView ---
function getQRPagoView() {
    // Verificar si el rol es 'negocio' al cargar la vista
    if (userData?.rol !== 'negocio') {
        // Mostrar un mensaje de error si no es negocio
        return `
        <div class="flex items-center mb-6">
          <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-800">Generar QR de Cobro</h1>
        </div>
        <div class="text-center p-6">
            <p class="text-red-500 font-bold text-lg">Acceso Denegado</p>
            <p class="text-gray-700 mt-2">Solo los negocios pueden generar QR de cobro.</p>
            <button onclick="switchView('home')"
                    class="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
              Volver al Inicio
            </button>
        </div>
        `;
    }

    // Si es negocio, mostrar la interfaz normal
    const nombreUsuario = userData?.nombre || 'Usuario (ID Desconocido)';
    const rolUsuario = userData?.rol || 'Desconocido';

    // Contenedor para el QR generado (inicialmente vacío)
    const qrContainerHtml = `<div id="qr-pago-container" class="flex justify-center p-4 border border-gray-200 rounded-lg bg-white"></div>`;
    // Contenedor para el mensaje de estado (inicialmente vacío)
    // Este es el contenedor crucial para la notificación
    const statusMessageHtml = `<div id="qr-pago-status" class="text-center mt-2 text-sm"></div>`;

    // HTML para el formulario de generación de QR
    const qrFormHtml = `
        <div class="mb-6">
            <label for="monto-generar-qr" class="block text-sm font-medium text-gray-700">Monto a Cobrar (${CURRENCY_SYMBOL})</label>
            <input type="number" id="monto-generar-qr" placeholder="10.00" required step="0.01" min="0.01"
                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-green-500 focus:border-green-500">
        </div>
        <button type="button" onclick="generarQRPagoDesdeFormulario()" 
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
          Generar QR de Cobro
        </button>
    `;

    const html = `
    <div class="flex items-center mb-6">
      <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Generar QR de Cobro</h1>
    </div>

    <!-- Contenedor del QR generado -->
    ${qrContainerHtml}
    <!-- Mensaje de estado -->
    ${statusMessageHtml}

    <!-- Formulario para generar QR -->
    <form id="generar-qr-form" class="space-y-4 mt-4">
      ${qrFormHtml}
    </form>
  `;
  return html;
}

// ... (resto de las funciones como estaban) ...
