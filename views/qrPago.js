// views/qrPago.js (Versión antes de cambios posteriores)

function getQRPagoView() {
    if (!window.tempPagoData) {
        showMessage("Error: Datos de pago no encontrados.", 'error');
        switchView('home');
        return `
            <div class="p-8 text-center bg-red-100 text-red-800 rounded-lg">
              Error: No se pudo inicializar la vista.
            </div>
        `;
    }
    const { receiverId, amount } = window.tempPagoData;
    const negocio = usuarios.find(u => u.id === receiverId) || { nombre: 'Negocio (ID Desconocido)' };
    const nombreNegocio = negocio.nombre;

    const qrContainer = document.createElement("div");
    // Asumiendo que qrCodeHtml se genera con new QRCode
    new QRCode(qrContainer, `${receiverId},${amount.toFixed(2)}`);
    const qrCodeHtml = qrContainer.innerHTML;

    return `
    <div class="flex items-center mb-6">
      <button onclick="switchView('pago')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">QR de Pago</h1>
    </div>
    <div class="text-center p-4">
      <h3 class="text-lg font-semibold">Pago a: ${nombreNegocio}</h3>
      <p class="text-sm text-gray-500 mb-2">ID: ${receiverId}</p>
      <p class="text-lg font-bold text-indigo-900">Monto: $${amount.toFixed(2)}</p>
      <div class="flex justify-center">${qrCodeHtml}</div>
      <p class="mt-4 text-sm text-gray-600">El cliente debe escanear este código para pagar.</p>
      <button onclick="switchView('home')"
              class="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
        Volver al Inicio
      </button>
    </div>
  `;
}
